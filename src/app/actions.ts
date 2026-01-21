'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addProduct(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const stock = parseInt(formData.get('stock') as string)
    const price = parseFloat(formData.get('price') as string)
    const cost_price = parseFloat(formData.get('cost_price') as string)

    const { error } = await supabase.from('products').insert({
        name,
        description,
        stock,
        price,
        cost_price
    })

    if (error) {
        console.error('Error adding product:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function addTransaction(formData: FormData) {
    const supabase = await createClient()

    const type = formData.get('type') as 'income' | 'expense'
    const amount = parseFloat(formData.get('amount') as string)
    const description = formData.get('description') as string
    // product_id is optional
    const productId = formData.get('product_id') as string || null

    const { error } = await supabase.from('transactions').insert({
        type,
        amount,
        description,
        product_id: productId
    })

    if (error) {
        console.error('Error adding transaction:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function deleteProduct(id: string, formData?: FormData) {
    const supabase = await createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true }
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/')
    redirect('/login')
}

export async function addParty(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const balance = parseFloat(formData.get('balance') as string) || 0

    const { error } = await supabase.from('parties').insert({
        name,
        type,
        phone,
        address,
        balance
    })

    if (error) {
        console.error('Error adding party:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/parties')
    return { success: true }
}

export async function deleteParty(id: string, formData?: FormData) {
    const supabase = await createClient()
    const { error } = await supabase.from('parties').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/dashboard/parties')
    return { success: true }
}
