"use client";

import { Suspense } from "react";
import { useLanguage } from "@/context/language-context";
import { ReportsAnalysis } from "@/components/reports/ReportsAnalysis";
import { SalesBreakdown } from "@/components/reports/SalesBreakdown";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DailySnapshotWidget } from "@/components/dashboard/DailySnapshotWidget";

interface ReportsClientProps {
    monthlyData: any[];
    summary: any;
    productStats: any[];
    accounts: any[];
    categories: any[];
    snapshot: any;
}

export function ReportsClient({ monthlyData, summary, productStats, accounts, categories, snapshot }: ReportsClientProps) {
    const { t } = useLanguage();

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t("reports.title")}</h2>
                    <p className="text-muted-foreground">{t("reports.description")}</p>
                </div>
            </div>

            <Suspense fallback={<div className="h-20 bg-muted/20 animate-pulse rounded-lg" />}>
                <DashboardHeader accounts={accounts} categories={categories} />
            </Suspense>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DailySnapshotWidget snapshot={snapshot} />
            </div>

            {/* Visual Analysis */}
            <ReportsAnalysis monthlyData={monthlyData} summary={summary} />

            {/* Product Performance Table */}
            <SalesBreakdown data={productStats} />
        </div>
    );
}
