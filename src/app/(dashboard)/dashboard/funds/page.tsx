import { createClient } from '@/lib/supabase/server'
import { FundsClient } from '@/components/funds/FundsClient'

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

    const view = (searchParams?.view as string) || "monthly"
    const year = (searchParams?.year as string) || new Date().getFullYear().toString()
    const month = (searchParams?.month as string) || (new Date().getMonth() + 1).toString().padStart(2, '0')

    let startDate, endDate

    if (view === 'monthly') {
        startDate = `${year}-${month}-01`
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
        endDate = `${year}-${month}-${lastDay}`
    } else {
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

    const totalDeposits = transactions
        ?.filter(t => t.transaction_type === 'deposit' || t.transaction_type === 'sales_deposit')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const totalWithdrawals = transactions
        ?.filter(t => t.transaction_type === 'withdrawal' || t.transaction_type === 'expense_payment')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const periodBalance = totalDeposits - totalWithdrawals

    const exportData = transactions?.map(t => ({
        Date: t.date,
        Type: t.transaction_type,
        Description: t.description || '-',
        Amount: t.amount,
        Category: t.category || '-'
    })) || []

    return (
        <FundsClient
            transactions={transactions || []}
            totalDeposits={totalDeposits}
            totalWithdrawals={totalWithdrawals}
            periodBalance={periodBalance}
            exportData={exportData}
            view={view}
            year={year}
            month={month}
        />
    )
}
