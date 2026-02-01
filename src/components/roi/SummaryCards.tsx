"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, CreditCard, ShoppingCart, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/language-context";

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
    const { t, language } = useLanguage();
    const isEn = language === 'en';

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(isEn ? "en-US" : "bn-BD", {
            style: "currency",
            currency: "BDT",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat(isEn ? "en-US" : "bn-BD").format(num);
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("reports.summary.totalSales")}</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(totalSales)} {t("reports.summary.units")}</div>
                    <p className="text-xs text-muted-foreground">
                        {t("reports.summary.salesMtd")}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("reports.summary.totalRevenue")}</CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">
                        {t("reports.summary.revenueMtd")}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("reports.summary.totalExpense")}</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalExpense)}</div>
                    <p className="text-xs text-muted-foreground">
                        {t("reports.summary.expenseMtd")}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("reports.summary.netProfit")}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(netProfit)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {t("reports.summary.profitMtd")}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
