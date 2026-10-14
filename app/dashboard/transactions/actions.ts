'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../utils/supabase/server'

export type ActionResult = { error: string } | { success: true }

// ponytail: default categories seeded once per new user
const DEFAULT_CATEGORIES = [
  'Makanan & Minuman',
  'Transport',
  'Belanja',
  'Kesehatan',
  'Hiburan',
  'Tagihan & Utilitas',
  'Pendidikan',
  'Gaji',
  'Bisnis',
  'Lainnya',
]

export async function seedDefaultCategories(userId: string) {
  const supabase = await createClient()
  await supabase.from('categories').insert(
    DEFAULT_CATEGORIES.map((name) => ({ name, user_id: userId }))
  )
}

// ── Transaction Actions ───────────────────────────────────

export async function addTransaction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sesi tidak valid, silakan login ulang' }

  const amount = formData.get('amount') as string
  const type = formData.get('type') as string
  const category_id = formData.get('category_id') as string
  const note = formData.get('note') as string
  const date = formData.get('date') as string

  // ponytail: plain if-checks, no Zod needed
  if (!date) return { error: 'Tanggal transaksi wajib diisi' }
  if (!amount || Number(amount) <= 0) return { error: 'Nominal harus lebih dari 0' }
  if (!category_id || isNaN(Number(category_id))) return { error: 'Pilih kategori terlebih dahulu' }

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    amount: Number(amount),
    type,
    category_id: Number(category_id),
    note: note || null,
    created_at: new Date(`${date}T12:00:00`).toISOString(),
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateTransaction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sesi tidak valid, silakan login ulang' }

  const id = formData.get('id') as string
  const amount = formData.get('amount') as string
  const type = formData.get('type') as string
  const category_id = formData.get('category_id') as string
  const note = formData.get('note') as string
  const date = formData.get('date') as string

  if (!date) return { error: 'Tanggal transaksi wajib diisi' }
  if (!amount || Number(amount) <= 0) return { error: 'Nominal harus lebih dari 0' }
  if (!category_id || isNaN(Number(category_id))) return { error: 'Pilih kategori terlebih dahulu' }

  // ponytail: atomic update with user ownership verification
  const { error } = await supabase
    .from('transactions')
    .update({
      amount: Number(amount),
      type,
      category_id: Number(category_id),
      note: note || null,
      created_at: new Date(`${date}T12:00:00`).toISOString(),
    })
    .eq('id', Number(id))
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteTransaction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sesi tidak valid, silakan login ulang' }

  const id = formData.get('id') as string

  // ponytail: verify user_id ownership on delete
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', Number(id))
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard')
  return { success: true }
}

// ── Category Actions ──────────────────────────────────────

export async function addCategory(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sesi tidak valid' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Nama kategori tidak boleh kosong' }
  if (name.length > 50) return { error: 'Nama kategori maksimal 50 karakter' }

  // ponytail: uniqueness check per user (case-insensitive)
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', user.id)
    .ilike('name', name)
    .maybeSingle()

  if (existing) return { error: 'Kategori dengan nama ini sudah ada' }

  const { error } = await supabase
    .from('categories')
    .insert({ name, user_id: user.id })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/transactions')
  return { success: true }
}

export async function updateCategory(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sesi tidak valid' }

  const id = formData.get('id') as string
  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Nama kategori tidak boleh kosong' }
  if (name.length > 50) return { error: 'Nama kategori maksimal 50 karakter' }

  // ponytail: uniqueness check excluding self
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', user.id)
    .ilike('name', name)
    .neq('id', Number(id))
    .maybeSingle()

  if (existing) return { error: 'Kategori dengan nama ini sudah ada' }

  const { error } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', Number(id))
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/transactions')
  return { success: true }
}

export async function deleteCategory(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sesi tidak valid' }

  const id = formData.get('id') as string

  // ponytail: guard delete — block if any transactions still use this category
  const { count } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', Number(id))
    .eq('user_id', user.id)

  if (count && count > 0) {
    return { error: `Kategori masih digunakan oleh ${count} transaksi` }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', Number(id))
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/transactions')
  return { success: true }
}
