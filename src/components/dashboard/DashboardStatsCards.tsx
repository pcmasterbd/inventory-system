import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/lib/types"
import { DollarSign, TrendingUp, TrendingDown, Package, Wallet } from "lucide-react"

export function DashboardStatsCards({ stats }: { stats: DashboardStats }) {
    return (
        <div className="space-y-6">
            {/* Financial Summary */}
            {/* Financial Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-emerald-50 dark:bg-emerald-950/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">আজকের লাভ (Today's Net Profit)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700">৳{stats.todayProfit.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground pt-1">
                            Sales: ৳{stats.todaySales.toLocaleString()} | Ad: ${stats.todayAdSpend}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট ROI (Total ROI)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.totalRoi.toFixed(2)}%</div>
                        <p className="text-xs text-muted-foreground pt-1">
                            Return on Investment
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট বিক্রয় (Total Sales)</CardTitle>
                        <Wallet className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">৳{stats.totalSales.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট লাভ (Net Profit)</CardTitle>
                        <Wallet className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            ৳{stats.netProfit.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Fund Management */}
            <h2 className="text-lg font-semibold tracking-tight">তহবিল ও স্টক (Funds & Assets)</h2>
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-green-50 dark:bg-green-950/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ক্যাশ ইন হ্যান্ড (Cash)</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{stats.cashBalance.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 dark:bg-blue-950/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ব্যাংক ব্যালেন্স (Bank)</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{stats.bankBalance.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card className="bg-pink-50 dark:bg-pink-950/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">বিকাশ/নগদ (Mobile)</CardTitle>
                        <DollarSign className="h-4 w-4 text-pink-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{stats.mobileBalance.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">স্টক ভ্যালু (Stock)</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{stats.totalStockValue.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
