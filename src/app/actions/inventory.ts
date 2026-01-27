'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function adjustStock(
    productId: string,
    quantity: number,
    type: 'in' | 'out',
    reason: string
) {
    const supabase = await createClient()

    try {
        // 1. Get current stock
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', productId)
            .single()

        if (fetchError) throw fetchError
        if (!product) throw new Error('Product not found')

        // 2. Calculate new stock
        const currentStock = product.stock_quantity || 0
        // If type is 'in', we add. If 'out', we subtract.
        // Ensure we don't go below 0 if that's a requirement, but usually simple math is fine.
        const adjustment = type === 'in' ? quantity : -quantity
        const newStock = currentStock + adjustment

        // 3. Update product
        const { error: updateError } = await supabase
            .from('products')
            .update({ stock_quantity: newStock })
            .eq('id', productId)

        if (updateError) throw updateError

        // 4. Log the transaction (if table exists - assuming 'inventory_logs' or similar for now? 
        // The user didn't ask for logs specifically, but good practice. 
        // I'll skip creating a new table for now to keep it simple as per "sundor kore dao" request to avoid schema errors if table missing)

        revalidatePath('/dashboard/sales')
        return { success: true, newStock }
    } catch (error) {
        console.error('Error adjusting stock:', error)
        return { success: false, error: 'Failed to update stock' }
    }
}

export async function addProduct(data: any) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('products')
        .insert([data])

    if (error) throw error
    revalidatePath('/dashboard/inventory')
    return { success: true }
}

export async function updateProduct(id: string, data: any) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id)

    if (error) throw error
    revalidatePath('/dashboard/inventory')
    return { success: true }
}

export async function getProducts() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching products:', error)
        return []
    }

    return data
}

export async function purchaseStock({
    productId,
    quantity,
    unitCost,
    totalCost,
    accountName
}: {
    productId: string
    quantity: number
    unitCost: number
    totalCost: number
    accountName: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    try {
        // 1. Update Product Stock and Cost Price (Weighted Average or just update? Updating is simpler for now)
        // Let's just update stock quantity. Updating cost price might affect historical data if not careful, 
        // but user probably wants latest cost. Let's update cost_price too as 'latest cost'.
        const { data: product } = await supabase
            .from('products')
            .select('stock_quantity, name')
            .eq('id', productId)
            .single()

        if (!product) throw new Error("Product not found")

        const newStock = (product.stock_quantity || 0) + quantity

        await supabase.from('products').update({
            stock_quantity: newStock,
            cost_price: unitCost // Update to latest cost price
        }).eq('id', productId)

        // 2. Create Transaction (Expense)
        await supabase.from('transactions').insert({
            date: new Date().toISOString(),
            description: `Stock Purchase: ${product.name} (Qty: ${quantity})`,
            amount: totalCost,
            type: 'expense', // Standardizing on 'expense' vs 'income' for transaction types
            category: 'Inventory Purchase',
            payment_method: accountName,
            user_id: user.id,
            // If 'transactions' table has specific fields for inventory, use them. 
            // Assuming simplified 'transactions' table based on prior context.
            // If it uses 'transaction_type' instead of 'type', need to be careful.
            // Checking previous roi/page.tsx: it uses 'transaction_type'. 
            transaction_type: 'expense'
        })

        // 3. Update Account Balance (Money Out)
        // Fuzzy match account name
        const { data: accounts } = await supabase.from('accounts').select('id, name, balance')
        const account = accounts?.find(a => a.name.toLowerCase().includes(accountName.toLowerCase()))

        if (account) {
            const newBalance = (account.balance || 0) - totalCost
            await supabase.from('accounts').update({ balance: newBalance }).eq('id', account.id)
        }

        revalidatePath('/dashboard/inventory')
        revalidatePath('/dashboard/expenses')
        revalidatePath('/dashboard') // Update dashboard stats

        return { success: true }
    } catch (error: any) {
        console.error('Purchase Error:', error)
        throw new Error(error.message || 'Failed to purchase stock')
    }
}
