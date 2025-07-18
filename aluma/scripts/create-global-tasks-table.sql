-- Create global_tasks table and related tables
-- Run this script in your Supabase SQL editor

-- Create global_tasks table
CREATE TABLE IF NOT EXISTS "public"."global_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'todo'::"text",
    "priority" "text" DEFAULT 'medium'::"text",
    "due_date" "date",
    "completed_at" timestamp with time zone,
    "category_id" "uuid",
    "assigned_to" "uuid"[],
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "estimated_hours" numeric,
    "actual_hours" numeric,
    "notes" "text",
    "is_recurring" boolean DEFAULT false,
    "recurrence_pattern" "text",
    "parent_task_id" "uuid",
    "external_reference" "text"
);

-- Create global_task_tags table for many-to-many relationship
CREATE TABLE IF NOT EXISTS "public"."global_task_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

-- Create task_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."task_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "color" "text" DEFAULT '#3b82f6',
    "created_at" timestamp with time zone DEFAULT "now"()
);

-- Create task_tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."task_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "color" "text" DEFAULT '#6b7280',
    "created_at" timestamp with time zone DEFAULT "now"()
);

-- Add primary key constraints
ALTER TABLE ONLY "public"."global_tasks"
    ADD CONSTRAINT "global_tasks_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."global_task_tags"
    ADD CONSTRAINT "global_task_tags_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."task_categories"
    ADD CONSTRAINT "task_categories_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."task_tags"
    ADD CONSTRAINT "task_tags_pkey" PRIMARY KEY ("id");

-- Add foreign key constraints
ALTER TABLE ONLY "public"."global_tasks"
    ADD CONSTRAINT "global_tasks_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."task_categories"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."global_tasks"
    ADD CONSTRAINT "global_tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."global_tasks"
    ADD CONSTRAINT "global_tasks_parent_task_id_fkey" FOREIGN KEY ("parent_task_id") REFERENCES "public"."global_tasks"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."global_task_tags"
    ADD CONSTRAINT "global_task_tags_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."global_tasks"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."global_task_tags"
    ADD CONSTRAINT "global_task_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."task_tags"("id") ON DELETE CASCADE;

-- Add unique constraints
ALTER TABLE ONLY "public"."global_task_tags"
    ADD CONSTRAINT "global_task_tags_task_tag_unique" UNIQUE ("task_id", "tag_id");

-- Insert default categories
INSERT INTO "public"."task_categories" (id, name, description, color) VALUES 
  (gen_random_uuid(), 'Development', 'Software development tasks', '#3b82f6'),
  (gen_random_uuid(), 'Design', 'UI/UX design tasks', '#8b5cf6'),
  (gen_random_uuid(), 'Marketing', 'Marketing and promotion tasks', '#10b981'),
  (gen_random_uuid(), 'Administration', 'Administrative tasks', '#f59e0b'),
  (gen_random_uuid(), 'Support', 'Customer support tasks', '#ef4444'),
  (gen_random_uuid(), 'Planning', 'Planning and strategy tasks', '#06b6d4')
ON CONFLICT (name) DO NOTHING;

-- Insert default tags
INSERT INTO "public"."task_tags" (id, name, color) VALUES 
  (gen_random_uuid(), 'urgent', '#ef4444'),
  (gen_random_uuid(), 'bug', '#dc2626'),
  (gen_random_uuid(), 'feature', '#059669'),
  (gen_random_uuid(), 'improvement', '#7c3aed'),
  (gen_random_uuid(), 'documentation', '#0891b2'),
  (gen_random_uuid(), 'testing', '#d97706')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "global_tasks_status_idx" ON "public"."global_tasks" ("status");
CREATE INDEX IF NOT EXISTS "global_tasks_due_date_idx" ON "public"."global_tasks" ("due_date");
CREATE INDEX IF NOT EXISTS "global_tasks_category_id_idx" ON "public"."global_tasks" ("category_id");
CREATE INDEX IF NOT EXISTS "global_tasks_created_by_idx" ON "public"."global_tasks" ("created_by");
CREATE INDEX IF NOT EXISTS "global_task_tags_task_id_idx" ON "public"."global_task_tags" ("task_id");
CREATE INDEX IF NOT EXISTS "global_task_tags_tag_id_idx" ON "public"."global_task_tags" ("tag_id");

-- Enable Row Level Security (optional)
-- ALTER TABLE "public"."global_tasks" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "public"."global_task_tags" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "public"."task_categories" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "public"."task_tags" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (uncomment if you want to enable RLS)
/*
-- Global tasks RLS policy
CREATE POLICY "Users can view global tasks based on role" ON "public"."global_tasks"
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      -- Admins and managers can see all tasks
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.auth_user_id = auth.uid() 
        AND users.role IN ('admin', 'manager')
      )
      OR
      -- Other users can see tasks they're assigned to or created
      created_by = (
        SELECT id FROM users WHERE users.auth_user_id = auth.uid()
      )
      OR
      assigned_to @> ARRAY[(
        SELECT id FROM users WHERE users.auth_user_id = auth.uid()
      )]::uuid[]
    )
  );

CREATE POLICY "Users can insert global tasks" ON "public"."global_tasks"
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    created_by = (
      SELECT id FROM users WHERE users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update global tasks based on role" ON "public"."global_tasks"
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      -- Admins and managers can update all tasks
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.auth_user_id = auth.uid() 
        AND users.role IN ('admin', 'manager')
      )
      OR
      -- Other users can update tasks they created or are assigned to
      created_by = (
        SELECT id FROM users WHERE users.auth_user_id = auth.uid()
      )
      OR
      assigned_to @> ARRAY[(
        SELECT id FROM users WHERE users.auth_user_id = auth.uid()
      )]::uuid[]
    )
  );

CREATE POLICY "Users can delete global tasks based on role" ON "public"."global_tasks"
  FOR DELETE USING (
    auth.role() = 'authenticated' AND (
      -- Only admins can delete tasks
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.auth_user_id = auth.uid() 
        AND users.role = 'admin'
      )
      OR
      -- Users can delete tasks they created
      created_by = (
        SELECT id FROM users WHERE users.auth_user_id = auth.uid()
      )
    )
  );
*/ 