export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            roi_categories: {
                Row: {
                    id: string
                    name: string
                    unit_price: number
                    cogs_per_unit: number
                    created_at: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    name: string
                    unit_price: number
                    cogs_per_unit?: number
                    created_at?: string
                    user_id: string
                }
                Update: {
                    id?: string
                    name?: string
                    unit_price?: number
                    cogs_per_unit?: number
                    created_at?: string
                    user_id?: string
                }
            }
            roi_sales_records: {
                Row: {
                    id: string
                    date: string
                    category_id: string
                    units_sold: number
                    returns: number
                    created_at: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    date: string
                    category_id: string
                    units_sold: number
                    returns?: number
                    created_at?: string
                    user_id: string
                }
                Update: {
                    id?: string
                    date?: string
                    category_id?: string
                    units_sold?: number
                    returns?: number
                    created_at?: string
                    user_id?: string
                }
            }
            roi_expenses: {
                Row: {
                    id: string
                    date: string
                    description: string
                    amount: number
                    expense_type: 'fixed' | 'variable' | 'ad_cost' | 'salary' | 'other'
                    created_at: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    date: string
                    description: string
                    amount: number
                    expense_type: 'fixed' | 'variable' | 'ad_cost' | 'salary' | 'other'
                    created_at?: string
                    user_id: string
                }
                Update: {
                    id?: string
                    date?: string
                    description?: string
                    amount?: number
                    expense_type?: 'fixed' | 'variable' | 'ad_cost' | 'salary' | 'other'
                    created_at?: string
                    user_id?: string
                }
            }
            products: {
                Row: {
                    id: string
                    name: string
                    sku: string | null
                    description: string | null
                    selling_price: number
                    cost_price: number
                    stock_quantity: number
                    category_id: string | null
                    image_url: string | null
                    created_at: string
                    user_id: string
                    type: 'physical' | 'digital'
                }
                Insert: {
                    id?: string
                    name: string
                    sku?: string | null
                    description?: string | null
                    selling_price?: number
                    cost_price?: number
                    stock_quantity?: number
                    category_id?: string | null
                    image_url?: string | null
                    created_at?: string
                    user_id: string
                    type?: 'physical' | 'digital'
                }
                Update: {
                    id?: string
                    name?: string
                    sku?: string | null
                    description?: string | null
                    selling_price?: number
                    cost_price?: number
                    stock_quantity?: number
                    category_id?: string | null
                    image_url?: string | null
                    created_at?: string
                    user_id?: string
                    type?: 'physical' | 'digital'
                }
            }
            daily_sales: {
                Row: {
                    id: string
                    date: string
                    product_id: string
                    quantity_sold: number
                    quantity_returned: number
                    ad_cost_dollar: number
                    created_at: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    date?: string
                    product_id: string
                    quantity_sold?: number
                    quantity_returned?: number
                    ad_cost_dollar?: number
                    created_at?: string
                    user_id?: string
                }
                Update: {
                    id?: string
                    date?: string
                    product_id?: string
                    quantity_sold?: number
                    quantity_returned?: number
                    ad_cost_dollar?: number
                    created_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "daily_sales_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            investments: {
                Row: {
                    id: string
                    name: string
                    start_date: string
                    capital_amount: number
                    current_return: number
                    status: 'active' | 'closed'
                    user_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    start_date: string
                    capital_amount: number
                    current_return?: number
                    status?: 'active' | 'closed'
                    user_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    start_date?: string
                    capital_amount?: number
                    current_return?: number
                    status?: 'active' | 'closed'
                    user_id?: string
                    created_at?: string
                }
                Relationships: []
            }
            settings: {
                Row: {
                    id: string
                    dollar_rate: number
                    office_rent: number
                    monthly_salaries: number
                    created_at: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    dollar_rate?: number
                    office_rent?: number
                    monthly_salaries?: number
                    created_at?: string
                    updated_at?: string
                    user_id?: string
                }
                Update: {
                    id?: string
                    dollar_rate?: number
                    office_rent?: number
                    monthly_salaries?: number
                    created_at?: string
                    updated_at?: string
                    user_id?: string
                }
                Relationships: []
            }
            inventory_transactions: {
                Row: {
                    id: string
                    product_id: string
                    quantity: number
                    transaction_type: 'purchase' | 'sale' | 'adjustment' | 'return'
                    reason: string | null
                    date: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    product_id: string
                    quantity: number
                    transaction_type: 'purchase' | 'sale' | 'adjustment' | 'return'
                    reason?: string | null
                    date?: string
                    user_id: string
                }
                Update: {
                    id?: string
                    product_id?: string
                    quantity?: number
                    transaction_type?: 'purchase' | 'sale' | 'adjustment' | 'return'
                    reason?: string | null
                    date?: string
                    user_id?: string
                }
            }
            parties: {
                Row: {
                    id: string
                    name: string
                    type: 'customer' | 'supplier'
                    phone: string | null
                    email: string | null
                    address: string | null
                    balance: number
                    created_at: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    name: string
                    type: 'customer' | 'supplier'
                    phone?: string | null
                    email?: string | null
                    address?: string | null
                    balance?: number
                    created_at?: string
                    user_id: string
                }
                Update: {
                    id?: string
                    name?: string
                    type?: 'customer' | 'supplier'
                    phone?: string | null
                    email?: string | null
                    address?: string | null
                    balance?: number
                    created_at?: string
                    user_id?: string
                }
            }
            invoices: {
                Row: {
                    id: string
                    invoice_number: string
                    customer_id: string | null
                    total_amount: number
                    discount: number
                    paid_amount: number
                    due_amount: number
                    status: 'paid' | 'partial' | 'unpaid' | 'cancelled'
                    date: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    invoice_number: string
                    customer_id?: string | null
                    total_amount?: number
                    discount?: number
                    paid_amount?: number
                    status?: 'paid' | 'partial' | 'unpaid' | 'cancelled'
                    date?: string
                    user_id: string
                }
                Update: {
                    id?: string
                    invoice_number?: string
                    customer_id?: string | null
                    total_amount?: number
                    discount?: number
                    paid_amount?: number
                    status?: 'paid' | 'partial' | 'unpaid' | 'cancelled'
                    date?: string
                    user_id?: string
                }
            }
            invoice_items: {
                Row: {
                    id: string
                    invoice_id: string
                    product_id: string
                    quantity: number
                    unit_price: number
                    subtotal: number
                    user_id: string
                }
                Insert: {
                    id?: string
                    invoice_id: string
                    product_id: string
                    quantity: number
                    unit_price: number
                    user_id: string
                }
                Update: {
                    id?: string
                    invoice_id?: string
                    product_id?: string
                    quantity?: number
                    unit_price?: number
                    user_id?: string
                }
            }
            accounts: {
                Row: {
                    id: string
                    name: string
                    balance: number
                    created_at: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    name: string
                    balance?: number
                    created_at?: string
                    user_id: string
                }
                Update: {
                    id?: string
                    name?: string
                    balance?: number
                    created_at?: string
                    user_id?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    account_id: string
                    amount: number
                    transaction_type: 'income' | 'expense' | 'transfer'
                    category: string | null
                    description: string | null
                    reference_id: string | null
                    date: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    account_id: string
                    amount: number
                    transaction_type: 'income' | 'expense' | 'transfer'
                    category?: string | null
                    description?: string | null
                    reference_id?: string | null
                    date?: string
                    user_id: string
                }
                Update: {
                    id?: string
                    account_id?: string
                    amount?: number
                    transaction_type?: 'income' | 'expense' | 'transfer'
                    category?: string | null
                    description?: string | null
                    reference_id?: string | null
                    date?: string
                    user_id?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
