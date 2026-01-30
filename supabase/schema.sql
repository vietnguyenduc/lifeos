-- Life OS Database Schema
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settings JSONB DEFAULT '{}',
  life_health_score DECIMAL(3,2) DEFAULT 0.5
);

-- Financial transactions
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('income', 'expense', 'investment', 'debt')),
  category TEXT,
  subcategory TEXT,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'VND',
  description TEXT,
  date DATE NOT NULL,
  recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career plans
CREATE TABLE career_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phase TEXT CHECK (phase IN ('current', 'short_term', 'medium_term', 'long_term')),
  title TEXT NOT NULL,
  description TEXT,
  start_year INTEGER,
  end_year INTEGER,
  target_income DECIMAL(15,2),
  skills_required TEXT[],
  status TEXT DEFAULT 'planning',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- People relationships
CREATE TABLE people_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  group_type TEXT CHECK (group_type IN ('A', 'B', 'C', 'D', 'E')),
  impact_score INTEGER CHECK (impact_score >= -10 AND impact_score <= 10),
  last_contact DATE,
  contact_frequency_days INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Decision logs
CREATE TABLE decision_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  decision_made TEXT,
  outcome TEXT,
  emotion_before INTEGER CHECK (emotion_before >= 1 AND emotion_before <= 10),
  emotion_after INTEGER CHECK (emotion_after >= 1 AND emotion_after <= 10),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending',
  date_created DATE DEFAULT CURRENT_DATE,
  date_completed DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time and energy logs
CREATE TABLE time_energy_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_hours DECIMAL(4,2),
  work_hours DECIMAL(4,2),
  learning_hours DECIMAL(4,2),
  family_hours DECIMAL(4,2),
  finance_hours DECIMAL(4,2),
  leisure_hours DECIMAL(4,2),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_energy_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own transactions" ON financial_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON financial_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON financial_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON financial_transactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own career plans" ON career_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own career plans" ON career_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own career plans" ON career_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own career plans" ON career_plans FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own relationships" ON people_relationships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own relationships" ON people_relationships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own relationships" ON people_relationships FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own relationships" ON people_relationships FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own decisions" ON decision_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own decisions" ON decision_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own decisions" ON decision_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own decisions" ON decision_logs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own time logs" ON time_energy_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own time logs" ON time_energy_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own time logs" ON time_energy_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own time logs" ON time_energy_logs FOR DELETE USING (auth.uid() = user_id);
