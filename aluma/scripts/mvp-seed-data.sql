-- MVP SEED DATA FOR ALUMA TRADE SERVICES SAAS
-- This script populates the database with realistic test data
-- Run this AFTER mvp-essential-schema.sql

-- ====================================
-- DEMO USERS (WITH REALISTIC DATA)
-- ====================================

-- Insert demo users (these will need auth_user_id values from Supabase Auth)
INSERT INTO users (id, full_name, email, phone, role, active, created_at) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Sarah Wilson', 'sarah.admin@aluma.demo', '+61400111001', 'admin', true, NOW() - interval '30 days'),
  ('10000000-0000-0000-0000-000000000002', 'Mike Thompson', 'mike.manager@aluma.demo', '+61400111002', 'manager', true, NOW() - interval '25 days'),
  ('10000000-0000-0000-0000-000000000003', 'Dave Fletcher', 'dave.tech@aluma.demo', '+61400111003', 'technician', true, NOW() - interval '20 days'),
  ('10000000-0000-0000-0000-000000000004', 'John Mitchell', 'john.sub@aluma.demo', '+61400111004', 'subcontractor', true, NOW() - interval '15 days'),
  ('10000000-0000-0000-0000-000000000005', 'Emma Roberts', 'emma.staff@aluma.demo', '+61400111005', 'staff', true, NOW() - interval '10 days')
ON CONFLICT (email) DO NOTHING;

-- Assign users to roles
INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', NOW() - interval '30 days'), -- Sarah is admin
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', NOW() - interval '25 days'), -- Mike is manager
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', NOW() - interval '20 days'), -- Dave is technician
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', NOW() - interval '15 days'), -- John is subcontractor
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', NOW() - interval '10 days')  -- Emma is staff
ON CONFLICT DO NOTHING;

-- ====================================
-- CLIENTS & PROPERTIES
-- ====================================

-- Insert realistic clients
INSERT INTO clients (id, name, type, abn, address, suburb, state, postcode, phone, email, notes, created_by, created_at) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Premium Property Group', 'business', '12345678901', '123 Collins Street', 'Melbourne', 'VIC', '3000', '+61398765432', 'contact@premiumpropertygroup.com.au', 'Large commercial client - always pays on time', '10000000-0000-0000-0000-000000000002', NOW() - interval '28 days'),
  ('20000000-0000-0000-0000-000000000002', 'The Johnson Family', 'residential', NULL, '45 Oak Avenue', 'Camberwell', 'VIC', '3124', '+61412345678', 'david.johnson@email.com', 'Renovating heritage home - careful with historical features', '10000000-0000-0000-0000-000000000002', NOW() - interval '25 days'),
  ('20000000-0000-0000-0000-000000000003', 'Sunshine Solar Solutions', 'business', '98765432109', '78 Green Energy Drive', 'Richmond', 'VIC', '3121', '+61387654321', 'admin@sunshinesolar.com.au', 'Renewable energy partner - bulk installation projects', '10000000-0000-0000-0000-000000000001', NOW() - interval '22 days'),
  ('20000000-0000-0000-0000-000000000004', 'Westfield Shopping Centre', 'business', '11122233344', '200 Bourke Street', 'Melbourne', 'VIC', '3000', '+61399887766', 'facilities@westfield.com.au', 'Retail maintenance contracts', '10000000-0000-0000-0000-000000000002', NOW() - interval '20 days'),
  ('20000000-0000-0000-0000-000000000005', 'Maria & Tony Rossi', 'residential', NULL, '12 Vineyard Close', 'Mount Waverley', 'VIC', '3149', '+61423456789', 'maria.rossi@email.com', 'Kitchen and bathroom renovation', '10000000-0000-0000-0000-000000000003', NOW() - interval '18 days')
ON CONFLICT (name) DO NOTHING;

