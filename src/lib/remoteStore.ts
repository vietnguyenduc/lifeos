import { supabase } from './supabaseClient'

export const loadModuleData = async <T>(module: string, userId: string): Promise<T | null> => {
  const { data, error } = await supabase
    .from('lifeos_data')
    .select('data')
    .eq('module', module)
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') { // not found
    throw error
  }
  return (data?.data as T) ?? null
}

export const saveModuleData = async <T>(module: string, userId: string, payload: T) => {
  const { error } = await supabase.from('lifeos_data').upsert({
    module,
    user_id: userId,
    data: payload,
    updated_at: new Date().toISOString()
  })
  if (error) throw error
}
