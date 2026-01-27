import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { SaaSStatsCards, SaaSStats } from "@/components/dashboard/SaaSStatsCards"
import { FinancialCharts } from "@/components/dashboard/FinancialCharts"
import { format, subDays, startOfMonth, startOfYesterday, isSameDay, isWithinInterval, startOfDay, endOfDay, subMonths, endOfMonth } from "date-fns"

export default async function DashboardPage({ searchParams }: { searchParams: { range?: string, view?: string, account?: string, type?: string, category?: string } }) {
  const supabase = await createClient()
  const range = searchParams.range || "today"
  const view = searchParams.view || "overview"
  const accountFilter = searchParams.account
  const typeFilter = searchParams.type
  const categoryFilter = searchParams.category

  // Date Range Logic
  const today = new Date()
  let startDate = startOfDay(today)
  let endDate = endOfDay(today)

  if (range === 'yesterday') {
    startDate = startOfYesterday()
    endDate = endOfDay(subDays(today, 1))
  } else if (range === 'last_7_days') {
    startDate = startOfDay(subDays(today, 6))
    endDate = endOfDay(today)
  } else if (range === 'this_month') {
    startDate = startOfMonth(today)
    endDate = endOfDay(today)
  } else if (range === 'last_month') {
    startDate = startOfMonth(subMonths(today, 1))
    endDate = endOfMonth(subMonths(today, 1))
  }

  const startDateStr = format(startDate, "yyyy-MM-dd")
  const endDateStrIncludeTime = endDate.toISOString()

  // --- 1. Fetch Data ---

  // Fetch Accounts (for filter and balance)
  const { data: accounts } = await supabase.from('accounts').select('*')
  const totalBalance = (accounts || []).reduce((sum, acc) => sum + Number(acc.balance || 0), 0)

  // Fetch Transactions (Inventory Purchases & System generated money activity)
  let transactionQuery = supabase
    .from('transactions')
    .select('*')
    .gte('date', startDateStr)
    .lte('date', format(endDate, "yyyy-MM-dd"))
    .order('date', { ascending: false })

  if (accountFilter && accountFilter !== 'all') {
    transactionQuery = transactionQuery.ilike('payment_method', `%${accountFilter}%`)
  }
  // Type filter for transactions
  if (typeFilter && typeFilter !== 'all') {
    if (typeFilter === 'in') {
      transactionQuery = transactionQuery.eq('type', 'income')
    } else if (typeFilter === 'out') {
      transactionQuery = transactionQuery.eq('type', 'expense')
    }
  }
  if (categoryFilter && categoryFilter !== 'all') {
    transactionQuery = transactionQuery.eq('category', categoryFilter)
  }

  const { data: transactions } = await transactionQuery

  // Fetch ROI Expenses (Manual Money Out - from Sidebar "Money Out")
  // These are: Fixed, Daily, Personal, Assets
  let expensesQuery = supabase
    .from('roi_expenses')
    .select('*')
    .gte('date', startDateStr)
    .lte('date', format(endDate, "yyyy-MM-dd"))

  // Apply category filter to roi_expenses if applicable (mapping required if cat names differ)
  // roi_expenses uses 'expense_type', transactions uses 'category'.
  if (categoryFilter && categoryFilter !== 'all') {
    expensesQuery = expensesQuery.eq('expense_type', categoryFilter)
  }

  const { data: roiExpenses } = await expensesQuery

  // Fetch distinct categories for filter (Combined from transactions and expenses)
  const { data: allTransactions } = await supabase.from('transactions').select('category')
  const { data: allRoiExpenses } = await supabase.from('roi_expenses').select('expense_type')

  // @ts-ignore
  const transCats = allTransactions?.map(t => t.category).filter(Boolean) || []
  // @ts-ignore
  const expCats = allRoiExpenses?.map(e => e.expense_type).filter(Boolean) || []
  const categories = Array.from(new Set([...transCats, ...expCats]))


  // Invoices (Revenue)
  let invoices: any[] = []
  if (typeFilter !== 'out') {
    const { data: invoicesData } = await supabase
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
      .lte('created_at', endDateStrIncludeTime)

    invoices = invoicesData || []
  }

  // Ad Costs (Marketing)
  let adCosts: any[] = []
  if (typeFilter !== 'in') {
    const { data: adData } = await supabase
      .from('product_ad_spends')
      .select('date, amount_dollar, exchange_rate')
      .gte('date', startDateStr)
      .lte('date', format(endDate, "yyyy-MM-dd"))
    adCosts = adData || []
  }


  // D. Settings (fallback dollar rate)
  const { data: settings } = await supabase.from('settings').select('*').single()
  const globalDollarRate = Number(settings?.dollar_rate || 120)

  // --- 2. Calculate Stats ---

  // A. Revenue & COGS
  let totalRevenue = 0
  let totalCOGS = 0

  invoices.forEach((inv: any) => {
    // Only count positive invoices as revenue, negative as return deduction?
    // Using total_amount handles returns (which are negative) correctly for Net Revenue.
    totalRevenue += Number(inv.total_amount || 0)

    // COGS
    inv.invoice_items?.forEach((item: any) => {
      const qty = item.quantity || 0 // can be negative for returns
      const cost = item.products?.cost_price || 0
      totalCOGS += (qty * cost)
    })
  })

  // B. Expenses Analysis
  const FIXED_CATS = ["office_rent", "salary", "utility", "license_purchase", "fixed"];
  // Personal & Assets are Money Out, but NOT Operational Expense for P&L usually.
  // Although Personal Withdrawal IS a reduction of equity.
  // Assets are Capital Expenditure.

  // Marketing Costs
  let marketingCosts = 0
  adCosts.forEach((ad: any) => {
    // Use stored exchange rate if available, otherwise global
    const rate = Number(ad.exchange_rate) || globalDollarRate
    marketingCosts += Number(ad.amount_dollar || 0) * rate
  })

  // ROI Expenses Breakdown
  let fixedCosts = 0;
  let operationalExpenses = 0; // Daily expenses
  let miscCosts = 0; // Other operational
  let totalCashOut = 0;

  roiExpenses?.forEach((exp: any) => {
    totalCashOut += Number(exp.amount || 0);

    if (FIXED_CATS.includes(exp.expense_type)) {
      fixedCosts += Number(exp.amount || 0);
    } else if (["personal_withdrawal", "family_expense", "medical", "other_personal", "personal"].includes(exp.expense_type)) {
      // Personal - not op expense usually
    } else if (["equipment", "furniture", "electronics", "other_asset", "assets"].includes(exp.expense_type)) {
      // Assets - not op expense
    } else {
      // Assume everything else is Operational (Daily)
      operationalExpenses += Number(exp.amount || 0);
    }
  })

  // Transaction Expenses (Inventory Purchase, etc.)
  let inventoryPurchaseVal = 0;

  transactions?.forEach((tx: any) => {
    if (tx.type === 'expense') {
      totalCashOut += Number(tx.amount || 0);

      if (tx.category === 'Inventory Purchase') {
        inventoryPurchaseVal += Number(tx.amount || 0);
      } else {
        // Other system transactions? Treat as misc operational.
        miscCosts += Number(tx.amount || 0);
      }
    } else if (tx.type === 'income') {
      // Extra income entries?
    }
  })

  // Consolidate for Display
  const totalDailyOperational = operationalExpenses + miscCosts + marketingCosts;

  // Profit Logic (Accrual-ish based on Sales COGS)
  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - totalDailyOperational - fixedCosts;

  const stats: SaaSStats = {
    totalRevenue,
    operationalExpenses: totalDailyOperational,
    fixedCosts: fixedCosts,
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
  }

  // --- 3. Prepare Chart Data (Daily Breakdown for the range) ---
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  // We'll group by date
  const chartDataMap = new Map<string, { date: string, revenue: number, cogs: number, expenses: number }>()

  // Init dates
  for (let i = 0; i < diffDays; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    const dateStr = format(d, "yyyy-MM-dd")
    chartDataMap.set(dateStr, { date: format(d, "dd MMM"), revenue: 0, cogs: 0, expenses: 0 })
  }

  // @ts-ignore
  invoices?.forEach((inv: any) => {
    const dateStr = format(new Date(inv.created_at), "yyyy-MM-dd")
    if (chartDataMap.has(dateStr)) {
      const entry = chartDataMap.get(dateStr)!
      entry.revenue += Number(inv.total_amount || 0)

      let cogs = 0
      inv.invoice_items?.forEach((item: any) => {
        cogs += (item.quantity * (item.products?.cost_price || 0))
      })
      entry.cogs += cogs
    }
  })

  // Add expenses to chart (Transactions + ROI Expenses + Ad Costs)
  transactions?.forEach((tx: any) => {
    // Only chart expenses if type is expense
    if (tx.type === 'expense') {
      const dateStr = tx.date // yyyy-MM-dd
      if (chartDataMap.has(dateStr)) {
        chartDataMap.get(dateStr)!.expenses += Number(tx.amount || 0)
      }
    }
  })

  roiExpenses?.forEach((exp: any) => {
    const dateStr = format(new Date(exp.date), "yyyy-MM-dd")
    // roi_expenses might match transactions date format if YYYY-MM-DD
    // Check if exp.date is ISO or date string. Usually ISO from DB.
    if (chartDataMap.has(dateStr)) {
      chartDataMap.get(dateStr)!.expenses += Number(exp.amount || 0)
    }
  })

  adCosts?.forEach((ad: any) => {
    const dateStr = ad.date.split('T')[0] // product_ad_spends might be ISO
    const rate = Number(ad.exchange_rate) || globalDollarRate
    const costTk = Number(ad.amount_dollar || 0) * rate

    // Check key format. chartDataMap uses yyyy-MM-dd
    if (chartDataMap.has(dateStr)) {
      chartDataMap.get(dateStr)!.expenses += costTk
    }
  })

  const chartData = Array.from(chartDataMap.values())



  // Additional Data for Specific Views
  let investmentsResults: any[] = []
  if (view === 'projects') {
    const { data: invData } = await supabase.from('investments').select('*').order('created_at', { ascending: false })
    investmentsResults = invData || []
  }

  // Render Logic based on View
  return (
    <div className="space-y-8 p-1">
      <DashboardHeader accounts={accounts || []} categories={categories} />

      {/* OVERVIEW VIEW */}
      {view === 'overview' && (
        <>
          <Suspense fallback={<div className="h-60 w-full animate-pulse bg-muted rounded-xl" />}>
            <SaaSStatsCards stats={stats} />
          </Suspense>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-3">
              <FinancialCharts data={chartData} />
            </div>
          </div>
        </>
      )}

      {/* CASH FLOW VIEW */}
      {view === 'cashflow' && (
        <div className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground">This Period In</h3>
              <p className="text-2xl font-bold text-emerald-600">+৳{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground">This Period Out</h3>
              <p className="text-2xl font-bold text-red-600">-৳{totalCashOut.toLocaleString()}</p>
            </div>
            <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground">Net Cash Flow</h3>
              <p className={`text-2xl font-bold ${(stats.totalRevenue - totalCashOut) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {(stats.totalRevenue - totalCashOut) >= 0 ? "+" : ""}৳{(stats.totalRevenue - totalCashOut).toLocaleString()}
              </p>
            </div>
          </div>
          <FinancialCharts data={chartData} />
        </div>
      )}

      {/* PROFIT VIEW */}
      {view === 'profit' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-6 rounded-xl border bg-emerald-50/50">
              <h3 className="text-sm font-semibold text-emerald-700">Gross Profit</h3>
              <p className="text-3xl font-bold text-emerald-800">৳{stats.grossProfit.toLocaleString()}</p>
              <p className="text-xs text-emerald-600 mt-1">{stats.grossMargin.toFixed(1)}% Margin</p>
            </div>
            <div className="p-6 rounded-xl border bg-blue-50/50">
              <h3 className="text-sm font-semibold text-blue-700">Net Profit</h3>
              <p className="text-3xl font-bold text-blue-800">৳{stats.netProfit.toLocaleString()}</p>
              <p className="text-xs text-blue-600 mt-1">{stats.netProfitMargin.toFixed(1)}% Margin</p>
            </div>
          </div>
          <div className="p-6 rounded-xl border">
            <h3 className="font-semibold mb-4">Detailed Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span>Total Sales Revenue</span>
                <span className="font-mono">৳{stats.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-2 text-muted-foreground">
                <span>- Cost of Goods Sold (COGS)</span>
                <span className="font-mono">৳{stats.totalCOGS.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-2 font-medium">
                <span>= Gross Profit</span>
                <span className="font-mono">৳{stats.grossProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-2 text-red-500">
                <span>- Marketing Costs</span>
                <span className="font-mono">৳{stats.marketingCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-2 text-red-500">
                <span>- Other Op. Expenses</span>
                <span className="font-mono">৳{stats.miscCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-2 text-red-500">
                <span>- Fixed Costs (Prorated)</span>
                <span className="font-mono">৳{stats.fixedCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 font-bold text-lg">
                <span>= Net Profit</span>
                <span className={`font-mono ${stats.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  ৳{stats.netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROJECTS VIEW */}
      {view === 'projects' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Active Projects Analysis</h3>
          {investmentsResults.length === 0 ? (
            <p className="text-muted-foreground">No active projects found.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {investmentsResults.map((inv: any) => {
                const roi = inv.capital_amount > 0 ? (inv.current_return / inv.capital_amount) * 100 : 0
                return (
                  <div key={inv.id} className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg">{inv.name}</h4>
                        <p className="text-xs text-muted-foreground">{new Date(inv.start_date).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${inv.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Capital</span>
                        <span className="font-semibold">৳{inv.capital_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Return</span>
                        <span className={`font-semibold ${inv.current_return >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {inv.current_return >= 0 ? "+" : ""}৳{inv.current_return.toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-2 border-t mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold uppercase text-muted-foreground">ROI</span>
                          <span className={`text-lg font-bold ${roi >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {roi.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
