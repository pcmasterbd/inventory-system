import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react'

export async function DailySnapshotWidget() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch today's snapshot from the view
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
        .from('daily_business_snapshot')
        .select('*')
        .eq('date', today)
        .eq('user_id', user.id)
        .single()

    // Use data or default to 0
    const snapshot = data || {
        total_sales: 0,
        total_expenses: 0,
        net_funds_flow: 0,
        daily_profit_loss: 0
    }

    // Calculate Funds (This needs a separate query for "Current Balance" as snapshot is daily flow)
    // But for the widget, maybe we just show Today's Stats.

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">দৈনিক বিক্রয় (Daily Sales)</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳{Number(snapshot.total_sales).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">আজকের আয় (Today's Revenue)</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">দৈনিক খরচ (Daily Expenses)</CardTitle>
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳{Number(snapshot.total_expenses).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">আজকের ব্যয় (Today's Cost)</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">দৈনিক লাভ/ক্ষতি (Profit/Loss)</CardTitle>
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${snapshot.daily_profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ৳{Number(snapshot.daily_profit_loss).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">বিক্রয় - খরচ (Sales - Expenses)</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">নেট ক্যাশ ফ্লো (Net Cash Flow)</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${snapshot.net_funds_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {snapshot.net_funds_flow > 0 ? '+' : ''}৳{Number(snapshot.net_funds_flow).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">নগদ আগমন/বহির্গমন (Cash In/Out)</p>
                </CardContent>
            </Card>
        </div>
    )
}
