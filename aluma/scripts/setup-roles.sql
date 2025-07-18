-- Setup default roles for the role-based access control system
-- Run this script in your Supabase SQL editor

-- Insert default roles
INSERT INTO roles (id, name) VALUES 
  (gen_random_uuid(), 'admin'),
  (gen_random_uuid(), 'manager'),
  (gen_random_uuid(), 'technician'),
  (gen_random_uuid(), 'subcontractor'),
  (gen_random_uuid(), 'staff')
ON CONFLICT (name) DO NOTHING;

-- Create a default admin user (replace with your actual auth user ID)
-- You'll need to run this after creating your first user in the auth system
-- INSERT INTO users (auth_user_id, full_name, email, role, active) VALUES 
--   ('your-auth-user-id-here', 'Admin User', 'admin@example.com', 'admin', true);

-- Grant permissions to the default admin user
-- UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';

-- Create RLS policies for role-based access (if not already created)
-- These policies ensure users can only see data they're authorized to see

-- Example: Leads table RLS policy
-- CREATE POLICY "Users can view leads based on role" ON leads
--   FOR SELECT USING (
--     auth.role() = 'authenticated' AND (
--       -- Admins and managers can see all leads
--       EXISTS (
--         SELECT 1 FROM users 
--         WHERE users.auth_user_id = auth.uid() 
--         AND users.role IN ('admin', 'manager')
--       )
--       OR
--       -- Other users can only see leads assigned to them
--       assigned_to = (
--         SELECT id FROM users WHERE users.auth_user_id = auth.uid()
--       )
--     )
--   );

-- Example: Jobs table RLS policy
-- CREATE POLICY "Users can view jobs based on role" ON jobs
--   FOR SELECT USING (
--     auth.role() = 'authenticated' AND (
--       -- Admins and managers can see all jobs
--       EXISTS (
--         SELECT 1 FROM users 
--         WHERE users.auth_user_id = auth.uid() 
--         AND users.role IN ('admin', 'manager')
--       )
--       OR
--       -- Other users can only see jobs they're assigned to
--       EXISTS (
--         SELECT 1 FROM job_assignments 
--         WHERE job_assignments.job_id = jobs.id 
--         AND job_assignments.user_id = (
--           SELECT id FROM users WHERE users.auth_user_id = auth.uid()
--         )
--       )
--     )
--   );

-- Example: Tasks table RLS policy
-- CREATE POLICY "Users can view tasks based on role" ON tasks
--   FOR SELECT USING (
--     auth.role() = 'authenticated' AND (
--       -- Admins and managers can see all tasks
--       EXISTS (
--         SELECT 1 FROM users 
--         WHERE users.auth_user_id = auth.uid() 
--         AND users.role IN ('admin', 'manager')
--       )
--       OR
--       -- Other users can only see tasks assigned to them
--       assigned_to = (
--         SELECT id FROM users WHERE users.auth_user_id = auth.uid()
--       )
--     )
--   );

-- Example: Users table RLS policy (only admins can manage users)
-- CREATE POLICY "Only admins can manage users" ON users
--   FOR ALL USING (
--     auth.role() = 'authenticated' AND
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE users.auth_user_id = auth.uid() 
--       AND users.role = 'admin'
--     )
--   );

-- Enable RLS on tables (if not already enabled)
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Note: You may need to adjust these policies based on your specific requirements
-- and existing table structure. Make sure to test thoroughly in a development environment first. 