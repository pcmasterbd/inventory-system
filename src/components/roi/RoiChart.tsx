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
import { useLanguage } from "@/context/language-context";

interface DailyData {
    date: string;
    revenue: number;
    profit: number;
}

interface RoiChartProps {
    data: DailyData[];
}

export function RoiChart({ data }: RoiChartProps) {
    const { t } = useLanguage();
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>{t("reports.roiChart.title") || "Revenue vs Profit"}</CardTitle>
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
                            name={t("reports.roiChart.revenue") || "Revenue"}
                            fill="#adfa1d" // Bright green for revenue
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="profit"
                            name={t("reports.roiChart.profit") || "Profit"}
                            fill="#2563eb" // Blue for profit
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
