export type Product = {
    id: string
    name: string
    description: string | null
    stock_quantity: number
    selling_price: number
    cost_price: number
    created_at: string
}

export type Transaction = {
    id: string
    type: 'income' | 'expense'
    amount: number
    description: string | null
    date: string
    product_id: string | null
    created_at: string
    product?: Product // joined
}

export type DashboardStats = {
    todaySales: number
    todayProfit: number
    totalRoi: number
    todayAdSpend: number
    totalSales: number
    totalCOGS: number
    totalExpense: number
    netProfit: number
    totalStockValue: number
    cashBalance: number
    bankBalance: number
    mobileBalance: number
}

export type Party = {
    id: string
    name: string
    type: 'customer' | 'supplier' | 'investor'
    phone: string | null
    address: string | null
    balance: number
    created_at: string
}
