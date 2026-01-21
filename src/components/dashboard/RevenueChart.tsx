"use client";

import { useState, useEffect } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const data = [
    { name: "Jan", total: 1500 },
    { name: "Feb", total: 2300 },
    { name: "Mar", total: 3200 },
    { name: "Apr", total: 2900 },
    { name: "May", total: 4500 },
    { name: "Jun", total: 5100 },
    { name: "Jul", total: 4800 },
];

export function RevenueChart() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="xl:col-span-2 min-h-[400px] bg-white/50 backdrop-blur-sm dark:bg-card/50 rounded-xl border border-border/50 p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-6">আয় বিশ্লেষণ</h3>
                <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                    চার্ট লোড হচ্ছে...
                </div>
            </div>
        );
    }

    return (
        <div className="xl:col-span-2 min-h-[400px] bg-white/50 backdrop-blur-sm dark:bg-card/50 rounded-xl border border-border/50 p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-6">আয় বিশ্লেষণ</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
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
                            contentStyle={{
                                backgroundColor: "var(--popover)",
                                borderColor: "var(--border)",
                                borderRadius: "8px",
                                color: "var(--popover-foreground)",
                            }}
                            itemStyle={{ color: "var(--primary)" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorTotal)"
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
