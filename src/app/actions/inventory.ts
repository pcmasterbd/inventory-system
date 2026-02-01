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
        const adjustment = type === 'in' ? quantity : -quantity
        const newStock = currentStock + adjustment

        // 3. Update product
        const { error: updateError } = await supabase
            .from('products')
            .update({ stock_quantity: newStock })
            .eq('id', productId)

        if (updateError) throw updateError

        revalidatePath('/dashboard/sales')
        return { success: true, newStock }
    } catch (error) {
        console.error('Error adjusting stock:', error)
        return { success: false, error: 'Failed to update stock' }
    }
}

export async function addProduct(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('products')
        .insert([{ ...data, user_id: user.id }])

    if (error) throw error
    revalidatePath('/dashboard/inventory')
    return { success: true }
}

export async function updateProduct(id: string, data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)

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
    accountId
}: {
    productId: string
    quantity: number
    unitCost: number
    totalCost: number
    accountId: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    try {
        // 1. Update Product Stock and Cost Price
        const { data: product } = await supabase
            .from('products')
            .select('stock_quantity, name')
            .eq('id', productId)
            .single()

        if (!product) throw new Error("Product not found")

        const newStock = (product.stock_quantity || 0) + quantity

        const { error: prodError } = await supabase.from('products').update({
            stock_quantity: newStock,
            cost_price: unitCost
        }).eq('id', productId)

        if (prodError) throw prodError

        // 2. Create Transaction (Expense)
        const { error: txError } = await supabase.from('transactions').insert({
            date: new Date().toISOString(),
            description: `Stock Purchase: ${product.name} (Qty: ${quantity})`,
            amount: totalCost,
            transaction_type: 'expense',
            account_id: accountId,
            user_id: user.id,
            category: 'Inventory Purchase'
        })

        if (txError) {
            console.error("Transaction Error:", txError)
            throw txError
        }

        // 3. Update Account Balance
        const { data: account } = await supabase.from('accounts').select('balance').eq('id', accountId).single()

        if (account) {
            const newBalance = (Number(account.balance) || 0) - totalCost
            await supabase.from('accounts').update({ balance: newBalance }).eq('id', accountId)
        }

        revalidatePath('/dashboard/inventory')
        revalidatePath('/dashboard')

        return { success: true }
    } catch (error: any) {
        console.error('Purchase Error:', error)
        throw new Error(error.message || 'Failed to purchase stock')
    }
}

export async function deleteProduct(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) throw error
    revalidatePath('/dashboard/inventory')
    return { success: true }
}
