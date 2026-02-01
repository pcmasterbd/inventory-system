"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/context/language-context"

export function DateFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { t } = useLanguage()

    // Default to current month/year if not set
    const currentYear = new Date().getFullYear().toString()
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0') // '01' to '12'

    const view = searchParams.get("view") || "monthly" // 'monthly' | 'yearly'
    const year = searchParams.get("year") || currentYear
    const month = searchParams.get("month") || currentMonth

    const years = Array.from({ length: 5 }, (_, i) => (parseInt(currentYear) - i).toString())

    const months = [
        { value: "01", label: t("reports.filters.months.01") },
        { value: "02", label: t("reports.filters.months.02") },
        { value: "03", label: t("reports.filters.months.03") },
        { value: "04", label: t("reports.filters.months.04") },
        { value: "05", label: t("reports.filters.months.05") },
        { value: "06", label: t("reports.filters.months.06") },
        { value: "07", label: t("reports.filters.months.07") },
        { value: "08", label: t("reports.filters.months.08") },
        { value: "09", label: t("reports.filters.months.09") },
        { value: "10", label: t("reports.filters.months.10") },
        { value: "11", label: t("reports.filters.months.11") },
        { value: "12", label: t("reports.filters.months.12") },
    ]

    const handleUpdate = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(key, value)
        // Reset sub-selections when view changes
        if (key === 'view' && value === 'yearly') {
            params.delete('month')
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex items-center gap-2 bg-background border p-1 rounded-md shadow-sm">
            {/* View Type Selector */}
            <Select value={view} onValueChange={(v) => handleUpdate("view", v)}>
                <SelectTrigger className="w-[110px] h-8 text-xs border-0 focus:ring-0">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="monthly">{t("reports.filters.monthly")}</SelectItem>
                    <SelectItem value="yearly">{t("reports.filters.yearly")}</SelectItem>
                </SelectContent>
            </Select>

            <div className="w-[1px] h-4 bg-border" />

            {/* Year Selector */}
            <Select value={year} onValueChange={(v) => handleUpdate("year", v)}>
                <SelectTrigger className="w-[80px] h-8 text-xs border-0 focus:ring-0">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {years.map((y) => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Month Selector */}
            {view === "monthly" && (
                <>
                    <div className="w-[1px] h-4 bg-border" />
                    <Select value={month} onValueChange={(v) => handleUpdate("month", v)}>
                        <SelectTrigger className="w-[110px] h-8 text-xs border-0 focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((m) => (
                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </>
            )}
        </div>
    )
}
