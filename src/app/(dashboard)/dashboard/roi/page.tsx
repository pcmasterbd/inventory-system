import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { SummaryCards } from "@/components/roi/SummaryCards";
import { RoiChart } from "@/components/roi/RoiChart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DateFilter } from "@/components/reports/DateFilter";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { AdSpendDialog } from "@/components/roi/AdSpendDialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

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

    // --- Filter Logic ---
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

    // 1. Fetch Sales (Invoice Items)
    const { data: invoiceItems, error: itemsError } = await supabase
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

    if (itemsError) console.error("ROI: Invoice Items Error", itemsError);

    // 2. Fetch Operational Expenses
    const { data: expenses, error: expenseError } = await supabase
        .from("transactions")
        .select("*")
        .eq('user_id', user.id)
        .eq('transaction_type', 'expense')
        .gte("date", startPeriod)
        .lte("date", endPeriod);

    if (expenseError) console.error("ROI: Expenses Error", expenseError);

    // 3. Fetch Ad Spends
    const { data: adSpends, error: adsError } = await supabase
        .from("product_ad_spends")
        .select("*")
        .eq('user_id', user.id)
        .gte("date", startPeriod)
        .lte("date", endPeriod);

    // Suppress error if table doesn't exist yet (Migration pending)
    if (adsError && adsError.code !== '42P01') {
        console.error("ROI: Ad Spends Error", adsError);
    }
    const safeAdSpends = adSpends || [];

    // 4. Fetch Products (For Dropdown in Dialog)
    const { data: products } = await supabase.from("products").select("id, name").eq('user_id', user.id);


    // --- Calculate Metrics ---

    let totalSalesUnits = 0;
    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalAdSpend = 0;

    // Aggregation by Product
    const productPerformance = new Map();

    // Aggregation by Date (for Chart)
    const chartDataMap = new Map();


    // A. Process Sales (Revenue & COGS)
    invoiceItems?.forEach((item) => {
        // @ts-ignore
        const productData = item.products;
        const product = Array.isArray(productData) ? productData[0] : productData;
        // @ts-ignore
        const invoiceDate = item.invoices?.date.split('T')[0];

        if (!product) return;

        const quantity = item.quantity || 0;
        const revenue = quantity * (item.unit_price || 0);

        // Use historical cost if available, otherwise fallback to current master cost
        // @ts-ignore
        const unitCost = item.cost_price !== undefined && item.cost_price !== null ? item.cost_price : product.cost_price;
        const cogs = quantity * (unitCost || 0);

        totalSalesUnits += quantity;
        totalRevenue += revenue;
        totalCOGS += cogs;

        // Product Table Update
        if (!productPerformance.has(item.product_id)) {
            productPerformance.set(item.product_id, {
                name: product.name,
                units: 0,
                revenue: 0,
                cogs: 0,
                adCost: 0,
                grossProfit: 0 // Rev - COGS
            });
        }
        const prodStats = productPerformance.get(item.product_id);
        prodStats.units += quantity;
        prodStats.revenue += revenue;
        prodStats.cogs += cogs;
        prodStats.grossProfit += (revenue - cogs); // Temporary Gross

        // Chart Update
        if (!chartDataMap.has(invoiceDate)) {
            chartDataMap.set(invoiceDate, { date: invoiceDate, revenue: 0, profit: 0, expense: 0 });
        }
        const chartEntry = chartDataMap.get(invoiceDate);
        chartEntry.revenue += revenue;
        chartEntry.profit += (revenue - cogs);
    });

    // B. Process Ad Spends
    adSpends?.forEach((ad) => {
        const amount = Number(ad.amount_bdt);
        const date = ad.date.split('T')[0];

        totalAdSpend += amount;

        // Distribute to Product Stats
        if (ad.product_id && productPerformance.has(ad.product_id)) {
            const prodStats = productPerformance.get(ad.product_id);
            prodStats.adCost += amount;
        } else if (ad.product_id) {
            // If product had no sales but has ads (rare but possible)
            // We ideally should fetch name, but for now skipped or need manual lookup if map checks fail
            // Checking if we have it in product list
            const pName = products?.find(p => p.id === ad.product_id)?.name || "Unknown";
            if (!productPerformance.has(ad.product_id)) {
                productPerformance.set(ad.product_id, {
                    name: pName,
                    units: 0,
                    revenue: 0,
                    cogs: 0,
                    adCost: 0,
                    grossProfit: 0
                });
            }
            productPerformance.get(ad.product_id).adCost += amount;
        }

        // Chart Update (Treat Ads as Expense reducing profit)
        if (!chartDataMap.has(date)) {
            chartDataMap.set(date, { date: date, revenue: 0, profit: 0, expense: 0 });
        }
        const chartEntry = chartDataMap.get(date);
        chartEntry.profit -= amount; // Reduce daily profit by ad spend
    });

    // C. Process Operational Expenses
    let totalOpExpense = 0;
    expenses?.forEach((exp) => {
        const amount = Number(exp.amount);
        const date = exp.date.split('T')[0];

        totalOpExpense += amount;

        if (!chartDataMap.has(date)) {
            chartDataMap.set(date, { date: date, revenue: 0, profit: 0, expense: 0 });
        }
        const chartEntry = chartDataMap.get(date);
        chartEntry.profit -= amount; // Reduce daily profit
        chartEntry.expense += amount;
    });

    // Final Calculations
    const totalMarketingAndCOGS = totalCOGS + totalAdSpend;
    const grossProfitAfterAds = totalRevenue - totalMarketingAndCOGS;
    const netProfit = grossProfitAfterAds - totalOpExpense;

    // Finalize Table Data
    const roiData = Array.from(productPerformance.values()).map(p => {
        const totalInvestment = p.cogs + p.adCost;
        const netProfit = p.revenue - totalInvestment; // Product Net Profit (ignoring shared op expenses)
        const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

        return {
            ...p,
            netProfit,
            roi
        };
    }).sort((a, b) => b.roi - a.roi);

    // Finalize Chart Data
    const chartData = Array.from(chartDataMap.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    // --- Prepare Export Data ---
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
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight">আর্থিক ড্যাশবোর্ড (ROI & Snapshot)</h2>
                <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:ml-auto justify-end w-full md:w-auto">
                    <ExportButtons
                        data={financialReport}
                        fileName={`financial-report-${view}-${year}-${month}`}
                        pdfTitle="Financial Report (ROI)"
                    />
                    <Suspense fallback={null}>
                        <DateFilter />
                    </Suspense>
                    <AdSpendDialog products={products || []} />
                </div>
            </div>

            <SummaryCards
                totalSales={totalSalesUnits}
                totalRevenue={totalRevenue}
                totalExpense={totalOpExpense + totalAdSpend} // Showing Total Expense (Ops + Ads)
                netProfit={netProfit}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <RoiChart data={chartData} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>পণ্য কর্মক্ষমতা (Product Performance)</CardTitle>
                    <CardDescription>
                        আয়, খরচ (COGS + Ads), এবং লাভ বিশ্লেষণ
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>পণ্যের নাম (Item)</TableHead>
                                <TableHead className='text-right'>বিক্রয় (Units)</TableHead>
                                <TableHead className='text-right'>আয় (Revenue)</TableHead>
                                <TableHead className='text-right'>COGS</TableHead>
                                <TableHead className='text-right'>Ads Cost</TableHead>
                                <TableHead className='text-right'>Net Profit</TableHead>
                                <TableHead className='text-right'>ROI %</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roiData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">কোনো ডেটা পাওয়া যায়নি (No Data Found)</TableCell>
                                </TableRow>
                            ) : (
                                roiData.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className='text-right'>{item.units}</TableCell>
                                        <TableCell className='text-right'>৳{item.revenue.toLocaleString()}</TableCell>
                                        <TableCell className='text-right'>৳{item.cogs.toLocaleString()}</TableCell>
                                        <TableCell className='text-right'>৳{item.adCost.toLocaleString()}</TableCell>
                                        <TableCell className={`text-right font-bold ${item.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ৳{item.netProfit.toLocaleString()}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Badge variant={item.roi > 50 ? 'default' : item.roi > 0 ? 'secondary' : 'destructive'}>
                                                {item.roi.toFixed(1)}%
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div >
    );
}
