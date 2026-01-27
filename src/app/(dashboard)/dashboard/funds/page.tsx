import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FundsTransactionList } from '@/components/funds/FundsTransactionList'
import { AddTransactionModal } from '@/components/funds/AddTransactionModal'
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react'
import { DateFilter } from '@/components/reports/DateFilter'
import { ExportButtons } from '@/components/reports/ExportButtons'

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function FundsPage(props: PageProps) {
    const searchParams = await props.searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Please log in to view funds.</div>
    }

    // --- Filter Logic ---
    const view = (searchParams?.view as string) || "monthly"
    const year = (searchParams?.year as string) || new Date().getFullYear().toString()
    const month = (searchParams?.month as string) || (new Date().getMonth() + 1).toString().padStart(2, '0')

    let startDate, endDate

    if (view === 'monthly') {
        startDate = `${year}-${month}-01`
        // Last day of month
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
        endDate = `${year}-${month}-${lastDay}`
    } else {
        // Yearly
        startDate = `${year}-01-01`
        endDate = `${year}-12-31`
    }

    const { data: transactions, error } = await supabase
        .from('funds_transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching funds:', error)
        return <div>Error loading funds data.</div>
    }

    // Calculate Balances
    const totalDeposits = transactions
        ?.filter(t => t.transaction_type === 'deposit' || t.transaction_type === 'sales_deposit')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const totalWithdrawals = transactions
        ?.filter(t => t.transaction_type === 'withdrawal' || t.transaction_type === 'expense_payment')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    // Net Balance for *selected period* (Note: Real balance is cumulative, but this shows period flow)
    const periodBalance = totalDeposits - totalWithdrawals

    // --- Prepare Export Data ---
    const exportData = transactions?.map(t => ({
        Date: t.date,
        Type: t.transaction_type,
        Description: t.description || '-',
        Amount: t.amount,
        Category: t.category || '-'
    })) || []


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Accounts (Funds)</h1>
                <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:ml-auto justify-end w-full md:w-auto">
                    <ExportButtons
                        data={exportData}
                        fileName={`funds-${view}-${year}-${view === 'monthly' ? month : ''}`}
                        pdfTitle="Funds Transaction Report"
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
                        <CardTitle className="text-sm font-medium">ব্যালেন্স (Selected Period)</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${periodBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {periodBalance > 0 ? '+' : ''}৳{periodBalance.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Flow for {view === 'monthly' ? `${month}/${year}` : year}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">মোট জমা (Total In)</CardTitle>
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
                        <CardTitle className="text-sm font-medium">মোট উত্তোলন (Total Out)</CardTitle>
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
                    <CardTitle>লেনদেনের ইতিহাস (Transaction History)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='overflow-x-auto'>
                        <FundsTransactionList initialTransactions={transactions || []} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
