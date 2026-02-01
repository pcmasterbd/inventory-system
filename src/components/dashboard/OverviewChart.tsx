"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/context/language-context";

export function OverviewChart({ transactions }: { transactions: any[] }) {
    const { t } = useLanguage();

    // Simple aggregation by month
    const monthlyData = new Map<string, { name: string, income: number, expense: number }>();

    transactions.forEach(t => {
        const date = new Date(t.date);
        const month = date.toLocaleString('default', { month: 'short' });

        if (!monthlyData.has(month)) {
            monthlyData.set(month, { name: month, income: 0, expense: 0 });
        }

        const current = monthlyData.get(month)!;
        if (t.transaction_type === 'income') current.income += Number(t.amount);
        if (t.transaction_type === 'expense') current.expense += Number(t.amount);
    });

    const chartData = Array.from(monthlyData.values()).length > 0
        ? Array.from(monthlyData.values())
        : [{ name: 'Current', income: 0, expense: 0 }];

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>{t("dashboard.financialOverview")}</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis
                                dataKey="name"
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
                            />
                            <Legend />
                            <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name={t("dashboard.income")} />
                            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name={t("dashboard.expense")} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
