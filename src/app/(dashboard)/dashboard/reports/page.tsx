import { createClient } from "@/lib/supabase/server";
import { ReportsAnalysis } from "@/components/reports/ReportsAnalysis";
import { SalesBreakdown } from "@/components/reports/SalesBreakdown";
import { ReportsClient } from "@/components/reports/ReportsClient";
import { getFinancialData } from "@/app/actions/financials";
import { format, subDays, startOfMonth, startOfYesterday, subMonths, endOfMonth, startOfDay, endOfDay } from "date-fns";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ range?: string, account?: string, category?: string }> }) {
    const params = await searchParams;
    const supabase = await createClient();

    const { accounts, categories, snapshot } = await getFinancialData({
        range: params.range,
        account_id: params.account,
        category: params.category
    });

    // Date Logic for Report Queries
    const today = new Date();
    let startDate = startOfDay(today);
    let endDate = endOfDay(today);
    const range = params.range || "today";

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

    // 1. Fetch Invoices (Filtered)
    const { data: invoices } = await supabase
        .from('invoices')
        .select('id, total_amount, created_at, paid_amount')
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStrIncludeTime)
        .order('created_at', { ascending: true });

    // 2. Fetch Invoice Items (Filtered by Invoice IDs fetched above)
    const invoiceIds = invoices?.map(inv => inv.id) || [];
    let items: any[] = [];

    if (invoiceIds.length > 0) {
        const { data: fetchedItems } = await supabase
            .from('invoice_items')
            .select(`
                invoice_id,
                quantity,
                product_id,
                unit_price,
                products (id, name, cost_price)
            `)
            .in('invoice_id', invoiceIds);
        items = fetchedItems || [];
    }

    // Map items...
    const itemsByInvoice = new Map();
    items?.forEach(item => {
        const invId = item.invoice_id;
        if (!itemsByInvoice.has(invId)) {
            itemsByInvoice.set(invId, []);
        }
        itemsByInvoice.get(invId).push(item);
    });

    // 3. Fetch Expenses (Filtered)
    const { data: expenses } = await supabase
        .from('roi_expenses')
        .select('amount, expense_type, date')
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true });

    // Constants for Expense Types
    const FIXED_TYPES = ["office_rent", "salary", "utility", "license_purchase", "fixed"];

    // --- SALES BREAKDOWN CALCULATION ---
    const productStats = new Map<string, {
        name: string;
        unitsSold: number;
        returnCount: number;
        actualSold: number;
        revenue: number;
        totalCOGS: number;
        grossProfit: number;
    }>();

    items?.forEach((item: any) => {
        const productId = item.product_id;
        const productName = item.products?.name || 'Unknown Product';
        const costPrice = item.products?.cost_price || 0;
        const qty = item.quantity; // Can be negative
        const unitPrice = item.unit_price;

        if (!productStats.has(productId)) {
            productStats.set(productId, {
                name: productName,
                unitsSold: 0,
                returnCount: 0,
                actualSold: 0,
                revenue: 0,
                totalCOGS: 0,
                grossProfit: 0
            });
        }

        const stats = productStats.get(productId)!;

        if (qty < 0) {
            // It's a return
            stats.returnCount += Math.abs(qty);
            // Revenue decreases (negative revenue)
            stats.revenue += (qty * unitPrice);
            // COGS decreases (negative cost) because we got the item back
            stats.totalCOGS += (qty * costPrice);
        } else {
            // It's a sale
            stats.unitsSold += qty;
            stats.revenue += (qty * unitPrice);
            stats.totalCOGS += (qty * costPrice);
        }

        // Recalculate derived
        stats.actualSold = stats.unitsSold - stats.returnCount;
        stats.grossProfit = stats.revenue - stats.totalCOGS;
    });

    const salesBreakdownData = Array.from(productStats.values()).map(stat => ({
        ...stat,
        totalRevenue: stat.revenue, // Mapping for component
        perUnitCOGS: 0 // Not effectively used in aggregate, can be skipped or avg
    }));


    // --- MONTHLY ANALYSIS CALCULATION ---
    const monthlyStats = new Map<string, {
        sales: number;
        cogs: number;
        expenses: number;
        fixedExpenses: number;
        dailyExpenses: number;
        adCost: number;
    }>();

    const getMonthKey = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    };

    const getInitStats = () => ({ sales: 0, cogs: 0, expenses: 0, fixedExpenses: 0, dailyExpenses: 0, adCost: 0 });

    (invoices || []).forEach(inv => {
        const key = getMonthKey(inv.created_at);
        const current = monthlyStats.get(key) || getInitStats();

        // Revenue
        current.sales += Number(inv.total_amount || 0);

        // COGS
        const invItems = itemsByInvoice.get(inv.id) || [];
        invItems.forEach((item: any) => {
            const qty = item.quantity;
            const cost = item.products?.cost_price || 0;
            current.cogs += (qty * cost);
        });

        monthlyStats.set(key, current);
    });

    (expenses || []).forEach(exp => {
        const key = getMonthKey(exp.date);
        const current = monthlyStats.get(key) || getInitStats();
        const amount = Number(exp.amount || 0);

        current.expenses += amount;

        if (FIXED_TYPES.includes(exp.expense_type)) {
            current.fixedExpenses += amount;
        } else {
            current.dailyExpenses += amount;
        }

        if (exp.expense_type === 'ad_cost') {
            current.adCost += amount;
        }
        monthlyStats.set(key, current);
    });

    const monthlyData = Array.from(monthlyStats.entries()).map(([month, data]) => ({
        month,
        sales: data.sales,
        expenses: data.expenses,
        profit: data.sales - data.cogs - data.expenses,
        adCost: data.adCost,
        fixedExpenses: data.fixedExpenses,
        dailyExpenses: data.dailyExpenses
    }));

    // Totals
    const totalSales = monthlyData.reduce((sum, d) => sum + d.sales, 0);
    const totalExpenses = monthlyData.reduce((sum, d) => sum + d.expenses, 0);
    const totalAdSpend = monthlyData.reduce((sum, d) => sum + d.adCost, 0);
    const netProfit = monthlyData.reduce((sum, d) => sum + d.profit, 0);
    const roi = totalAdSpend > 0 ? (netProfit / totalAdSpend) * 100 : 0;

    const summary = {
        totalSales,
        totalExpenses,
        netProfit,
        totalAdSpend,
        roi
    };

    return (
        <ReportsClient
            monthlyData={monthlyData}
            summary={summary}
            productStats={salesBreakdownData}
            accounts={accounts}
            categories={categories}
            snapshot={snapshot}
        />
    );
}
