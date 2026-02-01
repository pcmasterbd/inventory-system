"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { useLanguage } from "@/context/language-context";

export function FinancialCharts({ data }: { data: any[] }) {
    const { t } = useLanguage();

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 pb-4 border-b">
                <h3 className="font-semibold text-lg">{t("dashboard.revenueVsCosts")}</h3>
                <p className="text-sm text-muted-foreground">{t("dashboard.detailedView")}</p>
            </div>
            <div className="p-6 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `৳${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" name={t("dashboard.revenue")} fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                        <Bar dataKey="cogs" name={t("reports.breakdown.totalCOGS")} fill="#8b5cf6" radius={[4, 4, 0, 0]} stackId="a" />
                        <Bar dataKey="expenses" name={t("dashboard.expense")} fill="#f97316" radius={[4, 4, 0, 0]} stackId="a" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
