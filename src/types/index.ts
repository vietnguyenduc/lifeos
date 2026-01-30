export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
  settings: Record<string, any>
  life_health_score: number
}

export interface FinancialTransaction {
  id: string
  user_id: string
  type: 'income' | 'expense' | 'investment' | 'debt'
  category?: string
  subcategory?: string
  amount: number
  currency: string
  description?: string
  date: string
  recurring: boolean
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  created_at: string
}

export interface CareerPlan {
  id: string
  user_id: string
  phase: 'current' | 'short_term' | 'medium_term' | 'long_term'
  title: string
  description?: string
  start_year?: number
  end_year?: number
  target_income?: number
  skills_required: string[]
  status: string
  created_at: string
}

export interface PeopleRelationship {
  id: string
  user_id: string
  name: string
  role?: string
  group_type: 'A' | 'B' | 'C' | 'D' | 'E'
  impact_score: number
  last_contact?: string
  contact_frequency_days?: number
  notes?: string
  created_at: string
}

export interface DecisionLog {
  id: string
  user_id: string
  title: string
  description?: string
  decision_made?: string
  outcome?: string
  emotion_before: number
  emotion_after: number
  risk_level: 'low' | 'medium' | 'high'
  status: string
  date_created: string
  date_completed?: string
  created_at: string
}

export interface TimeEnergyLog {
  id: string
  user_id: string
  date: string
  sleep_hours?: number
  work_hours?: number
  learning_hours?: number
  family_hours?: number
  finance_hours?: number
  leisure_hours?: number
  energy_level: number
  notes?: string
  created_at: string
}
