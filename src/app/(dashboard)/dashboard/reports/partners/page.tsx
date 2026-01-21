import { createClient } from "@/lib/supabase/server"
import { format, differenceInMonths, isValid, parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { AlertCircle } from "lucide-react"

export default async function PartnerReportPage() {
    const supabase = await createClient()

    // 1. Fetch Investments
    const { data: investmentsData } = await supabase.from('investments').select('*').eq('status', 'active')
    const investments = investmentsData || []

    // Calculate Total Capital
    const totalCapital = investments.reduce((sum, inv) => sum + Number(inv.capital_amount), 0)

    // 2. Fetch Settings
    const { data: settingsData } = await supabase.from('settings').select('*').single()
    const settings = settingsData || { dollar_rate: 120, office_rent: 0, monthly_salaries: 0 }

    // 3. Fetch All Daily Sales
    const { data: allDailySalesData } = await supabase
        .from('daily_sales')
        .select('*, products(name, cost_price, selling_price)')
        .order('date', { ascending: true })

    const dailySales = allDailySalesData || []

    // 4. Calculate Total Profit
    let totalRevenue = 0
    let totalCOGS = 0
    let totalAdSpendTk = 0

    let minDate: Date | null = null
    let maxDate: Date | null = null

    dailySales.forEach((sale: any) => {
        const netQty = (sale.quantity_sold || 0) - (sale.quantity_returned || 0)

        let revenue = 0
        let cogs = 0
        if (sale.products) {
            revenue = netQty * (sale.products.selling_price || 0)
            cogs = netQty * (sale.products.cost_price || 0)
        }
        const adSpendTk = Number(sale.ad_cost_dollar || 0) * Number(settings.dollar_rate)

        totalRevenue += revenue
        totalCOGS += cogs
        totalAdSpendTk += adSpendTk

        const saleDate = parseISO(sale.date)
        if (isValid(saleDate)) {
            if (!minDate || saleDate < minDate) minDate = saleDate
            if (!maxDate || saleDate > maxDate) maxDate = saleDate
        }
    })

    // Fixed Costs Calculation
    // Estimate months. If minDate and maxDate exist, diff in months + 1. Else 1 month (current).
    let months = 1
    if (minDate && maxDate) {
        months = differenceInMonths(maxDate, minDate) + 1
        if (months < 1) months = 1
    }

    const monthlyFixedCost = Number(settings.office_rent) + Number(settings.monthly_salaries)
    const totalFixedCosts = monthlyFixedCost * months

    const grossProfit = totalRevenue - totalCOGS - totalAdSpendTk
    const netProfit = grossProfit - totalFixedCosts

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">অংশীদার লাভ রিপোর্ট (Partner Profit Share)</h2>
                    <p className="text-muted-foreground">
                        বিনিয়োগের উপর ভিত্তি করে অংশীদারদের লাভের অংশ।
                    </p>
                </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট মূলধন (Total Capital)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{totalCapital.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট লাভ (Total Profit)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            ৳{netProfit.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">After expenses & fixed costs ({months} months)</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>অংশীদারদের তালিকা ও লাভের অংশ (Partner List & Shares)</CardTitle>
                    <CardDescription>
                        Share % = (Partner Capital / Total Capital) * 100
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>নাম (Name)</TableHead>
                                <TableHead className="text-right">বিনিয়োগ (Capital)</TableHead>
                                <TableHead className="text-center">শেয়ার % (Share)</TableHead>
                                <TableHead className="text-right">লাভের অংশ (Profit Share)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {investments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No active partners found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                investments.map((inv) => {
                                    const sharePct = totalCapital > 0 ? (Number(inv.capital_amount) / totalCapital) * 100 : 0
                                    const profitShare = (netProfit * sharePct) / 100

                                    return (
                                        <TableRow key={inv.id}>
                                            <TableCell className="font-medium">{inv.name}</TableCell>
                                            <TableCell className="text-right">৳{Number(inv.capital_amount).toLocaleString()}</TableCell>
                                            <TableCell className="text-center">{sharePct.toFixed(2)}%</TableCell>
                                            <TableCell className={`text-right font-bold ${profitShare >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                                ৳{profitShare.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {netProfit < 0 && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">লোকসান সতর্কতা (Loss Warning)</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>
                                    ব্যবসা বর্তমানে লোকসানে রয়েছে। অংশীদারদের মূলধন থেকে লোকসান সমন্বয় করা হতে পারে।
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
