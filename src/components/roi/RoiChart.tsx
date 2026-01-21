"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend,
    CartesianGrid
} from "recharts";

interface DailyData {
    date: string;
    revenue: number;
    profit: number;
}

interface RoiChartProps {
    data: DailyData[];
}

export function RoiChart({ data }: RoiChartProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>লাভ এবং আয়ের গ্রাফ (Revenue vs Profit)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
                        <Bar
                            dataKey="revenue"
                            name="আয় (Revenue)"
                            fill="#adfa1d" // Bright green for revenue
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="profit"
                            name="লাভ (Profit)"
                            fill="#2563eb" // Blue for profit
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
