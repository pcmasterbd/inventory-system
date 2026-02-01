"use client"

import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useLanguage } from "@/context/language-context"
import { Account } from "@/lib/types"

interface DashboardHeaderProps {
    accounts?: Account[]
    categories?: string[]
}

export function DashboardHeader({ accounts = [], categories = [] }: DashboardHeaderProps) {
    const { t } = useLanguage()
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const currentRange = searchParams.get("range") || "today"
    const currentAccount = searchParams.get("account") || "all"
    const currentCategory = searchParams.get("category") || "all"

    const isDashboardBase = pathname === "/dashboard"

    const setParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === 'all') {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        router.push(`${pathname}?${params.toString()}`)
    }

    const resetFilters = () => {
        router.push(pathname)
    }

    const ranges = [
        { label: t("dashboard.today"), value: "today" },
        { label: t("dashboard.yesterday"), value: "yesterday" },
        { label: t("dashboard.last7Days"), value: "last_7_days" },
        { label: t("dashboard.thisMonth"), value: "this_month" },
        { label: t("dashboard.lastMonth"), value: "last_month" },
        { label: t("dashboard.allTime") || "All Time", value: "all_time" },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("dashboard.dateRange")}</h2>
                    <div className="flex flex-wrap gap-2">
                        {ranges.map((range) => (
                            <button
                                key={range.value}
                                onClick={() => setParam('range', range.value)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${currentRange === range.value
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "bg-background border hover:bg-muted text-muted-foreground"
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 py-4 border-t border-b border-border/40">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-medium uppercase">{t("dashboard.account")}</label>
                        <select
                            value={currentAccount}
                            onChange={(e) => setParam('account', e.target.value)}
                            className="flex items-center justify-between min-w-[140px] px-3 py-2 bg-background border rounded-lg text-sm font-medium"
                        >
                            <option value="all">{t("dashboard.allAccounts")}</option>
                            {accounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-medium uppercase">{t("dashboard.category")}</label>
                        <select
                            value={currentCategory}
                            onChange={(e) => setParam('category', e.target.value)}
                            className="flex items-center justify-between min-w-[140px] px-3 py-2 bg-background border rounded-lg text-sm font-medium"
                        >
                            <option value="all">{t("dashboard.allCategories")}</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border">
                        <span className="text-xs font-medium text-muted-foreground">{t("dashboard.currency")}:</span>
                        <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">BDT</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-2 text-muted-foreground">
                        <RotateCcw className="w-3.5 h-3.5" /> {t("dashboard.reset")}
                    </Button>
                </div>
            </div>

            {isDashboardBase && (
                <div className="flex items-center gap-6 border-b border-border/60">
                    <button
                        onClick={() => setParam("view", "overview")}
                        className={`pb-3 border-b-2 font-medium text-sm transition-colors ${!searchParams.get("view") || searchParams.get("view") === "overview"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {t("dashboard.overview")}
                    </button>
                    <button
                        onClick={() => setParam("view", "cashflow")}
                        className={`pb-3 border-b-2 font-medium text-sm transition-colors ${searchParams.get("view") === "cashflow"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {t("dashboard.cashFlow")}
                    </button>
                    <button
                        onClick={() => setParam("view", "profit")}
                        className={`pb-3 border-b-2 font-medium text-sm transition-colors ${searchParams.get("view") === "profit"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {t("dashboard.profitAnalysis")}
                    </button>
                    <button
                        onClick={() => setParam("view", "projects")}
                        className={`pb-3 border-b-2 font-medium text-sm transition-colors ${searchParams.get("view") === "projects"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {t("dashboard.projectAnalysis")}
                    </button>
                </div>
            )}
        </div>
    )
}
