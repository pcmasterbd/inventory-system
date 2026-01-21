"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LineChart, Line, AreaChart, Area, CartesianGrid } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Percent } from "lucide-react";

interface ReportsAnalysisProps {
    monthlyData: {
        month: string;
        sales: number;
        expenses: number;
        profit: number;
        adCost: number;
    }[];
    summary: {
        totalSales: number;
        totalExpenses: number;
        netProfit: number;
        totalAdSpend: number;
        roi: number;
    };
}

export function ReportsAnalysis({ monthlyData, summary }: ReportsAnalysisProps) {
    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট বিক্রয় (Total Sales)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{summary.totalSales.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট খরচ (Total Expenses)</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">৳{summary.totalExpenses.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">নীট লাভ (Net Profit)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            ৳{summary.netProfit.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Marketing ROI</CardTitle>
                        <Percent className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{summary.roi.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Based on Ad Spend ৳{summary.totalAdSpend}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Profit & Loss Chart */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>মাসিক লাভ-ক্ষতি (Monthly P&L)</CardTitle>
                        <CardDescription>Sales vs Expenses vs Profit</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                                <Tooltip formatter={(value) => `৳${Number(value).toLocaleString()}`} />
                                <Legend />
                                <Bar dataKey="sales" name="বিক্রয়" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" name="খরচ" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="profit" name="লাভ" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Ad Spend vs Profit (ROI Analysis) */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>বিজ্ঞাপন বনাম লাভ (Ads vs Profit)</CardTitle>
                        <CardDescription>Ad Spend Impact on Net Profit</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                                <Tooltip formatter={(value) => `৳${Number(value).toLocaleString()}`} />
                                <Legend />
                                <Area type="monotone" dataKey="profit" name="নীট লাভ" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                                <Area type="monotone" dataKey="adCost" name="বিজ্ঞাপন খরচ" stackId="2" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
