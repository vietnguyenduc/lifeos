import { supabase } from './supabase'
import type { FinancialTransaction, CareerPlan, PeopleRelationship, DecisionLog, TimeEnergyLog } from '../types'

export const api = {
  // Financial Transactions
  transactions: {
    getAll: async (filters?: { type?: string, dateFrom?: string, dateTo?: string }) => {
      let query = supabase
        .from('financial_transactions')
        .select('*')
        .order('date', { ascending: false })

      if (filters?.type) query = query.eq('type', filters.type)
      if (filters?.dateFrom) query = query.gte('date', filters.dateFrom)
      if (filters?.dateTo) query = query.lte('date', filters.dateTo)

      const { data, error } = await query
      if (error) throw error
      return data as FinancialTransaction[]
    },

    create: async (transaction: Omit<FinancialTransaction, 'id' | 'user_id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert([transaction])
        .select()
      if (error) throw error
      return data[0] as FinancialTransaction
    },

    update: async (id: string, updates: Partial<FinancialTransaction>) => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .update(updates)
        .eq('id', id)
        .select()
      if (error) throw error
      return data[0] as FinancialTransaction
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
  },

  // Career Plans
  careerPlans: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('career_plans')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as CareerPlan[]
    },

    create: async (plan: Omit<CareerPlan, 'id' | 'user_id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('career_plans')
        .insert([plan])
        .select()
      if (error) throw error
      return data[0] as CareerPlan
    },

    update: async (id: string, updates: Partial<CareerPlan>) => {
      const { data, error } = await supabase
        .from('career_plans')
        .update(updates)
        .eq('id', id)
        .select()
      if (error) throw error
      return data[0] as CareerPlan
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('career_plans')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
  },

  // People Relationships
  peopleRelationships: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('people_relationships')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as PeopleRelationship[]
    },

    create: async (relationship: Omit<PeopleRelationship, 'id' | 'user_id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('people_relationships')
        .insert([relationship])
        .select()
      if (error) throw error
      return data[0] as PeopleRelationship
    },

    update: async (id: string, updates: Partial<PeopleRelationship>) => {
      const { data, error } = await supabase
        .from('people_relationships')
        .update(updates)
        .eq('id', id)
        .select()
      if (error) throw error
      return data[0] as PeopleRelationship
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('people_relationships')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
  },

  // Decision Logs
  decisionLogs: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('decision_logs')
        .select('*')
        .order('date_created', { ascending: false })
      if (error) throw error
      return data as DecisionLog[]
    },

    create: async (log: Omit<DecisionLog, 'id' | 'user_id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('decision_logs')
        .insert([log])
        .select()
      if (error) throw error
      return data[0] as DecisionLog
    },

    update: async (id: string, updates: Partial<DecisionLog>) => {
      const { data, error } = await supabase
        .from('decision_logs')
        .update(updates)
        .eq('id', id)
        .select()
      if (error) throw error
      return data[0] as DecisionLog
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('decision_logs')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
  },

  // Time & Energy Logs
  timeEnergyLogs: {
    getAll: async (dateFrom?: string, dateTo?: string) => {
      let query = supabase
        .from('time_energy_logs')
        .select('*')
        .order('date', { ascending: false })

      if (dateFrom) query = query.gte('date', dateFrom)
      if (dateTo) query = query.lte('date', dateTo)

      const { data, error } = await query
      if (error) throw error
      return data as TimeEnergyLog[]
    },

    getByDate: async (date: string) => {
      const { data, error } = await supabase
        .from('time_energy_logs')
        .select('*')
        .eq('date', date)
        .single()
      if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
      return data as TimeEnergyLog | null
    },

    createOrUpdate: async (log: Omit<TimeEnergyLog, 'id' | 'user_id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('time_energy_logs')
        .upsert([log], { onConflict: 'user_id,date' })
        .select()
      if (error) throw error
      return data[0] as TimeEnergyLog
    },

    update: async (id: string, updates: Partial<TimeEnergyLog>) => {
      const { data, error } = await supabase
        .from('time_energy_logs')
        .update(updates)
        .eq('id', id)
        .select()
      if (error) throw error
      return data[0] as TimeEnergyLog
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('time_energy_logs')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
  },
}
