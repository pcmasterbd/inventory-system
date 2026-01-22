"use server";

import { createClient } from "@/lib/supabase/server";

export async function getFinancialStats(startDate?: string, endDate?: string) {
    const supabase = await createClient();

    let salesQuery = supabase.from("invoice_items").select(`
        quantity,
        unit_price,
        product:products(cost_price)
    `);

    // We also need invoice date to filter.
    // Ideally we join invoice_items -> invoices.
    // Supabase simplified query:
    const { data: invoices, error: invError } = await supabase
        .from("invoices")
        .select("id, total_amount, date, paid_amount")
        .gte("date", startDate || "1970-01-01")
        .lte("date", endDate || "2100-01-01")
        .neq("status", "cancelled"); // Exclude cancelled?

    if (invError) {
        console.error(invError);
        return null;
    }

    const invoiceIds = invoices.map(i => i.id);

    // Fetch items for these invoices to calculate COGS
    const { data: items, error: itemError } = await supabase
        .from("invoice_items")
        .select(`
            quantity,
            product_id,
            products(cost_price)
        `)
        .in("invoice_id", invoiceIds);

    if (itemError) {
        console.error(itemError);
        return null;
    }

    // Fetch Expenses
    const { data: expenses, error: expError } = await supabase
        .from("roi_expenses")
        .select("amount, expense_type, date")
        .gte("date", startDate || "1970-01-01")
        .lte("date", endDate || "2100-01-01");

    if (expError) {
        console.error(expError);
        return null;
    }

    // Calculations
    const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);

    // COGS: Sum of (Qty * CostPrice)
    // Note: If Qty is negative (Return), COGS reduces (we got item back).
    let totalCOGS = 0;
    items?.forEach((item: any) => {
        const qty = item.quantity;
        const cost = item.products?.cost_price || 0;
        totalCOGS += (qty * cost);
    });

    // Expenses
    const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

    // Split Expenses
    // We map 'roi_expenses.expense_type' to Fixed vs Daily.
    // Based on ExpenseEntryDialog:
    // Fixed: office_rent, salary, utility, license_purchase
    // Daily: tea_snacks, transport, mobile_bill, repair, cleaning, ad_cost, other, etc.
    const FIXED_TYPES = ["office_rent", "salary", "utility", "license_purchase"];

    const fixedExpenses = expenses
        .filter(e => FIXED_TYPES.includes(e.expense_type))
        .reduce((sum, e) => sum + Number(e.amount), 0);

    const dailyExpenses = totalExpenses - fixedExpenses;

    const netProfit = totalRevenue - totalCOGS - totalExpenses;

    return {
        revenue: totalRevenue,
        cogs: totalCOGS,
        expenses: totalExpenses,
        fixedExpenses,
        dailyExpenses,
        netProfit,
        invoiceCount: invoices.length,
        expenseCount: expenses.length
    };
}

export async function getProductSalesStats(startDate?: string, endDate?: string) {
    const supabase = await createClient();

    // Fetch items with product details
    const { data: items, error } = await supabase
        .from("invoice_items")
        .select(`
            quantity,
            unit_price,
            product_id,
            product:products(name, cost_price, selling_price),
            invoice:invoices(date)
        `)
        .gte("invoice.date", startDate || "1970-01-01")
        .lte("invoice.date", endDate || "2100-01-01");

    if (error) {
        console.error("Error fetching product stats:", error);
        return [];
    }

    const statsMap = new Map<string, {
        productName: string;
        unitsSold: number;
        returnCount: number;
        revenue: number;
        cogs: number;
        costPrice: number;
        sellingPrice: number;
    }>();

    items?.forEach((item: any) => {
        if (!item.product) return;

        const pid = item.product_id;
        const current = statsMap.get(pid) || {
            productName: item.product.name,
            unitsSold: 0,
            returnCount: 0,
            revenue: 0,
            cogs: 0,
            costPrice: item.product.cost_price || 0, // Current cost price (Snapshot might be better ideally)
            sellingPrice: item.product.selling_price
        };

        const qty = item.quantity; // Positive for Sale, Negative for Return
        const price = item.unit_price;
        const cost = current.costPrice;

        if (qty < 0) {
            // Return
            current.returnCount += Math.abs(qty);
            // Revenue reduces
            current.revenue += (qty * price);
            // COGS reduces (we got item back)
            current.cogs += (qty * cost);
        } else {
            // Sale
            current.unitsSold += qty;
            current.revenue += (qty * price);
            current.cogs += (qty * cost);
        }

        statsMap.set(pid, current);
    });

    // Transform to array
    return Array.from(statsMap.values()).map(stat => ({
        name: stat.productName,
        unitsSold: stat.unitsSold,
        returnCount: stat.returnCount,
        actualSold: stat.unitsSold - stat.returnCount,
        revenue: stat.revenue,
        totalRevenue: stat.revenue, // Same as revenue in this context
        perUnitCOGS: stat.costPrice,
        totalCOGS: stat.cogs,
        grossProfit: stat.revenue - stat.cogs
    }));
}
