"use client";

import { useLanguage } from "@/context/language-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";

interface PartnerReportClientProps {
    investments: any[];
    totalCapital: number;
    netProfit: number;
    months: number;
}

export function PartnerReportClient({
    investments,
    totalCapital,
    netProfit,
    months
}: PartnerReportClientProps) {
    const { t } = useLanguage();

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t("reports.title")} (Partner Profit Share)</h2>
                    <p className="text-muted-foreground">
                        {t("investments.description")}
                    </p>
                </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("investments.stats.totalCapital")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{totalCapital.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("reports.stats.netProfit")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            ৳{netProfit.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">After expenses & fixed costs ({months} {t("dashboard.thisMonth")})</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("investments.stats.activePortfolios")}</CardTitle>
                    <CardDescription>
                        Share % = (Partner Capital / Total Capital) * 100
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("parties.table.name")}</TableHead>
                                <TableHead className="text-right">{t("investments.table.capital")}</TableHead>
                                <TableHead className="text-center">Share %</TableHead>
                                <TableHead className="text-right">{t("reports.stats.netProfit")} Share</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {investments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        {t("common.noData")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                investments.map((inv) => {
                                    const sharePct = totalCapital > 0 ? (Number(inv.capital_amount) / totalCapital) * 100 : 0
                                    const profitShare = (netProfit * sharePct) / 100

                                    return (
                                        <TableRow key={inv.id}>
                                            <TableCell className="font-medium">{inv.name}</TableCell>
                                            <TableCell className="text-right">৳{Number(inv.capital_amount).toLocaleString()}</TableCell>
                                            <TableCell className="text-center">{sharePct.toFixed(2)}%</TableCell>
                                            <TableCell className={`text-right font-bold ${profitShare >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                                ৳{profitShare.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {netProfit < 0 && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Loss Warning</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>
                                    Business is currently in loss. Partner capital might be adjusted.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
