export type Product = {
    id: string
    name: string
    description: string | null
    stock_quantity: number
    selling_price: number
    cost_price: number
    type: 'physical' | 'digital'
    category_id?: string
    image_url?: string | null
    created_at: string
    user_id: string
}

export type Transaction = {
    id: string
    account_id: string
    amount: number
    transaction_type: 'income' | 'expense' | 'transfer'
    category: string | null
    description: string | null
    reference_id: string | null
    date: string
    created_at: string
    user_id: string
    accounts?: { name: string } // joined
}

export type Account = {
    id: string
    name: string
    balance: number
    created_at: string
    user_id: string
}

export type Party = {
    id: string
    name: string
    type: 'customer' | 'supplier' | 'investor'
    phone: string | null
    email?: string | null
    address: string | null
    balance: number
    created_at: string
    user_id: string
}

export type Investment = {
    id: string
    name: string
    capital_amount: number
    current_return: number
    status: 'active' | 'closed'
    start_date: string
    created_at: string
    user_id: string
}

export type ChartDataEntry = {
    date: string
    revenue: number
    cogs: number
    expenses: number
}

export interface SaaSStats {
    totalRevenue: number
    operationalExpenses: number
    fixedCosts: number
    miscCosts: number
    marketingCosts: number
    grossProfit: number
    netProfit: number
    currentBalance: number
    grossMargin: number
    netProfitMargin: number
    operatingRatio: number
    profitStatus: 'Profitable' | 'Loss'
    totalCOGS: number
}
