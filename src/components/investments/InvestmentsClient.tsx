"use client";

import { useLanguage } from "@/context/language-context";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InvestmentEntryDialog } from "@/components/investments/InvestmentEntryDialog";
import { TrendingUp, Briefcase, DollarSign } from "lucide-react";

interface InvestmentsClientProps {
    investments: any[];
}

export function InvestmentsClient({ investments }: InvestmentsClientProps) {
    const { t } = useLanguage();

    const totalInvested = investments.reduce((sum, item) => sum + Number(item.capital_amount), 0);
    const totalReturns = investments.reduce((sum, item) => sum + Number(item.current_return), 0);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t("investments.title")}</h2>
                    <p className="text-muted-foreground">
                        {t("investments.description")}
                    </p>
                </div>
                <InvestmentEntryDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title={t("investments.stats.totalCapital")}
                    value={`৳${totalInvested.toLocaleString()}`}
                    icon={DollarSign}
                    trend="neutral"
                    trendValue="Capital"
                    color="primary"
                />
                <StatsCard
                    title={t("investments.stats.totalReturns")}
                    value={`৳${totalReturns.toLocaleString()}`}
                    icon={TrendingUp}
                    trend={totalReturns >= 0 ? "up" : "down"}
                    trendValue="Returns"
                    color={totalReturns >= 0 ? "success" : "danger"}
                />
                <StatsCard
                    title={t("investments.stats.activePortfolios")}
                    value={investments.filter(i => i.status === "active").length.toString()}
                    icon={Briefcase}
                    trend="neutral"
                    trendValue="Active"
                    color="primary"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("investments.table.portfolio")}</TableHead>
                            <TableHead>{t("investments.table.startDate")}</TableHead>
                            <TableHead>{t("investments.table.capital")}</TableHead>
                            <TableHead>{t("investments.table.currentReturn")}</TableHead>
                            <TableHead>{t("investments.table.status")}</TableHead>
                            <TableHead className="text-right">{t("common.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {investments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                    {t("common.noData")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            investments.map((inv) => (
                                <TableRow key={inv.id}>
                                    <TableCell className="font-medium">{inv.name}</TableCell>
                                    <TableCell>{new Date(inv.start_date).toLocaleDateString()}</TableCell>
                                    <TableCell>৳{inv.capital_amount}</TableCell>
                                    <TableCell className={inv.current_return >= 0 ? "text-green-600" : "text-red-600"}>
                                        ৳{inv.current_return}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={inv.status === "active" ? "default" : "secondary"}>
                                            {inv.status === "active" ? t("investments.table.active") : t("investments.table.closed")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <InvestmentEntryDialog investment={inv} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
