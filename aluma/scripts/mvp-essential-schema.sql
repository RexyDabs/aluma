-- MVP ESSENTIAL SCHEMA FOR ALUMA TRADE SERVICES SAAS
-- This script creates all essential tables for a functional MVP
-- Run this in your Supabase SQL editor

-- Drop existing tables in correct order (if recreating)
-- DROP TABLE IF EXISTS task_assignments CASCADE;
-- DROP TABLE IF EXISTS time_entries CASCADE;
-- DROP TABLE IF EXISTS job_tasks CASCADE;
-- DROP TABLE IF EXISTS invoices CASCADE;
-- DROP TABLE IF EXISTS proposal_items CASCADE;
-- DROP TABLE IF EXISTS proposals CASCADE;
-- DROP TABLE IF EXISTS job_assignments CASCADE;
-- DROP TABLE IF EXISTS jobs CASCADE;
-- DROP TABLE IF EXISTS lead_contacts CASCADE;
-- DROP TABLE IF EXISTS leads CASCADE;
-- DROP TABLE IF EXISTS client_sites CASCADE;
-- DROP TABLE IF EXISTS client_contacts CASCADE;
-- DROP TABLE IF EXISTS clients CASCADE;
-- DROP TABLE IF EXISTS user_roles CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS roles CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- CORE USER MANAGEMENT TABLES
-- ====================================

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'staff',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles (many-to-many for future flexibility)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- ====================================
-- CLIENT MANAGEMENT TABLES
-- ====================================

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('business', 'residential')) DEFAULT 'residential',
  abn TEXT,
  address TEXT,
  suburb TEXT,
  state TEXT,
  postcode TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client contacts
CREATE TABLE IF NOT EXISTS client_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client sites/properties
CREATE TABLE IF NOT EXISTS client_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  address TEXT NOT NULL,
  suburb TEXT,
  state TEXT,
  postcode TEXT,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  access_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- LEAD MANAGEMENT TABLES
-- ====================================

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'engaged', 'proposal_sent', 'won', 'lost')),
  source TEXT,
  value DECIMAL(12,2),
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead contacts (if different from client contacts)
CREATE TABLE IF NOT EXISTS lead_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- JOB MANAGEMENT TABLES
-- ====================================

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  site_id UUID REFERENCES client_sites(id) ON DELETE SET NULL,
  job_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scope_of_works TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  scheduled_date DATE,
  start_date DATE,
  completion_date DATE,
  estimated_hours DECIMAL(8,2),
  actual_hours DECIMAL(8,2) DEFAULT 0,
  estimated_value DECIMAL(12,2),
  actual_cost DECIMAL(12,2) DEFAULT 0,
  created_by UUID REFERENCES users(id),
  project_manager UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job assignments (staff assigned to jobs)
CREATE TABLE IF NOT EXISTS job_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_role TEXT,
  hourly_rate DECIMAL(8,2),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  UNIQUE(job_id, user_id)
);

-- ====================================
-- TASK MANAGEMENT TABLES
-- ====================================

-- Job tasks
CREATE TABLE IF NOT EXISTS job_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  estimated_hours DECIMAL(8,2),
  actual_hours DECIMAL(8,2) DEFAULT 0,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  sequence_order INTEGER DEFAULT 0,
  parent_task_id UUID REFERENCES job_tasks(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task assignments
CREATE TABLE IF NOT EXISTS task_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES job_tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  UNIQUE(task_id, user_id)
);

-- ====================================
-- TIME TRACKING TABLES
-- ====================================

-- Time entries for tracking work
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  task_id UUID REFERENCES job_tasks(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  hours DECIMAL(8,2),
  description TEXT,
  billable BOOLEAN DEFAULT true,
  rate DECIMAL(8,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- PROPOSAL TABLES
-- ====================================

-- Proposals
CREATE TABLE IF NOT EXISTS proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  proposal_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  version INTEGER DEFAULT 1,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  valid_until DATE,
  created_by UUID REFERENCES users(id),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  notes TEXT,
  terms_conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proposal line items
CREATE TABLE IF NOT EXISTS proposal_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  item_type TEXT DEFAULT 'service' CHECK (item_type IN ('service', 'material', 'labor')),
  description TEXT NOT NULL,
  quantity DECIMAL(10,3) DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  sequence_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- INVOICE TABLES
-- ====================================

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  created_by UUID REFERENCES users(id),
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  payment_terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- INDEXES FOR PERFORMANCE
-- ====================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Lead indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON leads(created_by);

-- Job indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_jobs_project_manager ON jobs(project_manager);

-- Task indexes
CREATE INDEX IF NOT EXISTS idx_job_tasks_job_id ON job_tasks(job_id);
CREATE INDEX IF NOT EXISTS idx_job_tasks_status ON job_tasks(status);
CREATE INDEX IF NOT EXISTS idx_job_tasks_due_date ON job_tasks(due_date);

-- Time tracking indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_job_id ON time_entries(job_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);

-- ====================================
-- TRIGGERS FOR UPDATED_AT
-- ====================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_tasks_updated_at ON job_tasks;
CREATE TRIGGER update_job_tasks_updated_at BEFORE UPDATE ON job_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- SEED DEFAULT DATA
-- ====================================

-- Insert default roles
INSERT INTO roles (id, name, description) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Full system administrator'),
  ('00000000-0000-0000-0000-000000000002', 'manager', 'Project and team manager'),
  ('00000000-0000-0000-0000-000000000003', 'technician', 'Field technician'),
  ('00000000-0000-0000-0000-000000000004', 'subcontractor', 'External contractor'),
  ('00000000-0000-0000-0000-000000000005', 'staff', 'General staff member')
ON CONFLICT (name) DO NOTHING;

-- Note: Users will be created through the app's authentication flow
-- The demo data from seed-dummy-data.sql can be run separately

-- ====================================
-- ROW LEVEL SECURITY (OPTIONAL)
-- ====================================

-- Enable RLS on sensitive tables
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE job_tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (uncomment if enabling RLS)
/*
-- Users can view their own profile and admins can view all
CREATE POLICY "users_select_policy" ON users FOR SELECT USING (
  auth.uid() = auth_user_id OR 
  EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin')
);

-- Similar policies would be needed for other tables based on business rules
*/
