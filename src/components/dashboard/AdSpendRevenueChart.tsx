"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AdSpendRevenueChartProps {
    data: {
        date: string;
        revenue: number;
        adSpend: number;
        profit: number;
    }[]
}

export function AdSpendRevenueChart({ data }: AdSpendRevenueChartProps) {
    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>বিজ্ঞাপন খরচ বনাম আয় (Ad Spend vs Revenue)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
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
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => `৳${value.toLocaleString()}`}
                            />
                            <Legend />
                            <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} name="রাজস্ব (Revenue)" />
                            <Bar dataKey="adSpend" fill="#ef4444" radius={[4, 4, 0, 0]} name="বিজ্ঞাপন খরচ (Ad Spend)" />
                            {/* <Bar dataKey="profit" fill="#3b82f6" radius={[4, 4, 0, 0]} name="লাভ (Profit)" /> */}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
