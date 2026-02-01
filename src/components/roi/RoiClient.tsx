"use client";

import { useLanguage } from "@/context/language-context";
import { SummaryCards } from "@/components/roi/SummaryCards";
import { RoiChart } from "@/components/roi/RoiChart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DateFilter } from "@/components/reports/DateFilter";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { AdSpendDialog } from "@/components/roi/AdSpendDialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Suspense } from "react";

interface RoiClientProps {
    totalSalesUnits: number;
    totalRevenue: number;
    totalOpExpense: number;
    totalAdSpend: number;
    netProfit: number;
    roiData: any[];
    chartData: any[];
    financialReport: any[];
    products: any[];
    view: string;
    year: string;
    month: string;
}

export function RoiClient({
    totalSalesUnits,
    totalRevenue,
    totalOpExpense,
    totalAdSpend,
    netProfit,
    roiData,
    chartData,
    financialReport,
    products,
    view,
    year,
    month
}: RoiClientProps) {
    const { t } = useLanguage();

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight">{t("reports.title")} (ROI & Snapshot)</h2>
                <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:ml-auto justify-end w-full md:w-auto">
                    <ExportButtons
                        data={financialReport}
                        fileName={`financial-report-${view}-${year}-${month}`}
                        pdfTitle={t("reports.title")}
                    />
                    <Suspense fallback={null}>
                        <DateFilter />
                    </Suspense>
                    <AdSpendDialog products={products || []} />
                </div>
            </div>

            <SummaryCards
                totalSales={totalSalesUnits}
                totalRevenue={totalRevenue}
                totalExpense={totalOpExpense + totalAdSpend}
                netProfit={netProfit}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <RoiChart data={chartData} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("reports.breakdown.title")}</CardTitle>
                    <CardDescription>
                        {t("reports.breakdown.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("inventory.table.product")}</TableHead>
                                <TableHead className='text-right'>{t("reports.breakdown.unitsSold")}</TableHead>
                                <TableHead className='text-right'>{t("sales.bulk.table.revenue")}</TableHead>
                                <TableHead className='text-right'>COGS</TableHead>
                                <TableHead className='text-right'>{t("expenses.categories.marketing")}</TableHead>
                                <TableHead className='text-right'>{t("reports.stats.netProfit")}</TableHead>
                                <TableHead className='text-right'>{t("reports.stats.roi")} %</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roiData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">{t("common.noData")}</TableCell>
                                </TableRow>
                            ) : (
                                roiData.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className='text-right'>{item.units}</TableCell>
                                        <TableCell className='text-right'>৳{item.revenue.toLocaleString()}</TableCell>
                                        <TableCell className='text-right'>৳{item.cogs.toLocaleString()}</TableCell>
                                        <TableCell className='text-right'>৳{item.adCost.toLocaleString()}</TableCell>
                                        <TableCell className={`text-right font-bold ${item.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ৳{item.netProfit.toLocaleString()}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Badge variant={item.roi > 50 ? 'default' : item.roi > 0 ? 'secondary' : 'destructive'}>
                                                {item.roi.toFixed(1)}%
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
