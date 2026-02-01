"use client";

import { useLanguage } from "@/context/language-context";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FundsTransactionList } from '@/components/funds/FundsTransactionList';
import { AddTransactionModal } from '@/components/funds/AddTransactionModal';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { DateFilter } from '@/components/reports/DateFilter';
import { ExportButtons } from '@/components/reports/ExportButtons';
import { Suspense } from 'react';

interface FundsClientProps {
    transactions: any[];
    totalDeposits: number;
    totalWithdrawals: number;
    periodBalance: number;
    exportData: any[];
    view: string;
    year: string;
    month: string;
}

export function FundsClient({
    transactions,
    totalDeposits,
    totalWithdrawals,
    periodBalance,
    exportData,
    view,
    year,
    month
}: FundsClientProps) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">{t("accounts.title")} ({t("accounts.tabs.funds")})</h1>
                <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:ml-auto justify-end w-full md:w-auto">
                    <ExportButtons
                        data={exportData}
                        fileName={`funds-${view}-${year}-${view === 'monthly' ? month : ''}`}
                        pdfTitle={t("accounts.recentTransactions")}
                    />
                    <Suspense fallback={null}>
                        <DateFilter />
                    </Suspense>
                    <AddTransactionModal />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("accounts.table.balance")} ({t("dashboard.dateRange")})</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${periodBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {periodBalance > 0 ? '+' : ''}৳{periodBalance.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {view === 'monthly' ? `${month}/${year}` : year}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("reports.stats.totalIn")}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ৳{totalDeposits.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("reports.stats.totalOut")}</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            ৳{totalWithdrawals.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("accounts.recentTransactions")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='overflow-x-auto'>
                        <FundsTransactionList initialTransactions={transactions || []} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
