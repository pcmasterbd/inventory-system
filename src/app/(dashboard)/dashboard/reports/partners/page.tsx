import { createClient } from "@/lib/supabase/server"
import { differenceInMonths, isValid, parseISO } from "date-fns"
import { PartnerReportClient } from "@/components/reports/PartnerReportClient"

export default async function PartnerReportPage() {
    const supabase = await createClient()

    const { data: investmentsData } = await supabase.from('investments').select('*').eq('status', 'active')
    const investments = investmentsData || []
    const totalCapital = investments.reduce((sum, inv) => sum + Number(inv.capital_amount), 0)

    const { data: settingsData } = await supabase.from('settings').select('*').single()
    const settings = settingsData || { dollar_rate: 120, office_rent: 0, monthly_salaries: 0 }

    const { data: allDailySalesData } = await supabase
        .from('daily_sales')
        .select('*, products(name, cost_price, selling_price)')
        .order('date', { ascending: true })

    const dailySales = allDailySalesData || []

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
        totalRevenue += revenue
        totalCOGS += cogs
        totalAdSpendTk += Number(sale.ad_cost_dollar || 0) * Number(settings.dollar_rate)
        const saleDate = parseISO(sale.date)
        if (isValid(saleDate)) {
            if (!minDate || saleDate < minDate) minDate = saleDate
            if (!maxDate || saleDate > maxDate) maxDate = saleDate
        }
    })

    let months = 1
    if (minDate && maxDate) {
        months = differenceInMonths(maxDate, minDate) + 1
        if (months < 1) months = 1
    }

    const netProfit = totalRevenue - totalCOGS - totalAdSpendTk - ((Number(settings.office_rent) + Number(settings.monthly_salaries)) * months)

    return (
        <PartnerReportClient
            investments={investments}
            totalCapital={totalCapital}
            netProfit={netProfit}
            months={months}
        />
    )
}
