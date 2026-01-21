import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { SummaryCards } from "@/components/roi/SummaryCards";
import { RoiChart } from "@/components/roi/RoiChart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DateFilter } from "@/components/reports/DateFilter";
import { ExportButtons } from "@/components/reports/ExportButtons";
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
    // We join with 'invoices' to filter by Date and Status
    // We join with 'products' to get Cost Price (for Margin calc)
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
        .neq('invoices.status', 'cancelled') // Exclude cancelled orders
        .gte("invoices.date", startPeriod)
        .lte("invoices.date", endPeriod);

    if (itemsError) {
        console.error("ROI: Invoice Items Fetch Error", itemsError);
    }

    // 2. Fetch Operational Expenses (Transactions where type = expense)
    const { data: expenses, error: expenseError } = await supabase
        .from("transactions")
        .select("*")
        .eq('user_id', user.id)
        .eq('transaction_type', 'expense')
        .gte("date", startPeriod)
        .lte("date", endPeriod);

    if (expenseError) {
        console.error("ROI: Expenses Fetch Error", expenseError);
    }


    // --- Calculate Metrics ---

    let totalSalesUnits = 0;
    let totalRevenue = 0;
    let totalCOGS = 0;

    // Aggregation by Product
    const productPerformance = new Map();

    // Aggregation by Date (for Chart)
    const chartDataMap = new Map();


    invoiceItems?.forEach((item) => {
        // @ts-ignore
        const productData = item.products;
        const product = Array.isArray(productData) ? productData[0] : productData;
        // @ts-ignore
        const invoiceDate = item.invoices?.date.split('T')[0]; // Extract YYYY-MM-DD

        if (!product) return;

        const quantity = item.quantity || 0;
        const revenue = quantity * (item.unit_price || 0); // Sold Price
        const cogs = quantity * (product.cost_price || 0); // Cost Price

        totalSalesUnits += quantity;
        totalRevenue += revenue;
        totalCOGS += cogs;

        // 1. Product Table Data
        if (!productPerformance.has(item.product_id)) {
            productPerformance.set(item.product_id, {
                name: product.name,
                units: 0,
                revenue: 0,
                cogs: 0,
                grossProfit: 0
            });
        }
        const prodStats = productPerformance.get(item.product_id);
        prodStats.units += quantity;
        prodStats.revenue += revenue;
        prodStats.cogs += cogs;
        prodStats.grossProfit += (revenue - cogs);

        // 2. Chart Data (Revenue & Gross Profit)
        if (!chartDataMap.has(invoiceDate)) {
            chartDataMap.set(invoiceDate, { date: invoiceDate, revenue: 0, profit: 0, expense: 0 });
        }
        const chartEntry = chartDataMap.get(invoiceDate);
        chartEntry.revenue += revenue;
        chartEntry.profit += (revenue - cogs); // Adding Gross Profit initially
    });

    // Process Expenses
    let totalExpense = 0;
    expenses?.forEach((exp) => {
        const amount = Number(exp.amount);
        const expDate = exp.date.split('T')[0];

        totalExpense += amount;

        // Chart Data (Expense)
        if (!chartDataMap.has(expDate)) {
            chartDataMap.set(expDate, { date: expDate, revenue: 0, profit: 0, expense: 0 });
        }
        const chartEntry = chartDataMap.get(expDate);
        chartEntry.expense += amount;
    });

    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpense;

    // Finalize Table Data
    const roiData = Array.from(productPerformance.values()).map(p => {
        const roi = p.cogs > 0 ? (p.grossProfit / p.cogs) * 100 : 0;
        return { ...p, roi };
    }).sort((a, b) => b.roi - a.roi);

    // Finalize Chart Data (Net Profit = Gross Profit - Expense)
    const chartData = Array.from(chartDataMap.values())
        .map((item) => ({
            ...item,
            profit: item.profit - item.expense
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    // --- Prepare Export Data ---
    const financialReport = roiData.map(item => ({
        Product: item.name,
        Units_Sold: item.units,
        Revenue: item.revenue.toFixed(2),
        COGS: item.cogs.toFixed(2),
        Profit: item.grossProfit.toFixed(2),
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
                </div>
            </div>

            <SummaryCards
                totalSales={totalSalesUnits}
                totalRevenue={totalRevenue}
                totalExpense={totalExpense}
                netProfit={netProfit}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <RoiChart data={chartData} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>পণ্য কর্মক্ষমতা (Product Performance)</CardTitle>
                    <CardDescription>লাভের হার এবং আয় বিশ্লেষণ (From Invoices & Product Cost)</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>পণ্যের নাম (Item)</TableHead>
                                <TableHead className='text-right'>বিক্রয় সংখ্যা (Units)</TableHead>
                                <TableHead className='text-right'>মোট আয় (Revenue)</TableHead>
                                <TableHead className='text-right'>কেনা খরচ (COGS)</TableHead>
                                <TableHead className='text-right'>মোট লাভ (Profit)</TableHead>
                                <TableHead className='text-right'>ROI %</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roiData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">কোনো ডেটা পাওয়া যায়নি (No Data Found)</TableCell>
                                </TableRow>
                            ) : (
                                roiData.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className='text-right'>{item.units}</TableCell>
                                        <TableCell className='text-right'>৳{item.revenue.toLocaleString()}</TableCell>
                                        <TableCell className='text-right'>৳{item.cogs.toLocaleString()}</TableCell>
                                        <TableCell className='text-right font-bold text-green-600'>৳{item.grossProfit.toLocaleString()}</TableCell>
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
        </div>
    );
}
