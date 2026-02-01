"use client";

import { useLanguage } from "@/context/language-context";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SaaSStatsCards } from "@/components/dashboard/SaaSStatsCards";
import { FinancialCharts } from "@/components/dashboard/FinancialCharts";
import { Suspense } from "react";
import { Account, Investment, ChartDataEntry, Transaction, SaaSStats } from "@/lib/types"
import { DailySnapshotWidget } from "@/components/dashboard/DailySnapshotWidget";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { TransactionManager } from "@/components/dashboard/TransactionManager";

interface DashboardClientProps {
    stats: SaaSStats;
    chartData: ChartDataEntry[];
    accounts: Account[];
    categories: string[];
    view: string;
    totalCashOut: number;
    investmentsResults: Investment[];
    transactions: Transaction[];
    snapshot: {
        total_sales: number;
        total_expenses: number;
        net_funds_flow: number;
        daily_profit_loss: number;
    };
}

export function DashboardClient({
    stats,
    chartData,
    accounts,
    categories,
    view,
    totalCashOut,
    investmentsResults,
    transactions,
    snapshot
}: DashboardClientProps) {
    const { t } = useLanguage();

    return (
        <div className="space-y-8 p-1">
            <Suspense fallback={<div className="h-20 bg-muted/20 animate-pulse rounded-lg" />}>
                <DashboardHeader accounts={accounts || []} categories={categories} />
            </Suspense>

            {/* OVERVIEW VIEW */}
            {view === 'overview' && (
                <div className="space-y-6">
                    <Suspense fallback={<div className="h-32 w-full animate-pulse bg-muted rounded-xl" />}>
                        <DailySnapshotWidget snapshot={snapshot} />
                    </Suspense>

                    <Suspense fallback={<div className="h-60 w-full animate-pulse bg-muted rounded-xl" />}>
                        <SaaSStatsCards stats={stats} />
                    </Suspense>

                    <div className="grid gap-6 grid-cols-1 xl:grid-cols-4">
                        <div className="xl:col-span-3">
                            <FinancialCharts data={chartData} />
                        </div>
                        <div className="xl:col-span-1 space-y-6">
                            <TransactionManager accounts={accounts} />
                            <RecentTransactions transactions={transactions} />
                        </div>
                    </div>
                </div>
            )}

            {/* CASH FLOW VIEW */}
            {view === 'cashflow' && (
                <div className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                            <h3 className="text-sm font-medium text-muted-foreground">{t("dashboard.cashFlow")} (In)</h3>
                            <p className="text-2xl font-bold text-emerald-600">+৳{stats.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                            <h3 className="text-sm font-medium text-muted-foreground">{t("dashboard.cashFlow")} (Out)</h3>
                            <p className="text-2xl font-bold text-red-600">-৳{totalCashOut.toLocaleString()}</p>
                        </div>
                        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                            <h3 className="text-sm font-medium text-muted-foreground">{t("dashboard.netCashFlow")}</h3>
                            <p className={`text-2xl font-bold ${(stats.totalRevenue - totalCashOut) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                {(stats.totalRevenue - totalCashOut) >= 0 ? "+" : ""}৳{(stats.totalRevenue - totalCashOut).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <FinancialCharts data={chartData} />
                </div>
            )}

            {/* PROFIT VIEW */}
            {view === 'profit' && (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="p-6 rounded-xl border bg-emerald-50/50">
                            <h3 className="text-sm font-semibold text-emerald-700">{t("reports.stats.grossProfit")}</h3>
                            <p className="text-3xl font-bold text-emerald-800">৳{stats.grossProfit.toLocaleString()}</p>
                            <p className="text-xs text-emerald-600 mt-1">{stats.grossMargin.toFixed(1)}% Margin</p>
                        </div>
                        <div className="p-6 rounded-xl border bg-blue-50/50">
                            <h3 className="text-sm font-semibold text-blue-700">{t("reports.stats.netProfit")}</h3>
                            <p className="text-3xl font-bold text-blue-800">৳{stats.netProfit.toLocaleString()}</p>
                            <p className="text-xs text-blue-600 mt-1">{stats.netProfitMargin.toFixed(1)}% Margin</p>
                        </div>
                    </div>
                    <div className="p-6 rounded-xl border">
                        <h3 className="font-semibold mb-4">{t("reports.breakdown.title")}</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span>{t("reports.summary.totalRevenue")}</span>
                                <span className="font-mono">৳{stats.totalRevenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2 text-muted-foreground">
                                <span>- {t("reports.breakdown.totalCOGS")}</span>
                                <span className="font-mono">৳{stats.totalCOGS.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2 font-medium">
                                <span>= {t("reports.stats.grossProfit")}</span>
                                <span className="font-mono">৳{stats.grossProfit.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2 text-red-500">
                                <span>- {t("reports.stats.adSpend")}</span>
                                <span className="font-mono">৳{stats.marketingCosts.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2 text-red-500">
                                <span>- {t("expenses.stats.daily")} / {t("common.actions")}</span>
                                <span className="font-mono">৳{stats.miscCosts.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2 text-red-500">
                                <span>- {t("expenses.stats.fixed")}</span>
                                <span className="font-mono">৳{stats.fixedCosts.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-2 font-bold text-lg">
                                <span>= {t("reports.stats.netProfit")}</span>
                                <span className={`font-mono ${stats.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                    ৳{stats.netProfit.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PROJECTS VIEW */}
            {view === 'projects' && (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold">{t("dashboard.projectAnalysis")}</h3>
                    {investmentsResults.length === 0 ? (
                        <p className="text-muted-foreground">{t("investments.table.noData")}</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {investmentsResults.map((inv) => {
                                const roi = inv.capital_amount > 0 ? (inv.current_return / inv.capital_amount) * 100 : 0
                                return (
                                    <div key={inv.id} className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-lg">{inv.name}</h4>
                                                <p className="text-xs text-muted-foreground">{new Date(inv.start_date).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${inv.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {inv.status === 'active' ? t("investments.table.active") : t("investments.table.closed")}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">{t("investments.table.capital")}</span>
                                                <span className="font-semibold">৳{inv.capital_amount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">{t("investments.table.return")}</span>
                                                <span className={`font-semibold ${inv.current_return >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                                                    {inv.current_return >= 0 ? "+" : ""}৳{inv.current_return.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="pt-2 border-t mt-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-semibold uppercase text-muted-foreground">ROI</span>
                                                    <span className={`text-lg font-bold ${roi >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                                                        {roi.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
