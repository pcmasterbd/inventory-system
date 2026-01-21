"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, CreditCard, ShoppingCart, TrendingUp } from "lucide-react";

interface SummaryCardsProps {
    totalSales: number;
    totalRevenue: number;
    totalExpense: number;
    netProfit: number;
}

export function SummaryCards({
    totalSales,
    totalRevenue,
    totalExpense,
    netProfit,
}: SummaryCardsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("bn-BD", {
            style: "currency",
            currency: "BDT",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat("bn-BD").format(num);
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">মোট বিক্রয়</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(totalSales)} টি</div>
                    <p className="text-xs text-muted-foreground">
                        চলতি মাসের মোট ইউনিট বিক্রি
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">মোট আয় (Revenue)</CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">
                        খরচ বাদ দেওয়ার আগে মোট আয়
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">মোট খরচ (Expense)</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalExpense)}</div>
                    <p className="text-xs text-muted-foreground">
                        অফিস, অ্যাড এবং অন্যান্য খরচ
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">নিট লাভ (Net Profit)</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(netProfit)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        সব খরচ বাদ দিয়ে নিট লাভ
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
