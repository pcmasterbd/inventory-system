import { Suspense } from "react"
import { getFinancialData } from "@/app/actions/financials"
import { DashboardClient } from "@/components/dashboard/DashboardClient"
import { Investment } from "@/lib/types"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ range?: string, view?: string, account?: string, type?: string, category?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    stats,
    chartData,
    accounts,
    transactions,
    totalCashOut,
    categories
  } = await getFinancialData({
    range: params.range,
    account_id: params.account,
    category: params.category
  })

  const view = params.view || "overview"

  let investmentsResults: Investment[] = []
  if (view === 'projects') {
    const { data: invData } = await supabase.from('investments').select('*').order('created_at', { ascending: false })
    investmentsResults = invData as Investment[] || []
  }

  const snapshot = {
    total_sales: stats.totalRevenue,
    total_expenses: stats.operationalExpenses + stats.fixedCosts,
    net_funds_flow: stats.totalRevenue - totalCashOut,
    daily_profit_loss: stats.netProfit
  }

  return (
    <DashboardClient
      stats={stats}
      chartData={chartData}
      accounts={accounts}
      categories={categories}
      view={view}
      totalCashOut={totalCashOut}
      investmentsResults={investmentsResults}
      transactions={(transactions || []) as any}
      snapshot={snapshot}
    />
  )
}

