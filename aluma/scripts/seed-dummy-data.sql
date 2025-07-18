-- SEED DUMMY DATA FOR SAAS REVISION/INSPECTION
-- USERS, ROLES, USER_ROLES

-- Insert roles
INSERT INTO public.roles (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Administrator'),
  ('00000000-0000-0000-0000-000000000002', 'manager', 'Manager'),
  ('00000000-0000-0000-0000-000000000003', 'tradie', 'Tradie'),
  ('00000000-0000-0000-0000-000000000004', 'client', 'Client')
ON CONFLICT (name) DO NOTHING;

-- Insert users
INSERT INTO public.users (id, full_name, email, phone, status, created_at) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Alice Admin', 'alice.admin@example.com', '+61400000001', 'active', now()),
  ('10000000-0000-0000-0000-000000000002', 'Mark Manager', 'mark.manager@example.com', '+61400000002', 'active', now()),
  ('10000000-0000-0000-0000-000000000003', 'Tina Tradie', 'tina.tradie@example.com', '+61400000003', 'active', now()),
  ('10000000-0000-0000-0000-000000000004', 'Carl Client', 'carl.client@example.com', '+61400000004', 'active', now()),
  ('10000000-0000-0000-0000-000000000005', 'Sam Support', 'sam.support@example.com', '+61400000005', 'active', now())
ON CONFLICT (email) DO NOTHING;

-- Assign roles to users
INSERT INTO public.user_roles (user_id, role_id) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'), -- Alice is admin
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002'), -- Mark is manager
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003'), -- Tina is tradie
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004'), -- Carl is client
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002')  -- Sam is manager
ON CONFLICT DO NOTHING;

-- More sections to follow for clients, leads, jobs, tasks, etc. 

-- CLIENTS, CLIENT_CONTACTS, CLIENT_SITES

-- Insert clients
INSERT INTO public.clients (id, name, type, abn, notes, created_at) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Acme Construction', 'business', '12345678901', 'Preferred commercial client', now()),
  ('20000000-0000-0000-0000-000000000002', 'Smith Family', 'residential', NULL, 'Repeat residential client', now()),
  ('20000000-0000-0000-0000-000000000003', 'Green Energy Pty Ltd', 'business', '98765432109', 'Solar installation partner', now())
ON CONFLICT (name) DO NOTHING;

-- Insert client contacts
INSERT INTO public.client_contacts (id, client_id, full_name, email, phone, role, created_at) VALUES
  ('21000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'John Builder', 'john.builder@acme.com', '+61411111111', 'Project Manager', now()),
  ('21000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Mary Smith', 'mary.smith@example.com', '+61412222222', 'Homeowner', now()),
  ('21000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Eve Green', 'eve.green@greenenergy.com', '+61413333333', 'Operations', now())
ON CONFLICT (email) DO NOTHING;

-- Insert client sites
INSERT INTO public.client_sites (id, client_id, site_name, address, suburb, state, postcode, lat, lng, created_at) VALUES
  ('22000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Acme HQ', '100 Main St', 'Sydney', 'NSW', '2000', -33.8688, 151.2093, now()),
  ('22000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Smith Residence', '12 Oak Ave', 'Melbourne', 'VIC', '3000', -37.8136, 144.9631, now()),
  ('22000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Green Energy Depot', '50 Solar Rd', 'Brisbane', 'QLD', '4000', -27.4698, 153.0251, now())
ON CONFLICT (site_name) DO NOTHING; 

-- LEADS, LEAD_CONTACTS, LEAD_TAGS

-- Insert lead tags
INSERT INTO public.lead_tags (id, name) VALUES
  ('30000000-0000-0000-0000-000000000001', 'hot'),
  ('30000000-0000-0000-0000-000000000002', 'cold'),
  ('30000000-0000-0000-0000-000000000003', 'follow-up')
ON CONFLICT (name) DO NOTHING;

-- Insert leads
INSERT INTO public.leads (id, client_id, name, status, source, value, created_at, notes) VALUES
  ('31000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Acme Office Renovation', 'new', 'referral', 50000, now(), 'Large office fitout'),
  ('31000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Smith Kitchen Remodel', 'engaged', 'website', 20000, now(), 'Residential kitchen update'),
  ('31000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Green Energy Solar Install', 'proposal_sent', 'partner', 75000, now(), 'Commercial solar array')
ON CONFLICT (name) DO NOTHING;

-- Insert lead contacts
INSERT INTO public.lead_contacts (id, lead_id, full_name, email, phone, created_at) VALUES
  ('32000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000001', 'John Builder', 'john.builder@acme.com', '+61411111111', now()),
  ('32000000-0000-0000-0000-000000000002', '31000000-0000-0000-0000-000000000002', 'Mary Smith', 'mary.smith@example.com', '+61412222222', now()),
  ('32000000-0000-0000-0000-000000000003', '31000000-0000-0000-0000-000000000003', 'Eve Green', 'eve.green@greenenergy.com', '+61413333333', now())
ON CONFLICT (email) DO NOTHING;

-- Assign tags to leads
INSERT INTO public.lead_tag_assignments (lead_id, tag_id) VALUES
  ('31000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'), -- hot
  ('31000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003'), -- follow-up
  ('31000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002')  -- cold
ON CONFLICT DO NOTHING; 