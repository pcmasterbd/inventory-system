import { createClient } from "@/lib/supabase/server";
import { ReportsAnalysis } from "@/components/reports/ReportsAnalysis";
import { SalesBreakdown } from "@/components/reports/SalesBreakdown";

export default async function ReportsPage() {
    const supabase = await createClient();

    // 1. Fetch Invoices
    const { data: invoices } = await supabase
        .from('invoices')
        .select('id, total_amount, created_at, paid_amount')
        .order('created_at', { ascending: true });

    // 2. Fetch Invoice Items for COGS & Breakdown
    const { data: items } = await supabase
        .from('invoice_items')
        .select(`
            invoice_id,
            quantity,
            product_id,
            unit_price,
            products (id, name, cost_price)
        `);

    // Map items to invoices for easier processing
    const itemsByInvoice = new Map();
    items?.forEach(item => {
        const invId = item.invoice_id;
        if (!itemsByInvoice.has(invId)) {
            itemsByInvoice.set(invId, []);
        }
        itemsByInvoice.get(invId).push(item);
    });

    // 3. Fetch Expenses
    const { data: expenses } = await supabase
        .from('roi_expenses')
        .select('amount, expense_type, date')
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
        <div className="space-y-8 p-4 md:p-8 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">রিপোর্ট (Reports)</h1>
                    <p className="text-muted-foreground mt-1">
                        মাসিক লাভ-ক্ষতি এবং ROI বিশ্লেষণ। (Net Profit = Sales - COGS - Expenses)
                    </p>
                </div>
            </div>

            <ReportsAnalysis monthlyData={monthlyData} summary={summary} />

            <div className="pt-4">
                <SalesBreakdown data={salesBreakdownData} />
            </div>
        </div>
    );
}
