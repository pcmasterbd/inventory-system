"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

export function FinancialCharts({ data }: { data: any[] }) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6 pb-4 border-b">
                <h3 className="font-semibold text-lg">Revenue vs Costs Breakdown</h3>
                <p className="text-sm text-muted-foreground">Detailed view of your financial performance over time.</p>
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
                        <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                        <Bar dataKey="cogs" name="COGS" fill="#8b5cf6" radius={[4, 4, 0, 0]} stackId="a" />
                        <Bar dataKey="expenses" name="Expenses" fill="#f97316" radius={[4, 4, 0, 0]} stackId="a" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
