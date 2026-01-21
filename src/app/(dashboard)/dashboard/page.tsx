import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { DashboardStatsCards } from "@/components/dashboard/DashboardStatsCards"
import { ProductManager } from "@/components/dashboard/ProductManager"
import { TransactionManager } from "@/components/dashboard/TransactionManager"
import { OverviewChart } from "@/components/dashboard/OverviewChart"
import { AdSpendRevenueChart } from "@/components/dashboard/AdSpendRevenueChart"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { signOut } from "@/app/actions"
import { Product, Transaction, DashboardStats } from "@/lib/types"
import { format, subDays } from "date-fns"

import { DailySnapshotWidget } from "@/components/dashboard/DailySnapshotWidget"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch Accounts (Funds)
  const { data: accountsData } = await supabase.from('accounts').select('*')
  const accounts = accountsData || []

  // Fetch Expenses (Operating Expenses)
  const { data: expensesData } = await supabase.from('roi_expenses').select('amount')
  const expensesList = expensesData || []

  // Fetch Invoices (Sales)
  const { data: invoicesData } = await supabase.from('invoices').select('total_amount, paid_amount')
  const invoicesList = invoicesData || []

  // Fetch Products
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (productsError) console.error("Error fetching products:", productsError)
  const products = (productsData || []) as Product[]

  // Fetch Transactions (Fixed: Ordering by 'date' instead of 'created_at')
  const { data: transactionsData, error: transactionsError } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
  if (transactionsError) console.error("Error fetching transactions:", transactionsError.message)
  const transactions = (transactionsData || []) as Transaction[]

  // Fetch Invoice Items (For COGS)
  const { data: invoiceItemsData } = await supabase.from('invoice_items').select('product_id, quantity')
  const invoiceItems = invoiceItemsData || []

  // --- NEW: Fetch logic with Error Handling ---
  const today = new Date()
  const todayStr = format(today, "yyyy-MM-dd")
  const thirtyDaysAgoStr = format(subDays(today, 30), "yyyy-MM-dd")

  let allDailySales: any[] = []
  let settings = { dollar_rate: 120, office_rent: 0, monthly_salaries: 0 }
  let totalInvestment = 0

  try {
    // 1. Fetch Daily Sales (Last 30 Days)
    const { data: allDailySalesData, error: salesError } = await supabase
      .from('daily_sales')
      .select('*, products(cost_price, selling_price)')
      .gte('date', thirtyDaysAgoStr)
      .lte('date', todayStr)
      .order('date', { ascending: true })

    if (salesError) {
      console.error("Error fetching daily sales:", salesError)
    } else {
      allDailySales = allDailySalesData || []
    }

    // 2. Fetch Settings
    const { data: settingsData, error: settingsError } = await supabase.from('settings').select('*').single()
    if (settingsError && settingsError.code !== 'PGRST116') console.error("Error fetching settings:", settingsError)
    if (settingsData) settings = settingsData

    // 3. Fetch Investments
    const { data: investmentsData, error: investmentsError } = await supabase.from('investments').select('capital_amount')
    if (investmentsError) {
      console.error("Error fetching investments:", investmentsError)
    } else {
      totalInvestment = (investmentsData || []).reduce((sum, inv) => sum + Number(inv.capital_amount || 0), 0)
    }
  } catch (err) {
    console.error("Unexpected error in Dashboard fetch:", err)
  }

  // Calculate Overall Stats
  const totalSales = invoicesList.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0)
  const totalExpense = expensesList.reduce((sum, exp) => sum + Number(exp.amount || 0), 0)

  const totalCOGS = invoiceItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.product_id)
    return sum + (item.quantity * (product?.cost_price || 0))
  }, 0)

  const netProfit = totalSales - totalCOGS - totalExpense

  // Calculate Today's Stats & Chart Data
  let todaySales = 0
  let todayCOGS = 0
  let todayAdSpendDollar = 0

  // Chart Data Aggregation
  const chartDataMap = new Map<string, { date: string, revenue: number, adSpend: number, profit: number }>()

  // Initialize last 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const d = format(subDays(today, i), "yyyy-MM-dd")
    chartDataMap.set(d, { date: format(subDays(today, i), "dd MMM"), revenue: 0, adSpend: 0, profit: 0 })
  }

  allDailySales.forEach((sale: any) => {
    const saleDate = sale.date
    const netQty = (sale.quantity_sold || 0) - (sale.quantity_returned || 0)

    let revenue = 0
    let cogs = 0
    if (sale.products) {
      revenue = netQty * (sale.products.selling_price || 0)
      cogs = netQty * (sale.products.cost_price || 0)
    }
    const adSpendTk = Number(sale.ad_cost_dollar || 0) * Number(settings.dollar_rate)

    // Today's Stats
    if (saleDate === todayStr) {
      todaySales += revenue
      todayCOGS += cogs
      todayAdSpendDollar += Number(sale.ad_cost_dollar || 0)
    }

    // Chart Data
    if (chartDataMap.has(saleDate)) {
      const entry = chartDataMap.get(saleDate)!
      entry.revenue += revenue
      entry.adSpend += adSpendTk
      entry.profit += (revenue - cogs - adSpendTk) // Gross profit before fixed costs
    }
  })

  // Convert Map to Array for Chart
  const chartData = Array.from(chartDataMap.values())

  const dailyFixedCost = (Number(settings.office_rent) + Number(settings.monthly_salaries)) / 30
  const todayAdSpendTk = todayAdSpendDollar * Number(settings.dollar_rate)
  const todayProfit = todaySales - todayCOGS - todayAdSpendTk - dailyFixedCost

  const totalRoi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0

  const stats: DashboardStats = {
    todaySales,
    todayProfit,
    totalRoi,
    todayAdSpend: todayAdSpendDollar,
    totalSales,
    totalCOGS,
    totalExpense,
    netProfit,
    totalStockValue: products.reduce((sum, p) => sum + (Number(p.stock_quantity || 0) * Number(p.cost_price || 0)), 0),
    cashBalance: accounts.find(a => a.name.toLowerCase().includes('cash'))?.balance || 0,
    bankBalance: accounts.find(a => a.name.toLowerCase().includes('bank'))?.balance || 0,
    mobileBalance: accounts.find(a => a.name.toLowerCase().includes('bkash') || a.name.toLowerCase().includes('nagad'))?.balance || 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">সারসংক্ষেপ (Overview)</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">অ্যাডমিন (Admin)</span>
          <form action={signOut}>
            <Button variant="outline" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" /> লগআউট
            </Button>
          </form>
        </div>
      </div>

      <DailySnapshotWidget />

      <DashboardStatsCards stats={stats} />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <AdSpendRevenueChart data={chartData} />

        <div className="lg:col-span-3">
          <ProductManager products={products} />
        </div>

        <div className="lg:col-span-3 grid md:grid-cols-2 gap-6">
          <TransactionManager />

          {/* Recent Transactions List (Mini) */}
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 pb-3">
              <h3 className="font-semibold leading-none tracking-tight">সাম্প্রতিক কার্যকলাপ (Recent Activity)</h3>
            </div>
            <div className="p-6 pt-0 max-h-[400px] overflow-y-auto space-y-4">
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">কোনো লেনদেন পাওয়া যায়নি।</p>
              ) : (
                transactions.slice(0, 10).map((t) => (
                  <div key={t.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none capitalize">{t.type === 'income' ? 'আয় (Income)' : 'ব্যয় (Expense)'}</p>
                      <p className="text-xs text-muted-foreground">{t.description || 'বিবরণ নেই'}</p>
                      <p className="text-xs text-muted-foreground" suppressHydrationWarning>{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                    <div className={`font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}৳{t.amount}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
