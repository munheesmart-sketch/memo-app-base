'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { Memo, MemoFormData } from '@/types/memo'

function rowToMemo(row: {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  created_at: string
  updated_at: string
}): Memo {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getMemos(): Promise<Memo[]> {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToMemo)
}

export async function createMemo(formData: MemoFormData): Promise<Memo> {
  const { data, error } = await supabase
    .from('memos')
    .insert({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/')
  return rowToMemo(data)
}

export async function updateMemo(
  id: string,
  formData: MemoFormData
): Promise<Memo> {
  const { data, error } = await supabase
    .from('memos')
    .update({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/')
  return rowToMemo(data)
}

export async function deleteMemo(id: string): Promise<void> {
  const { error } = await supabase.from('memos').delete().eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/')
}
