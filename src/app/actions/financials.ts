"use server";

import { createClient } from "@/lib/supabase/server";
import { format, subDays, startOfMonth, startOfYesterday, subMonths, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { SaaSStats, ChartDataEntry } from "@/lib/types";

export async function getFinancialData(params: {
    range?: string;
    account_id?: string;
    category?: string;
}) {
    const supabase = await createClient();
    const { range = "today", account_id: accountFilter, category: categoryFilter } = params;

    // Date Range Logic
    const today = new Date();
    let startDate = startOfDay(today);
    let endDate = endOfDay(today);

    if (range === 'yesterday') {
        startDate = startOfYesterday();
        endDate = endOfDay(subDays(today, 1));
    } else if (range === 'last_7_days') {
        startDate = startOfDay(subDays(today, 6));
        endDate = endOfDay(today);
    } else if (range === 'this_month') {
        startDate = startOfMonth(today);
        endDate = endOfDay(today);
    } else if (range === 'last_month') {
        startDate = startOfMonth(subMonths(today, 1));
        endDate = endOfMonth(subMonths(today, 1));
    } else if (range === 'all_time') {
        startDate = new Date(0);
        endDate = endOfDay(today);
    }

    const startDateStr = format(startDate, "yyyy-MM-dd");
    const endDateStr = format(endDate, "yyyy-MM-dd");
    const endDateStrIncludeTime = endDate.toISOString();

    // 1. Fetch Accounts
    const { data: accounts } = await supabase.from('accounts').select('*');
    const totalBalance = (accounts || []).reduce((sum, acc) => sum + Number(acc.balance || 0), 0);

    // 2. Fetch Transactions
    let transactionQuery = supabase
        .from('transactions')
        .select('*')
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: false });

    if (accountFilter && accountFilter !== 'all') {
        transactionQuery = transactionQuery.eq('account_id', accountFilter);
    }
    if (categoryFilter && categoryFilter !== 'all') {
        transactionQuery = transactionQuery.eq('category', categoryFilter);
    }

    const { data: transactions } = await transactionQuery;

    // 3. Fetch ROI Expenses
    let expensesQuery = supabase
        .from('roi_expenses')
        .select('*')
        .gte('date', startDateStr)
        .lte('date', endDateStr);

    if (categoryFilter && categoryFilter !== 'all') {
        expensesQuery = expensesQuery.eq('expense_type', categoryFilter);
    }

    const { data: roiExpenses } = await expensesQuery;

    // 4. Fetch Invoices (Revenue & COGS)
    let invoicesQuery = supabase
        .from('invoices')
        .select(`
            id, 
            total_amount, 
            created_at,
            invoice_items (
                quantity,
                products (cost_price)
            )
        `)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStrIncludeTime);

    const { data: invoices } = await invoicesQuery;

    // 5. Fetch Ad Costs
    let adCostsQuery = supabase
        .from('product_ad_spends')
        .select('date, amount_dollar, exchange_rate')
        .gte('date', startDateStr)
        .lte('date', endDateStr);

    const { data: adCosts } = await adCostsQuery;

    // 6. Settings for Dollar Rate
    const { data: settings } = await supabase.from('settings').select('*').single();
    const globalDollarRate = Number(settings?.dollar_rate || 120);

    // --- CALCULATIONS ---
    let totalRevenue = 0;
    let totalCOGS = 0;

    invoices?.forEach((inv: any) => {
        totalRevenue += Number(inv.total_amount || 0);
        inv.invoice_items?.forEach((item: any) => {
            const qty = item.quantity || 0;
            const cost = item.products?.cost_price || 0;
            totalCOGS += (qty * cost);
        });
    });

    const FIXED_CATS = ["office_rent", "salary", "utility", "license_purchase", "fixed"];
    let marketingCosts = 0;
    adCosts?.forEach((ad: any) => {
        const rate = Number(ad.exchange_rate) || globalDollarRate;
        marketingCosts += Number(ad.amount_dollar || 0) * rate;
    });

    let fixedCosts = 0;
    let operationalExpenses = 0;
    let miscCosts = 0;
    let totalCashOut = 0;

    roiExpenses?.forEach((exp: any) => {
        totalCashOut += Number(exp.amount || 0);
        if (FIXED_CATS.includes(exp.expense_type)) {
            fixedCosts += Number(exp.amount || 0);
        } else if (!["personal_withdrawal", "family_expense", "medical", "other_personal", "personal", "equipment", "furniture", "electronics", "other_asset", "assets"].includes(exp.expense_type)) {
            operationalExpenses += Number(exp.amount || 0);
        }
    });

    transactions?.forEach((tx: any) => {
        if (tx.transaction_type === 'expense') {
            totalCashOut += Number(tx.amount || 0);
            if (tx.category !== 'Inventory Purchase') {
                miscCosts += Number(tx.amount || 0);
            }
        }
    });

    const totalDailyOperational = operationalExpenses + miscCosts + marketingCosts;
    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalDailyOperational - fixedCosts;

    const stats: SaaSStats = {
        totalRevenue,
        operationalExpenses: totalDailyOperational,
        fixedCosts,
        miscCosts: operationalExpenses + miscCosts,
        marketingCosts,
        grossProfit,
        netProfit,
        currentBalance: totalBalance,
        grossMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
        netProfitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
        operatingRatio: totalRevenue > 0 ? ((totalDailyOperational + fixedCosts) / totalRevenue) * 100 : 0,
        profitStatus: netProfit >= 0 ? 'Profitable' : 'Loss',
        totalCOGS,
    };

    // --- CHART DATA ---
    const diffTime = range === 'all_time' ? 30 : Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const chartDataMap = new Map<string, ChartDataEntry>();

    const chartStartDate = range === 'all_time' ? subDays(today, 29) : startDate;

    for (let i = 0; i < (range === 'all_time' ? 30 : diffDays); i++) {
        const d = new Date(chartStartDate);
        d.setDate(d.getDate() + i);
        const dateStr = format(d, "yyyy-MM-dd");
        chartDataMap.set(dateStr, { date: format(d, "dd MMM"), revenue: 0, cogs: 0, expenses: 0 });
    }

    invoices?.forEach((inv: any) => {
        const dateStr = format(new Date(inv.created_at), "yyyy-MM-dd");
        if (chartDataMap.has(dateStr)) {
            const entry = chartDataMap.get(dateStr)!;
            entry.revenue += Number(inv.total_amount || 0);
            inv.invoice_items?.forEach((item: any) => {
                entry.cogs += (item.quantity * (item.products?.cost_price || 0));
            });
        }
    });

    transactions?.forEach((tx: any) => {
        if (tx.transaction_type === 'expense' && chartDataMap.has(tx.date)) {
            chartDataMap.get(tx.date)!.expenses += Number(tx.amount || 0);
        }
    });

    roiExpenses?.forEach((exp: any) => {
        const dateStr = format(new Date(exp.date), "yyyy-MM-dd");
        if (chartDataMap.has(dateStr)) {
            chartDataMap.get(dateStr)!.expenses += Number(exp.amount || 0);
        }
    });

    adCosts?.forEach((ad: any) => {
        const dateStr = ad.date.split('T')[0];
        const rate = Number(ad.exchange_rate) || globalDollarRate;
        if (chartDataMap.has(dateStr)) {
            chartDataMap.get(dateStr)!.expenses += Number(ad.amount_dollar || 0) * rate;
        }
    });

    const chartData = Array.from(chartDataMap.values());

    // --- FETCH CATEGORIES ---
    const { data: allTransactions } = await supabase.from('transactions').select('category');
    const { data: allRoiExpenses } = await supabase.from('roi_expenses').select('expense_type');

    const transCats = allTransactions?.map(t => t.category).filter(Boolean) || [];
    const expCats = allRoiExpenses?.map(e => e.expense_type).filter(Boolean) || [];
    const categories = Array.from(new Set([...transCats, ...expCats]));

    const snapshot = {
        total_sales: stats.totalRevenue,
        total_expenses: stats.operationalExpenses + stats.fixedCosts,
        net_funds_flow: stats.totalRevenue - totalCashOut,
        daily_profit_loss: stats.netProfit
    };

    return {
        stats,
        chartData,
        accounts: accounts || [],
        transactions: (transactions || []),
        totalCashOut,
        roiExpenses: roiExpenses || [],
        categories,
        snapshot
    };
}
