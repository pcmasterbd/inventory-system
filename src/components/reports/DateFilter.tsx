"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export function DateFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Default to current month/year if not set
    const currentYear = new Date().getFullYear().toString()
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0') // '01' to '12'

    const view = searchParams.get("view") || "monthly" // 'monthly' | 'yearly'
    const year = searchParams.get("year") || currentYear
    const month = searchParams.get("month") || currentMonth

    const years = Array.from({ length: 5 }, (_, i) => (parseInt(currentYear) - i).toString())

    // Bangla Month Names
    const months = [
        { value: "01", label: "জানুয়ারি (Jan)" },
        { value: "02", label: "ফেব্রুয়ারি (Feb)" },
        { value: "03", label: "মার্চ (Mar)" },
        { value: "04", label: "এপ্রিল (Apr)" },
        { value: "05", label: "মে (May)" },
        { value: "06", label: "জুন (Jun)" },
        { value: "07", label: "জুলাই (Jul)" },
        { value: "08", label: "আগস্ট (Aug)" },
        { value: "09", label: "সেপ্টেম্বর (Sep)" },
        { value: "10", label: "অক্টোবর (Oct)" },
        { value: "11", label: "নভেম্বর (Nov)" },
        { value: "12", label: "ডিসেম্বর (Dec)" },
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
                    <SelectItem value="monthly">মাসিক</SelectItem>
                    <SelectItem value="yearly">বাৎসরিক</SelectItem>
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
                                <SelectItem key={m.value} value={m.value}>{m.label.split(' ')[0]}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </>
            )}
        </div>
    )
}
