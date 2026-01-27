import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Wrench, Wallet, PieChart, TrendingUp, TrendingDown, Target, Activity, Banknote, CreditCard, Landmark } from "lucide-react"

export interface SaaSStats {
    totalRevenue: number
    operationalExpenses: number
    fixedCosts: number
    miscCosts: number
    marketingCosts: number
    grossProfit: number
    netProfit: number
    currentBalance: number
    grossMargin: number
    netProfitMargin: number
    operatingRatio: number
    profitStatus: 'Profitable' | 'Loss'
    totalCOGS: number
}

export function SaaSStatsCards({ stats, currencySpec = "৳" }: { stats: SaaSStats, currencySpec?: string }) {
    const formatMoney = (amount: number) => {
        return `${currencySpec}${amount.toLocaleString()}`
    }

    const cards = [
        {
            label: "Total Revenue",
            value: formatMoney(stats.totalRevenue),
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            label: "Operational Expenses",
            value: formatMoney(stats.operationalExpenses),
            icon: Wrench,
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        },
        {
            label: "Fixed Costs",
            value: formatMoney(stats.fixedCosts),
            icon: Landmark, // Simulating Fixed structure
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            label: "Miscellaneous Costs",
            value: formatMoney(stats.miscCosts),
            icon: Activity,
            color: "text-red-400",
            bg: "bg-red-400/10"
        },
        {
            label: "Marketing Costs",
            value: formatMoney(stats.marketingCosts),
            icon: Target,
            color: "text-rose-500",
            bg: "bg-rose-500/10"
        },
        {
            label: "Gross Profit",
            value: formatMoney(stats.grossProfit),
            icon: PieChart,
            color: "text-violet-500",
            bg: "bg-violet-500/10"
        },
        {
            label: "Net Profit or Loss",
            value: formatMoney(stats.netProfit),
            icon: stats.netProfit >= 0 ? TrendingUp : TrendingDown,
            color: stats.netProfit >= 0 ? "text-emerald-600" : "text-red-500",
            bg: stats.netProfit >= 0 ? "bg-emerald-600/10" : "bg-red-500/10"
        },
        {
            label: "Current Balance",
            value: formatMoney(stats.currentBalance),
            icon: Wallet,
            color: "text-cyan-500",
            bg: "bg-cyan-500/10"
        },
        {
            label: "Gross Margin",
            value: `${stats.grossMargin.toFixed(1)}%`,
            icon: Activity,
            color: "text-pink-500",
            bg: "bg-pink-500/10"
        },
        {
            label: "Net Profit Margin",
            value: `${stats.netProfitMargin.toFixed(1)}%`,
            icon: Target,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            label: "Operating Ratio",
            value: `${stats.operatingRatio.toFixed(1)}%`,
            icon: Activity,
            color: "text-teal-500",
            bg: "bg-teal-500/10"
        },
        {
            label: "Profit Status",
            value: stats.profitStatus,
            icon: stats.profitStatus === 'Profitable' ? TrendingUp : TrendingDown,
            color: stats.profitStatus === 'Profitable' ? "text-green-600" : "text-red-600",
            bg: stats.profitStatus === 'Profitable' ? "bg-green-600/10" : "bg-red-600/10"
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, idx) => (
                <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                            <h3 className="text-2xl font-bold tracking-tight">{card.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                            <card.icon className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
