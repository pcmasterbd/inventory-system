"use client"

import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown, Filter, RotateCcw } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function DashboardHeader({ accounts = [], categories = [] }: { accounts?: any[], categories?: string[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentRange = searchParams.get("range") || "today"
    const currentAccount = searchParams.get("account") || "all"
    const currentType = searchParams.get("type") || "all"
    const currentCategory = searchParams.get("category") || "all"

    // Helper to update URL params
    const setParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value === 'all') {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        router.push(`?${params.toString()}`)
    }

    const ranges = [
        { label: "Today", value: "today" },
        { label: "Yesterday", value: "yesterday" },
        { label: "Last 7 Days", value: "last_7_days" },
        { label: "This Month", value: "this_month" },
        { label: "Last Month", value: "last_month" },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Range</h2>
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
                    {/* Account Filter */}
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-medium uppercase">Account</label>
                        <select
                            value={currentAccount}
                            onChange={(e) => setParam('account', e.target.value)}
                            className="flex items-center justify-between min-w-[140px] px-3 py-2 bg-background border rounded-lg text-sm font-medium"
                        >
                            <option value="all">All Accounts</option>
                            {accounts.map((acc) => (
                                <option key={acc.id} value={acc.name}>{acc.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Type Filter */}
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-medium uppercase">Type</label>
                        <div className="flex items-center p-1 bg-muted/50 rounded-lg border">
                            <button
                                onClick={() => setParam('type', 'all')}
                                className={`px-3 py-1 rounded-md text-sm font-medium ${currentType === 'all' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >All</button>
                            <button
                                onClick={() => setParam('type', 'in')}
                                className={`px-3 py-1 rounded-md text-sm font-medium ${currentType === 'in' ? 'bg-emerald-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >In</button>
                            <button
                                onClick={() => setParam('type', 'out')}
                                className={`px-3 py-1 rounded-md text-sm font-medium ${currentType === 'out' ? 'bg-red-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >Out</button>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground font-medium uppercase">Category</label>
                        <select
                            value={currentCategory}
                            onChange={(e) => setParam('category', e.target.value)}
                            className="flex items-center justify-between min-w-[140px] px-3 py-2 bg-background border rounded-lg text-sm font-medium"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border">
                        <span className="text-xs font-medium text-muted-foreground">Currency:</span>
                        <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">BDT</span>
                        <span className="text-xs font-medium text-muted-foreground">USD</span>
                        <span className="text-xs font-medium text-muted-foreground">GBP</span>
                    </div>
                    <Button variant="destructive" size="sm" className="gap-2">
                        <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-border/60">
                <button
                    onClick={() => {
                        const params = new URLSearchParams(searchParams)
                        params.set("view", "overview")
                        router.push(`?${params.toString()}`)
                    }}
                    className={`pb-3 border-b-2 font-medium text-sm transition-colors ${!searchParams.get("view") || searchParams.get("view") === "overview"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => {
                        const params = new URLSearchParams(searchParams)
                        params.set("view", "cashflow")
                        router.push(`?${params.toString()}`)
                    }}
                    className={`pb-3 border-b-2 font-medium text-sm transition-colors ${searchParams.get("view") === "cashflow"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Cash Flow
                </button>
                <button
                    onClick={() => {
                        const params = new URLSearchParams(searchParams)
                        params.set("view", "profit")
                        router.push(`?${params.toString()}`)
                    }}
                    className={`pb-3 border-b-2 font-medium text-sm transition-colors ${searchParams.get("view") === "profit"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Profit Analysis
                </button>
                <button
                    onClick={() => {
                        const params = new URLSearchParams(searchParams)
                        params.set("view", "projects")
                        router.push(`?${params.toString()}`)
                    }}
                    className={`pb-3 border-b-2 font-medium text-sm transition-colors ${searchParams.get("view") === "projects"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Project Analysis
                </button>
            </div>
        </div>
    )
}
