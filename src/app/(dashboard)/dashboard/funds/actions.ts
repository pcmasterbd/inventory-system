'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addFundTransaction(formData: FormData) {
    const supabase = await createClient()

    const amount = parseFloat(formData.get('amount') as string)
    const transaction_type = formData.get('transaction_type') as string
    const description = formData.get('description') as string
    const date = formData.get('date') as string || new Date().toISOString().split('T')[0]

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('funds_transactions')
        .insert({
            user_id: user.id,
            amount,
            transaction_type,
            description,
            date,
        })

    if (error) {
        console.error('Error adding fund transaction:', error)
        return { error: 'Failed to add transaction' }
    }

    revalidatePath('/dashboard/funds')
    return { success: true }
}

export async function deleteFundTransaction(id: string) {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('funds_transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        return { error: 'Failed to delete transaction' }
    }

    revalidatePath('/dashboard/funds')
    return { success: true }
}
