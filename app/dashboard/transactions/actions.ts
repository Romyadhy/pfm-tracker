'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../utils/supabase/server'

export async function addTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const amount = formData.get('amount') as string
  const type = formData.get('type') as string
  const category_id = formData.get('category_id') as string
  const note = formData.get('note') as string
  const date = formData.get('date') as string

  // ponytail: support custom transaction date or fallback to current timestamp
  const insertPayload: Record<string, unknown> = {
    user_id: user.id,
    amount: Number(amount),
    type: type,
    category_id: Number(category_id),
    note: note
  }

  if (date) {
    insertPayload.created_at = new Date(`${date}T12:00:00`).toISOString()
  }

  const { error } = await supabase
    .from('transactions')
    .insert(insertPayload)

  if (error) {
    console.error("Gagal menyimpan data:", error)
    return
  }

  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard')
}

export async function updateTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const id = formData.get('id') as string
  const amount = formData.get('amount') as string
  const type = formData.get('type') as string
  const category_id = formData.get('category_id') as string
  const note = formData.get('note') as string
  const date = formData.get('date') as string

  // ponytail: atomic update with user ownership verification
  const updatePayload: Record<string, unknown> = {
    amount: Number(amount),
    type: type,
    category_id: Number(category_id),
    note: note
  }

  if (date) {
    updatePayload.created_at = new Date(`${date}T12:00:00`).toISOString()
  }

  const { error } = await supabase
    .from('transactions')
    .update(updatePayload)
    .eq('id', Number(id))
    .eq('user_id', user.id)

  if (error) {
    console.error("Gagal memperbarui data:", error)
    return
  }

  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard')
}

export async function deleteTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const id = formData.get('id') as string

  // ponytail: verify user_id ownership on delete
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', Number(id))
    .eq('user_id', user.id)

  if (error) {
    console.error("Gagal menghapus data:", error)
    return
  }

  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard')
}
