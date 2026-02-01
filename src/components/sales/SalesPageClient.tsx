"use client";

import { Suspense } from "react";
import { useLanguage } from "@/context/language-context";
import { PosInterface } from "@/components/sales/PosInterface";
import { SalesList } from "@/components/sales/SalesList";
import { SalesSummary } from "@/components/sales/SalesSummary";
import { BulkSalesInterface } from "@/components/sales/BulkSalesInterface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DailySnapshotWidget } from "@/components/dashboard/DailySnapshotWidget";

interface SalesPageClientProps {
    products: any[];
    customers: any[];
    invoices: any[];
    summaryData: any[];
    accounts: any[];
    categories: any[];
    snapshot: any;
}

export function SalesPageClient({
    products,
    customers,
    invoices,
    summaryData,
    accounts,
    categories,
    snapshot
}: SalesPageClientProps) {
    const { t } = useLanguage();

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t("sales.title")}</h2>
                    <p className="text-muted-foreground">
                        {t("sales.description")}
                    </p>
                </div>
            </div>

            <Suspense fallback={<div className="h-20 bg-muted/20 animate-pulse rounded-lg" />}>
                <DashboardHeader accounts={accounts} categories={categories} />
            </Suspense>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DailySnapshotWidget snapshot={snapshot} />
            </div>

            <Tabs defaultValue="bulk" className="flex-1 flex flex-col">
                <div className="shrink-0 mb-4">
                    <TabsList>
                        <TabsTrigger value="bulk">{t("sales.tabs.dailySheet")}</TabsTrigger>
                        <TabsTrigger value="pos">{t("sales.tabs.pos")}</TabsTrigger>
                        <TabsTrigger value="history">{t("sales.tabs.history")}</TabsTrigger>
                        <TabsTrigger value="summary">{t("sales.tabs.summary")}</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="bulk" className="flex-1 mt-0 border rounded-lg p-4 bg-card data-[state=inactive]:hidden">
                    <BulkSalesInterface products={products || []} />
                </TabsContent>

                <TabsContent value="pos" className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden">
                    <PosInterface
                        products={products || []}
                        customers={customers || []}
                    />
                </TabsContent>

                <TabsContent value="history" className="flex-1 overflow-auto mt-0 border rounded-lg p-4 bg-card h-full data-[state=inactive]:hidden">
                    <SalesList invoices={invoices || []} />
                </TabsContent>

                <TabsContent value="summary" className="flex-1 overflow-auto mt-0 border rounded-lg p-4 bg-card h-full data-[state=inactive]:hidden">
                    <SalesSummary data={summaryData || []} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
