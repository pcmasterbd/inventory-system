import { createClient } from "@/lib/supabase/server";
import { RoiClient } from "@/components/roi/RoiClient";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function RoiPage(props: PageProps) {
    const searchParams = await props.searchParams
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return <div>Please log in to view this page.</div>
    }

    const view = (searchParams?.view as string) || "monthly"
    const year = (searchParams?.year as string) || new Date().getFullYear().toString()
    const month = (searchParams?.month as string) || (new Date().getMonth() + 1).toString().padStart(2, '0')

    let startPeriod, endPeriod

    if (view === 'monthly') {
        startPeriod = `${year}-${month}-01`
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
        endPeriod = `${year}-${month}-${lastDay}`
    } else {
        startPeriod = `${year}-01-01`
        endPeriod = `${year}-12-31`
    }

    const { data: invoiceItems } = await supabase
        .from("invoice_items")
        .select(`
            quantity,
            unit_price,
            product_id,
            invoices!inner (
                date,
                status
            ),
            products (
                name,
                cost_price
            )
        `)
        .eq('user_id', user.id)
        .neq('invoices.status', 'cancelled')
        .gte("invoices.date", startPeriod)
        .lte("invoices.date", endPeriod);

    const { data: transactionsErr } = await supabase
        .from("transactions")
        .select("*")
        .eq('user_id', user.id)
        .eq('transaction_type', 'expense')
        .gte("date", startPeriod)
        .lte("date", endPeriod);

    const { data: manualExpenses } = await supabase
        .from("roi_expenses")
        .select("*")
        .eq('user_id', user.id)
        .gte("date", startPeriod)
        .lte("date", endPeriod);

    const { data: adSpends } = await supabase
        .from("product_ad_spends")
        .select("*")
        .eq('user_id', user.id)
        .gte("date", startPeriod)
        .lte("date", endPeriod);

    const { data: products } = await supabase.from("products").select("id, name").eq('user_id', user.id);

    let totalSalesUnits = 0;
    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalAdSpend = 0;

    const productPerformance = new Map();
    const chartDataMap = new Map();

    invoiceItems?.forEach((item: any) => {
        const product = item.products;
        const invoiceDate = item.invoices?.date.split('T')[0];
        if (!product) return;
        const quantity = item.quantity || 0;
        const revenue = quantity * (item.unit_price || 0);
        const unitCost = item.cost_price !== undefined && item.cost_price !== null ? item.cost_price : product.cost_price;
        const cogs = quantity * (unitCost || 0);
        totalSalesUnits += quantity;
        totalRevenue += revenue;
        totalCOGS += cogs;
        if (!productPerformance.has(item.product_id)) {
            productPerformance.set(item.product_id, {
                name: product.name,
                units: 0,
                revenue: 0,
                cogs: 0,
                adCost: 0,
                grossProfit: 0
            });
        }
        const prodStats = productPerformance.get(item.product_id);
        prodStats.units += quantity;
        prodStats.revenue += revenue;
        prodStats.cogs += cogs;
        prodStats.grossProfit += (revenue - cogs);
        if (!chartDataMap.has(invoiceDate)) {
            chartDataMap.set(invoiceDate, { date: invoiceDate, revenue: 0, profit: 0, expense: 0 });
        }
        const chartEntry = chartDataMap.get(invoiceDate);
        chartEntry.revenue += revenue;
        chartEntry.profit += (revenue - cogs);
    });

    adSpends?.forEach((ad: any) => {
        const amount = Number(ad.amount_bdt) || (Number(ad.amount_dollar || 0) * (Number(ad.exchange_rate) || 120));
        const date = ad.date.split('T')[0];
        totalAdSpend += amount;
        if (ad.product_id && productPerformance.has(ad.product_id)) {
            productPerformance.get(ad.product_id).adCost += amount;
        }
        if (!chartDataMap.has(date)) {
            chartDataMap.set(date, { date: date, revenue: 0, profit: 0, expense: 0 });
        }
        chartDataMap.get(date).profit -= amount;
    });

    let totalOpExpense = 0;
    transactionsErr?.forEach((exp: any) => {
        if (exp.category === 'Inventory Purchase') return;
        const amount = Number(exp.amount);
        const date = exp.date.split('T')[0];
        totalOpExpense += amount;
        if (!chartDataMap.has(date)) chartDataMap.set(date, { date, revenue: 0, profit: 0, expense: 0 });
        chartDataMap.get(date).profit -= amount;
        chartDataMap.get(date).expense += amount;
    });

    manualExpenses?.forEach((exp: any) => {
        const type = exp.expense_type;
        if (["personal_withdrawal", "family_expense", "medical", "other_personal", "personal"].includes(type)) return;
        if (["equipment", "furniture", "electronics", "other_asset", "assets"].includes(type)) return;
        const amount = Number(exp.amount);
        const date = exp.date.split('T')[0];
        totalOpExpense += amount;
        if (!chartDataMap.has(date)) chartDataMap.set(date, { date, revenue: 0, profit: 0, expense: 0 });
        chartDataMap.get(date).profit -= amount;
        chartDataMap.get(date).expense += amount;
    });

    const netProfit = totalRevenue - totalCOGS - totalAdSpend - totalOpExpense;

    const roiData = Array.from(productPerformance.values()).map(p => {
        const totalInvestment = p.cogs + p.adCost;
        const netProfit = p.revenue - totalInvestment;
        const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
        return { ...p, netProfit, roi };
    }).sort((a, b) => b.roi - a.roi);

    const chartData = Array.from(chartDataMap.values()).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const financialReport = roiData.map(item => ({
        Product: item.name,
        Units_Sold: item.units,
        Revenue: item.revenue.toFixed(2),
        COGS: item.cogs.toFixed(2),
        Ads_Cost: item.adCost.toFixed(2),
        Net_Profit: item.netProfit.toFixed(2),
        ROI_Percent: item.roi.toFixed(2) + '%'
    }));

    return (
        <RoiClient
            totalSalesUnits={totalSalesUnits}
            totalRevenue={totalRevenue}
            totalOpExpense={totalOpExpense}
            totalAdSpend={totalAdSpend}
            netProfit={netProfit}
            roiData={roiData}
            chartData={chartData}
            financialReport={financialReport}
            products={products || []}
            view={view}
            year={year}
            month={month}
        />
    );
}