-- Insert client contacts
INSERT INTO client_contacts (id, client_id, full_name, email, phone, role, is_primary, created_at) VALUES
  ('21000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Jennifer Walsh', 'j.walsh@premiumpropertygroup.com.au', '+61398765433', 'Project Manager', true, NOW() - interval '28 days'),
  ('21000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'David Johnson', 'david.johnson@email.com', '+61412345678', 'Homeowner', true, NOW() - interval '25 days'),
  ('21000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Peter Chang', 'peter.chang@sunshinesolar.com.au', '+61387654322', 'Operations Manager', true, NOW() - interval '22 days'),
  ('21000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'Amanda Foster', 'a.foster@westfield.com.au', '+61399887767', 'Facilities Coordinator', true, NOW() - interval '20 days'),
  ('21000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'Maria Rossi', 'maria.rossi@email.com', '+61423456789', 'Homeowner', true, NOW() - interval '18 days')
ON CONFLICT (email) DO NOTHING;

-- Insert client sites
INSERT INTO client_sites (id, client_id, site_name, address, suburb, state, postcode, lat, lng, access_notes, created_at) VALUES
  ('22000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Premium Tower A', '123 Collins Street', 'Melbourne', 'VIC', '3000', -37.8136, 144.9631, 'Security clearance required - contact building manager first', NOW() - interval '28 days'),
  ('22000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Johnson Residence', '45 Oak Avenue', 'Camberwell', 'VIC', '3124', -37.8234, 145.0456, 'Key under planter box, dog in backyard', NOW() - interval '25 days'),
  ('22000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Solar Warehouse', '78 Green Energy Drive', 'Richmond', 'VIC', '3121', -37.8167, 144.9944, 'Loading dock access, forklift available', NOW() - interval '22 days'),
  ('22000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'Westfield Main Centre', '200 Bourke Street', 'Melbourne', 'VIC', '3000', -37.8136, 144.9631, 'After hours access only, security escort required', NOW() - interval '20 days'),
  ('22000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'Rossi Family Home', '12 Vineyard Close', 'Mount Waverley', 'VIC', '3149', -37.8793, 145.1328, 'Steep driveway, use side gate for materials', NOW() - interval '18 days')
ON CONFLICT (site_name) DO NOTHING;

-- ====================================
-- LEADS & OPPORTUNITIES
-- ====================================

INSERT INTO leads (id, client_id, name, description, status, source, value, probability, expected_close_date, assigned_to, created_by, notes, created_at, updated_at) VALUES
  ('31000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Premium Tower B Fitout', 'Complete electrical and data fitout for new office tower', 'proposal_sent', 'referral', 125000.00, 80, current_date + interval '15 days', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'High priority client, proposal submitted last week', NOW() - interval '12 days', NOW() - interval '3 days'),
  ('31000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Heritage Home Restoration', 'Electrical upgrade respecting heritage requirements', 'engaged', 'website', 35000.00, 70, current_date + interval '25 days', '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Heritage approval required, client very engaged', NOW() - interval '8 days', NOW() - interval '1 day'),
  ('31000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Solar Farm Phase 2', 'Extension of existing solar installation', 'new', 'partner', 200000.00, 60, current_date + interval '45 days', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Depends on success of Phase 1 project', NOW() - interval '3 days', NOW() - interval '3 days'),
  ('31000000-0000-0000-0000-000000000004', NULL, 'New Industrial Client', 'Large manufacturing facility electrical work', 'contacted', 'cold_call', 75000.00, 30, current_date + interval '60 days', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Initial contact made, site visit scheduled', NOW() - interval '5 days', NOW() - interval '1 day'),
  ('31000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'Kitchen Electrical Upgrade', 'Modern kitchen electrical installation', 'won', 'referral', 8500.00, 100, current_date - interval '5 days', '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Job won, ready to schedule', NOW() - interval '15 days', NOW() - interval '2 days')
ON CONFLICT (name) DO NOTHING;

-- ====================================
-- ACTIVE JOBS
-- ====================================

INSERT INTO jobs (id, lead_id, client_id, site_id, job_number, title, description, scope_of_works, status, priority, scheduled_date, start_date, estimated_hours, estimated_value, created_by, project_manager, notes, created_at, updated_at) VALUES
  ('40000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', '22000000-0000-0000-0000-000000000005', 'JOB-2024-001', 'Rossi Kitchen Electrical', 'Complete kitchen electrical renovation', 'Install new power points, lighting circuits, appliance connections, safety switches', 'in_progress', 'medium', current_date - interval '2 days', current_date - interval '2 days', 24.00, 8500.00, '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Customer very happy with progress', NOW() - interval '5 days', NOW() - interval '1 day'),
  ('40000000-0000-0000-0000-000000000002', NULL, '20000000-0000-0000-0000-000000000004', '22000000-0000-0000-0000-000000000004', 'JOB-2024-002', 'Westfield Emergency Lighting', 'Emergency lighting compliance upgrade', 'Test and replace emergency lighting throughout shopping centre', 'scheduled', 'high', current_date + interval '3 days', NULL, 40.00, 15000.00, '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'After hours work required', NOW() - interval '3 days', NOW() - interval '3 days'),
  ('40000000-0000-0000-0000-000000000003', NULL, '20000000-0000-0000-0000-000000000001', '22000000-0000-0000-0000-000000000001', 'JOB-2024-003', 'Premium Tower Maintenance', 'Quarterly electrical maintenance check', 'Inspect switchboards, test safety systems, general maintenance', 'completed', 'low', current_date - interval '7 days', current_date - interval '7 days', 16.00, 3200.00, '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'All systems running perfectly', NOW() - interval '10 days', NOW() - interval '1 day'),
  ('40000000-0000-0000-0000-000000000004', NULL, '20000000-0000-0000-0000-000000000003', '22000000-0000-0000-0000-000000000003', 'JOB-2024-004', 'Solar Warehouse Upgrade', 'Electrical infrastructure for new equipment', 'Install new circuits for warehouse equipment, upgrade main panel', 'scheduled', 'medium', current_date + interval '7 days', NULL, 32.00, 12000.00, '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Coordinate with equipment installation team', NOW() - interval '2 days', NOW() - interval '2 days')
ON CONFLICT (job_number) DO NOTHING;

-- Job assignments
INSERT INTO job_assignments (id, job_id, user_id, assigned_role, hourly_rate, assigned_at, assigned_by) VALUES
  ('41000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Lead Technician', 85.00, NOW() - interval '5 days', '10000000-0000-0000-0000-000000000002'),
  ('41000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Assistant', 65.00, NOW() - interval '5 days', '10000000-0000-0000-0000-000000000002'),
  ('41000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Lead Technician', 85.00, NOW() - interval '3 days', '10000000-0000-0000-0000-000000000002'),
  ('41000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'Subcontractor', 90.00, NOW() - interval '3 days', '10000000-0000-0000-0000-000000000002'),
  ('41000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Lead Technician', 85.00, NOW() - interval '10 days', '10000000-0000-0000-0000-000000000002'),
  ('41000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'Lead Technician', 85.00, NOW() - interval '2 days', '10000000-0000-0000-0000-000000000002'),
  ('41000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Specialist', 95.00, NOW() - interval '2 days', '10000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- ====================================
-- TASKS FOR ACTIVE JOBS
-- ====================================

-- Tasks for Job 1 (Rossi Kitchen - In Progress)
INSERT INTO job_tasks (id, job_id, title, description, status, priority, estimated_hours, actual_hours, due_date, completed_at, created_by, sequence_order, notes, created_at, updated_at) VALUES
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Site preparation and safety setup', 'Set up work area, safety barriers, test existing circuits', 'completed', 'high', 2.0, 2.5, current_date - interval '2 days', NOW() - interval '1 day', '10000000-0000-0000-0000-000000000002', 1, 'Took extra time due to old wiring discovery', NOW() - interval '5 days', NOW() - interval '1 day'),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'Install new power circuits', 'Run new cables and install power points for kitchen appliances', 'in_progress', 'high', 8.0, 6.0, current_date, NULL, '10000000-0000-0000-0000-000000000002', 2, 'Making good progress, should finish today', NOW() - interval '5 days', NOW() - interval '1 hour'),
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', 'Install LED lighting circuits', 'Install under-cabinet and ceiling LED lighting', 'pending', 'medium', 6.0, 0.0, current_date + interval '1 day', NULL, '10000000-0000-0000-0000-000000000002', 3, 'Waiting for specialty LED fixtures to arrive', NOW() - interval '5 days', NOW() - interval '5 days'),
  ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001', 'Install safety switches and testing', 'Install RCD protection and conduct final testing', 'pending', 'high', 4.0, 0.0, current_date + interval '2 days', NULL, '10000000-0000-0000-0000-000000000002', 4, NULL, NOW() - interval '5 days', NOW() - interval '5 days'),
  ('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000001', 'Final inspection and cleanup', 'Complete electrical inspection and site cleanup', 'pending', 'medium', 4.0, 0.0, current_date + interval '3 days', NULL, '10000000-0000-0000-0000-000000000002', 5, NULL, NOW() - interval '5 days', NOW() - interval '5 days');

-- Tasks for Job 2 (Westfield Emergency Lighting - Scheduled)
INSERT INTO job_tasks (id, job_id, title, description, status, priority, estimated_hours, due_date, created_by, sequence_order, created_at) VALUES
  ('50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000002', 'Emergency lighting audit', 'Test all existing emergency lighting and document failures', 'pending', 'high', 8.0, current_date + interval '3 days', '10000000-0000-0000-0000-000000000002', 1, NOW() - interval '3 days'),
  ('50000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000002', 'Replace faulty emergency lights', 'Replace non-functioning emergency lighting units', 'pending', 'high', 16.0, current_date + interval '4 days', '10000000-0000-0000-0000-000000000002', 2, NOW() - interval '3 days'),
  ('50000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000002', 'Battery backup testing', 'Test and replace emergency lighting batteries', 'pending', 'medium', 12.0, current_date + interval '5 days', '10000000-0000-0000-0000-000000000002', 3, NOW() - interval '3 days'),
  ('50000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000002', 'Compliance documentation', 'Complete and submit compliance certificates', 'pending', 'high', 4.0, current_date + interval '6 days', '10000000-0000-0000-0000-000000000002', 4, NOW() - interval '3 days');

-- Task assignments
INSERT INTO task_assignments (id, task_id, user_id, assigned_at, assigned_by) VALUES
  ('51000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', NOW() - interval '5 days', '10000000-0000-0000-0000-000000000002'),
  ('51000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', NOW() - interval '5 days', '10000000-0000-0000-0000-000000000002'),
  ('51000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', NOW() - interval '5 days', '10000000-0000-0000-0000-000000000002'),
  ('51000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', NOW() - interval '3 days', '10000000-0000-0000-0000-000000000002'),
  ('51000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004', NOW() - interval '3 days', '10000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- ====================================
-- TIME TRACKING DATA
-- ====================================

INSERT INTO time_entries (id, user_id, job_id, task_id, start_time, end_time, hours, description, billable, rate, created_at) VALUES
  ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', NOW() - interval '1 day 8 hours', NOW() - interval '1 day 5.5 hours', 2.5, 'Site setup and safety preparation', true, 85.00, NOW() - interval '1 day'),
  ('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', NOW() - interval '6 hours', NOW() - interval '2 hours', 4.0, 'Installing power circuits - morning session', true, 85.00, NOW()),
  ('60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', NOW() - interval '5 hours', NOW() - interval '3 hours', 2.0, 'Assisting with power circuit installation', true, 65.00, NOW()),
  ('60000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', NULL, NOW() - interval '8 days 8 hours', NOW() - interval '8 days 0 hours', 8.0, 'Premium Tower quarterly maintenance - full day', true, 85.00, NOW() - interval '8 days'),
  ('60000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', NULL, NOW() - interval '7 days 8 hours', NOW() - interval '7 days 0 hours', 8.0, 'Premium Tower maintenance - final day and testing', true, 85.00, NOW() - interval '7 days')
ON CONFLICT DO NOTHING;

-- ====================================
-- PROPOSALS
-- ====================================

INSERT INTO proposals (id, lead_id, client_id, proposal_number, title, description, status, version, total_amount, tax_amount, valid_until, created_by, sent_at, notes, terms_conditions, created_at, updated_at) VALUES
  ('70000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'PROP-2024-001', 'Premium Tower B Complete Fitout', 'Comprehensive electrical and data infrastructure installation', 'sent', 1, 137500.00, 12500.00, current_date + interval '30 days', '10000000-0000-0000-0000-000000000002', NOW() - interval '5 days', 'Includes all materials and labour, excludes structural modifications', 'Payment terms: 30% deposit, 40% at rough-in, 30% on completion. All work guaranteed for 12 months.', NOW() - interval '8 days', NOW() - interval '5 days'),
  ('70000000-0000-0000-0000-000000000002', '31000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'PROP-2024-002', 'Heritage Home Electrical Upgrade', 'Sensitive electrical renovation maintaining heritage character', 'draft', 1, 38500.00, 3500.00, current_date + interval '45 days', '10000000-0000-0000-0000-000000000003', NULL, 'Waiting for heritage approval before finalizing scope', 'All work to comply with heritage requirements. Heritage consultant fees not included.', NOW() - interval '3 days', NOW() - interval '1 day'),
  ('70000000-0000-0000-0000-000000000003', '31000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'PROP-2024-003', 'Modern Kitchen Electrical Package', 'Complete kitchen electrical renovation with smart features', 'accepted', 1, 9350.00, 850.00, current_date - interval '10 days', '10000000-0000-0000-0000-000000000003', NOW() - interval '20 days', 'Client accepted proposal, job scheduled', 'Payment on completion. Work includes compliance certificate.', NOW() - interval '25 days', NOW() - interval '15 days')
ON CONFLICT (proposal_number) DO NOTHING;

-- Proposal items
INSERT INTO proposal_items (id, proposal_id, item_type, description, quantity, unit_price, total_price, sequence_order, created_at) VALUES
  -- Premium Tower B Proposal Items
  ('71000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'labor', 'Electrical design and planning', 40.0, 120.00, 4800.00, 1, NOW() - interval '8 days'),
  ('71000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', 'labor', 'Main electrical installation (320 hours)', 320.0, 85.00, 27200.00, 2, NOW() - interval '8 days'),
  ('71000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000001', 'material', 'Electrical materials and equipment', 1.0, 75000.00, 75000.00, 3, NOW() - interval '8 days'),
  ('71000000-0000-0000-0000-000000000004', '70000000-0000-0000-0000-000000000001', 'service', 'Testing and commissioning', 60.0, 100.00, 6000.00, 4, NOW() - interval '8 days'),
  ('71000000-0000-0000-0000-000000000005', '70000000-0000-0000-0000-000000000001', 'service', 'Project management and coordination', 1.0, 12000.00, 12000.00, 5, NOW() - interval '8 days'),
  ('71000000-0000-0000-0000-000000000006', '70000000-0000-0000-0000-000000000001', 'service', 'Compliance certificates and documentation', 1.0, 2500.00, 2500.00, 6, NOW() - interval '8 days'),
  
  -- Heritage Home Proposal Items
  ('71000000-0000-0000-0000-000000000007', '70000000-0000-0000-0000-000000000002', 'labor', 'Heritage-sensitive electrical upgrade (180 hours)', 180.0, 90.00, 16200.00, 1, NOW() - interval '3 days'),
  ('71000000-0000-0000-0000-000000000008', '70000000-0000-0000-0000-000000000002', 'material', 'Specialty heritage-appropriate materials', 1.0, 15000.00, 15000.00, 2, NOW() - interval '3 days'),
  ('71000000-0000-0000-0000-000000000009', '70000000-0000-0000-0000-000000000002', 'service', 'Heritage consultant liaison', 20.0, 150.00, 3000.00, 3, NOW() - interval '3 days'),
  ('71000000-0000-0000-0000-000000000010', '70000000-0000-0000-0000-000000000002', 'service', 'Compliance and heritage approval support', 1.0, 1800.00, 1800.00, 4, NOW() - interval '3 days'),
  
  -- Kitchen Electrical Proposal Items
  ('71000000-0000-0000-0000-000000000011', '70000000-0000-0000-0000-000000000003', 'labor', 'Kitchen electrical installation (48 hours)', 48.0, 85.00, 4080.00, 1, NOW() - interval '25 days'),
  ('71000000-0000-0000-0000-000000000012', '70000000-0000-0000-0000-000000000003', 'material', 'Power points, switches, and LED lighting', 1.0, 2800.00, 2800.00, 2, NOW() - interval '25 days'),
  ('71000000-0000-0000-0000-000000000013', '70000000-0000-0000-0000-000000000003', 'material', 'Safety switches and circuit protection', 1.0, 450.00, 450.00, 3, NOW() - interval '25 days'),
  ('71000000-0000-0000-0000-000000000014', '70000000-0000-0000-0000-000000000003', 'service', 'Testing and compliance certificate', 1.0, 1170.00, 1170.00, 4, NOW() - interval '25 days')
ON CONFLICT DO NOTHING;

-- ====================================
-- INVOICES (FOR COMPLETED/PROGRESS BILLING)
-- ====================================

INSERT INTO invoices (id, job_id, proposal_id, client_id, invoice_number, status, issue_date, due_date, subtotal, tax_amount, total_amount, paid_amount, created_by, sent_at, paid_at, notes, payment_terms, created_at, updated_at) VALUES
  ('80000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'INV-2024-001', 'paid', current_date - interval '15 days', current_date - interval '1 day', 2909.09, 290.91, 3200.00, 3200.00, '10000000-0000-0000-0000-000000000002', NOW() - interval '15 days', NOW() - interval '1 day', 'Quarterly maintenance completed successfully', 'Net 14 days', NOW() - interval '15 days', NOW() - interval '1 day'),
  ('80000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', 'INV-2024-002', 'sent', current_date - interval '3 days', current_date + interval '11 days', 7727.27, 772.73, 8500.00, 0.00, '10000000-0000-0000-0000-000000000003', NOW() - interval '3 days', NULL, 'Kitchen electrical work - progress billing', 'Net 14 days', NOW() - interval '3 days', NOW() - interval '3 days')
ON CONFLICT (invoice_number) DO NOTHING;

-- Update jobs with actual hours and costs based on time entries
UPDATE jobs SET 
  actual_hours = (
    SELECT COALESCE(SUM(hours), 0) 
    FROM time_entries 
    WHERE job_id = jobs.id
  ),
  actual_cost = (
    SELECT COALESCE(SUM(hours * rate), 0) 
    FROM time_entries 
    WHERE job_id = jobs.id AND billable = true
  ),
  updated_at = NOW()
WHERE id IN (
  '40000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000003'
);

-- Update task actual hours
UPDATE job_tasks SET 
  actual_hours = (
    SELECT COALESCE(SUM(hours), 0) 
    FROM time_entries 
    WHERE task_id = job_tasks.id
  ),
  updated_at = NOW()
WHERE id IN (
  '50000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000002'
);

-- ====================================
-- SUMMARY
-- ====================================

-- This seed data provides:
-- ✅ 5 realistic users with different roles
-- ✅ 5 clients (mix of business and residential)
-- ✅ 5 client sites with access notes
-- ✅ 5 leads in various stages
-- ✅ 4 jobs (completed, in-progress, scheduled)
-- ✅ 9 tasks showing realistic workflow
-- ✅ Time tracking entries showing real work
-- ✅ 3 proposals in different states
-- ✅ 2 invoices (paid and outstanding)
-- ✅ Proper relationships between all entities
-- ✅ Realistic Australian business data

-- The data supports testing of:
-- - Role-based access control
-- - Job lifecycle management
-- - Task tracking and assignment
-- - Time tracking and billing
-- - Proposal and invoice workflows
-- - Real-time dashboard updates
-- - Reporting and analytics features
