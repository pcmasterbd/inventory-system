"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react'
import { useLanguage } from '@/context/language-context'

interface DailySnapshotWidgetProps {
    snapshot: {
        total_sales: number;
        total_expenses: number;
        net_funds_flow: number;
        daily_profit_loss: number;
    }
}

export function DailySnapshotWidget({ snapshot }: DailySnapshotWidgetProps) {
    const { t } = useLanguage();

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("dashboard.dailyRevenue")}</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳{Number(snapshot.total_sales).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{t("dashboard.todayRevenue")}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("dashboard.dailyExpenses")}</CardTitle>
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳{Number(snapshot.total_expenses).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{t("dashboard.todayCost")}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("dashboard.profitLoss")}</CardTitle>
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${snapshot.daily_profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ৳{Number(snapshot.daily_profit_loss).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">{t("dashboard.salesMinusExpenses")}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t("dashboard.netCashFlow")}</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${snapshot.net_funds_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {snapshot.net_funds_flow > 0 ? '+' : ''}৳{Number(snapshot.net_funds_flow).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">{t("dashboard.cashInOut")}</p>
                </CardContent>
            </Card>
        </div>
    )
}
