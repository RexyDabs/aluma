

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."client_contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid",
    "full_name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "role" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."client_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "client_id" "uuid",
    "rating" integer,
    "title" "text",
    "comment" "text",
    "submitted_at" timestamp with time zone DEFAULT "now"(),
    "source" "text",
    "is_public" boolean DEFAULT false,
    CONSTRAINT "client_reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."client_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_sites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid",
    "site_name" "text",
    "address" "text",
    "suburb" "text",
    "state" "text",
    "postcode" "text",
    "lat" double precision,
    "lng" double precision,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."client_sites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text",
    "abn" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_tag_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid",
    "tag_id" "uuid"
);


ALTER TABLE "public"."document_tag_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."document_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "category" "text" NOT NULL,
    "description" "text",
    "default_content" "jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."document_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid",
    "version_number" integer NOT NULL,
    "file_url" "text" NOT NULL,
    "notes" "text",
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "uploaded_by" "uuid"
);


ALTER TABLE "public"."document_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "document_type" "text" NOT NULL,
    "file_url" "text",
    "mime_type" "text",
    "size_bytes" integer,
    "related_job_id" "uuid",
    "related_proposal_id" "uuid",
    "related_client_id" "uuid",
    "related_site_id" "uuid",
    "uploaded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "notes" "text",
    "template_id" "uuid",
    "filled_data" "jsonb",
    "status" "text" DEFAULT 'draft'::"text"
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."evidence_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "uploader_id" "uuid",
    "media_url" "text",
    "type" "text",
    "caption" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."evidence_media" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "proposal_id" "uuid",
    "client_id" "uuid",
    "issue_date" timestamp with time zone DEFAULT "now"(),
    "due_date" timestamp with time zone,
    "total_amount" numeric(10,2) NOT NULL,
    "amount_paid" numeric(10,2) DEFAULT 0.00,
    "payment_status" "text" DEFAULT 'unpaid'::"text",
    "payment_link" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "stripe_invoice_id" "text",
    "square_invoice_id" "text",
    "status" "text" DEFAULT 'draft'::"text",
    "payment_url" "text",
    "paid_at" timestamp with time zone
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "user_id" "uuid",
    "assigned_role" "text",
    "assigned_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_bill_of_materials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "item_name" "text" NOT NULL,
    "quantity" integer NOT NULL,
    "unit_cost" numeric,
    "supplier" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_bill_of_materials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_certificates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "cert_type" "text",
    "cert_url" "text",
    "issued_by" "text",
    "issued_on" timestamp with time zone DEFAULT "now"(),
    "notes" "text"
);


ALTER TABLE "public"."job_certificates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_checklists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "item" "text",
    "is_complete" boolean DEFAULT false,
    "completed_by" "text",
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."job_checklists" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_expectations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "expected_labor_hours" numeric,
    "expected_material_cost" numeric,
    "expected_gross_profit" numeric,
    "client_expectation" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_expectations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "feedback_type" "text",
    "rating" integer,
    "sentiment" "text",
    "feedback_text" "text",
    "submitted_by" "text",
    "submitted_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_feedback" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_handover_links" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "url" "text",
    "label" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_handover_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_invoicing_summary" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "total_investment" numeric,
    "amount_paid" numeric,
    "balance_remaining" numeric GENERATED ALWAYS AS (("total_investment" - "amount_paid")) STORED,
    "payment_link" "text",
    "invoice_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_invoicing_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "location_id" "uuid",
    "arrival_window_start" timestamp with time zone,
    "arrival_window_end" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_materials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "material_name" "text",
    "quantity_estimated" integer,
    "quantity_used" integer,
    "unit_cost" numeric,
    "added_by" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_materials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "note_type" "text",
    "content" "text",
    "added_by" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_preparedness_scores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "has_scope" boolean DEFAULT false,
    "has_bom" boolean DEFAULT false,
    "has_staff" boolean DEFAULT false,
    "has_site_info" boolean DEFAULT false,
    "notes" "text",
    "scored_by" "text",
    "total_score" integer GENERATED ALWAYS AS ((((
CASE
    WHEN "has_scope" THEN 1
    ELSE 0
END +
CASE
    WHEN "has_bom" THEN 1
    ELSE 0
END) +
CASE
    WHEN "has_staff" THEN 1
    ELSE 0
END) +
CASE
    WHEN "has_site_info" THEN 1
    ELSE 0
END)) STORED,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_preparedness_scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "generated_by" "uuid",
    "report_url" "text",
    "summary" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "work_completed" "text",
    "checklist_items" "text"[],
    "variations" "text",
    "certificates" "text"[],
    "attachments" "text"[],
    "final_cost" numeric(10,2),
    "issued_to" "uuid",
    "issued_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_scope_of_works" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "description" "text" NOT NULL,
    "priority" integer DEFAULT 0,
    "estimated_hours" numeric,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_scope_of_works" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_scopes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "summary" "text",
    "objectives" "text",
    "constraints" "text",
    "client_expectations" "text",
    "created_by" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_scopes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_site_info" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "access_instructions" "text",
    "parking_details" "text",
    "site_hazards" "text",
    "contact_on_arrival" "text",
    "entry_requirements" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_site_info" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_staff_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "staff_name" "text",
    "role" "text",
    "assigned_date" "date",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_staff_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "assigned_to" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "due_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."job_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_worker_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "user_id" "uuid",
    "log_time" timestamp with time zone DEFAULT "now"(),
    "hours_worked" numeric,
    "materials_used" "text",
    "notes" "text"
);


ALTER TABLE "public"."job_worker_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_wrap_ups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "summary" "text",
    "completed_by" "text",
    "completed_on" timestamp with time zone DEFAULT "now"(),
    "client_feeling" "text",
    "internal_score" integer,
    "notes" "text"
);


ALTER TABLE "public"."job_wrap_ups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "opportunity_id" "uuid",
    "job_number" "text",
    "client_name" "text",
    "client_phone" "text",
    "client_email" "text",
    "address" "text",
    "suburb" "text",
    "scheduled_start" timestamp with time zone,
    "scheduled_end" timestamp with time zone,
    "job_type" "text",
    "status" "text" DEFAULT 'scheduled'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "project_id" "uuid",
    "estimated_hours" integer,
    "site_id" "uuid",
    "proposal_id" "uuid"
);


ALTER TABLE "public"."jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lead_id" "uuid",
    "type" "text" NOT NULL,
    "summary" "text",
    "outcome" "text",
    "contact_by" "text",
    "contact_time" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lead_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_scores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lead_id" "uuid",
    "score" integer,
    "notes" "text",
    "scored_by" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lead_scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lead_sources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_status_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lead_id" "uuid",
    "from_status" "text",
    "to_status" "text",
    "changed_by" "text",
    "changed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lead_status_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_tag_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lead_id" "uuid",
    "tag_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lead_tag_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lead_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "company" "text",
    "suburb" "text",
    "state" "text",
    "postcode" "text",
    "referred_by" "text",
    "connected_by" "text",
    "source_id" "uuid",
    "contacted" boolean DEFAULT false,
    "notes" "text",
    "current_status" "text" DEFAULT 'new'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "client_type" "text",
    "work_type" "text",
    "budget_estimate" "text",
    "urgency" "text",
    "contact_method" "text",
    "description" "text",
    "consent" boolean,
    "lead_score" integer,
    "owner_id" "uuid"
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "label" "text" NOT NULL,
    "address" "text",
    "suburb" "text",
    "state" "text",
    "postcode" "text",
    "lat" double precision,
    "lng" double precision,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."maintenance_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "property_id" "uuid",
    "service_type" "text",
    "due_date" "date",
    "status" "text" DEFAULT 'upcoming'::"text",
    "job_id" "uuid",
    "created_by" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."maintenance_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."maintenance_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "property_id" "uuid",
    "service_type" "text",
    "service_date" "date",
    "technician" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."maintenance_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."maintenance_programs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "service_type" "text" NOT NULL,
    "description" "text",
    "default_interval_months" integer NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."maintenance_programs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_webhook_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "provider" "text",
    "event_type" "text",
    "payload" "jsonb",
    "received_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payment_webhook_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoice_id" "uuid",
    "payment_provider" "text",
    "provider_payment_id" "text",
    "amount" numeric(10,2),
    "currency" "text" DEFAULT 'AUD'::"text",
    "status" "text",
    "paid_at" timestamp with time zone,
    "receipt_url" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "user_email" "text",
    "role" "text",
    "assigned_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_briefs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lead_id" "uuid",
    "meeting_notes" "text",
    "site_conditions" "text",
    "client_goals" "text",
    "special_considerations" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_briefs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_milestones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "name" "text" NOT NULL,
    "due_date" timestamp with time zone,
    "completed" boolean DEFAULT false,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_milestones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "lead_id" "uuid",
    "proposal_id" "uuid",
    "status" "text" DEFAULT 'planning'::"text",
    "priority" "text" DEFAULT 'normal'::"text",
    "site_address" "text",
    "suburb" "text",
    "state" "text",
    "postcode" "text",
    "start_date" "date",
    "end_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."property_registry" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_name" "text",
    "address" "text",
    "suburb" "text",
    "state" "text",
    "postcode" "text",
    "contact_email" "text",
    "contact_phone" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."property_registry" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."proposal_costings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "proposal_id" "uuid",
    "raw_materials_cost" numeric,
    "labour_hours_estimate" numeric,
    "labour_rate" numeric,
    "total_labour_cost" numeric GENERATED ALWAYS AS (("labour_hours_estimate" * "labour_rate")) STORED,
    "markup_percentage" numeric,
    "gross_profit" numeric,
    "sale_total" numeric,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."proposal_costings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."proposal_scores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "proposal_id" "uuid",
    "estimated_value" numeric,
    "estimated_labor_hours" numeric,
    "estimated_material_cost" numeric,
    "estimated_gross_margin" numeric,
    "score" integer,
    "created_by" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."proposal_scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."proposals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lead_id" "uuid",
    "brief_id" "uuid",
    "title" "text",
    "summary" "text",
    "version" integer DEFAULT 1,
    "is_latest" boolean DEFAULT true,
    "parent_proposal_id" "uuid",
    "status" "text" DEFAULT 'draft'::"text",
    "sent_at" timestamp with time zone,
    "accepted_at" timestamp with time zone,
    "declined_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."proposals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sales_activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "opportunity_id" "uuid",
    "type" "text" NOT NULL,
    "summary" "text",
    "outcome" "text",
    "conducted_by" "text",
    "scheduled_time" timestamp with time zone,
    "completed_time" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sales_activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sales_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "opportunity_id" "uuid",
    "file_url" "text",
    "label" "text",
    "uploaded_by" "text",
    "uploaded_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sales_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sales_opportunities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lead_id" "uuid",
    "current_stage_id" "uuid",
    "status" "text" DEFAULT 'open'::"text",
    "estimated_value" numeric,
    "expected_close_date" "date",
    "actual_close_date" "date",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sales_opportunities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sales_stage_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "opportunity_id" "uuid",
    "from_stage_id" "uuid",
    "to_stage_id" "uuid",
    "changed_by" "text",
    "changed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sales_stage_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sales_stages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "stage_order" integer,
    "is_final_stage" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sales_stages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task_id" "uuid",
    "start_time" timestamp with time zone,
    "end_time" timestamp with time zone,
    "all_day" boolean DEFAULT false,
    "recurring_pattern" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scoreboard_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "snapshot_date" "date" DEFAULT CURRENT_DATE,
    "total_leads" integer,
    "new_leads_this_week" integer,
    "contacted_rate" numeric,
    "avg_lead_score" numeric,
    "open_opportunities" integer,
    "win_rate" numeric,
    "avg_time_to_close" interval,
    "total_pipeline_value" numeric,
    "jobs_scheduled" integer,
    "jobs_completed_this_week" integer,
    "avg_job_preparedness_score" numeric,
    "rework_flagged" integer,
    "avg_hours_logged_per_job" numeric,
    "material_variance_rate" numeric,
    "job_notes_flagged" integer,
    "revenue_this_week" numeric,
    "total_outstanding_balance" numeric,
    "avg_job_value" numeric,
    "avg_client_feedback_rating" numeric,
    "positive_sentiment_rate" numeric,
    "team_utilisation_rate" numeric,
    "next_maintenance_jobs" integer,
    "generated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."scoreboard_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."task_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."task_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."task_tag_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task_id" "uuid",
    "tag_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."task_tag_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."task_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."task_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'not_started'::"text",
    "due_date" "date",
    "completed_at" timestamp with time zone,
    "priority" "text" DEFAULT 'medium'::"text",
    "category_id" "uuid",
    "assigned_to" "uuid",
    "related_job_id" "uuid",
    "related_project_id" "uuid",
    "related_proposal_id" "uuid",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "role_id" "uuid",
    "assigned_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auth_user_id" "uuid",
    "full_name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "role" "text" DEFAULT 'staff'::"text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."client_contacts"
    ADD CONSTRAINT "client_contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_reviews"
    ADD CONSTRAINT "client_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_sites"
    ADD CONSTRAINT "client_sites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_tag_assignments"
    ADD CONSTRAINT "document_tag_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_tags"
    ADD CONSTRAINT "document_tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."document_tags"
    ADD CONSTRAINT "document_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_templates"
    ADD CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_versions"
    ADD CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evidence_media"
    ADD CONSTRAINT "evidence_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_square_invoice_id_key" UNIQUE ("square_invoice_id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_stripe_invoice_id_key" UNIQUE ("stripe_invoice_id");



ALTER TABLE ONLY "public"."job_assignments"
    ADD CONSTRAINT "job_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_bill_of_materials"
    ADD CONSTRAINT "job_bill_of_materials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_certificates"
    ADD CONSTRAINT "job_certificates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_checklists"
    ADD CONSTRAINT "job_checklists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_expectations"
    ADD CONSTRAINT "job_expectations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_feedback"
    ADD CONSTRAINT "job_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_handover_links"
    ADD CONSTRAINT "job_handover_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_invoicing_summary"
    ADD CONSTRAINT "job_invoicing_summary_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_locations"
    ADD CONSTRAINT "job_locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_materials"
    ADD CONSTRAINT "job_materials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_notes"
    ADD CONSTRAINT "job_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_preparedness_scores"
    ADD CONSTRAINT "job_preparedness_scores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_reports"
    ADD CONSTRAINT "job_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_scope_of_works"
    ADD CONSTRAINT "job_scope_of_works_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_scopes"
    ADD CONSTRAINT "job_scopes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_site_info"
    ADD CONSTRAINT "job_site_info_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_staff_assignments"
    ADD CONSTRAINT "job_staff_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_tasks"
    ADD CONSTRAINT "job_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_worker_logs"
    ADD CONSTRAINT "job_worker_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_wrap_ups"
    ADD CONSTRAINT "job_wrap_ups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_job_number_key" UNIQUE ("job_number");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_contacts"
    ADD CONSTRAINT "lead_contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_scores"
    ADD CONSTRAINT "lead_scores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_sources"
    ADD CONSTRAINT "lead_sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_status_log"
    ADD CONSTRAINT "lead_status_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_tag_assignments"
    ADD CONSTRAINT "lead_tag_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_tags"
    ADD CONSTRAINT "lead_tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."lead_tags"
    ADD CONSTRAINT "lead_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."maintenance_events"
    ADD CONSTRAINT "maintenance_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."maintenance_history"
    ADD CONSTRAINT "maintenance_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."maintenance_programs"
    ADD CONSTRAINT "maintenance_programs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."maintenance_programs"
    ADD CONSTRAINT "maintenance_programs_service_type_key" UNIQUE ("service_type");



ALTER TABLE ONLY "public"."payment_webhook_logs"
    ADD CONSTRAINT "payment_webhook_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_provider_payment_id_key" UNIQUE ("provider_payment_id");



ALTER TABLE ONLY "public"."project_assignments"
    ADD CONSTRAINT "project_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_briefs"
    ADD CONSTRAINT "project_briefs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_milestones"
    ADD CONSTRAINT "project_milestones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."property_registry"
    ADD CONSTRAINT "property_registry_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."proposal_costings"
    ADD CONSTRAINT "proposal_costings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."proposal_scores"
    ADD CONSTRAINT "proposal_scores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "proposals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sales_activities"
    ADD CONSTRAINT "sales_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sales_documents"
    ADD CONSTRAINT "sales_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sales_opportunities"
    ADD CONSTRAINT "sales_opportunities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sales_stage_history"
    ADD CONSTRAINT "sales_stage_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sales_stages"
    ADD CONSTRAINT "sales_stages_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."sales_stages"
    ADD CONSTRAINT "sales_stages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scoreboard_snapshots"
    ADD CONSTRAINT "scoreboard_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task_categories"
    ADD CONSTRAINT "task_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."task_categories"
    ADD CONSTRAINT "task_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task_tag_assignments"
    ADD CONSTRAINT "task_tag_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task_tags"
    ADD CONSTRAINT "task_tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."task_tags"
    ADD CONSTRAINT "task_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_contacts"
    ADD CONSTRAINT "client_contacts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_reviews"
    ADD CONSTRAINT "client_reviews_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_reviews"
    ADD CONSTRAINT "client_reviews_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_sites"
    ADD CONSTRAINT "client_sites_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_tag_assignments"
    ADD CONSTRAINT "document_tag_assignments_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_tag_assignments"
    ADD CONSTRAINT "document_tag_assignments_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."document_tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_templates"
    ADD CONSTRAINT "document_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."document_versions"
    ADD CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_versions"
    ADD CONSTRAINT "document_versions_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_related_client_id_fkey" FOREIGN KEY ("related_client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_related_job_id_fkey" FOREIGN KEY ("related_job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_related_proposal_id_fkey" FOREIGN KEY ("related_proposal_id") REFERENCES "public"."proposals"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_related_site_id_fkey" FOREIGN KEY ("related_site_id") REFERENCES "public"."client_sites"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."document_templates"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."evidence_media"
    ADD CONSTRAINT "evidence_media_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id");



ALTER TABLE ONLY "public"."evidence_media"
    ADD CONSTRAINT "evidence_media_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."job_assignments"
    ADD CONSTRAINT "job_assignments_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_assignments"
    ADD CONSTRAINT "job_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_bill_of_materials"
    ADD CONSTRAINT "job_bill_of_materials_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_certificates"
    ADD CONSTRAINT "job_certificates_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_checklists"
    ADD CONSTRAINT "job_checklists_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_expectations"
    ADD CONSTRAINT "job_expectations_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_feedback"
    ADD CONSTRAINT "job_feedback_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_handover_links"
    ADD CONSTRAINT "job_handover_links_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_invoicing_summary"
    ADD CONSTRAINT "job_invoicing_summary_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_locations"
    ADD CONSTRAINT "job_locations_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_locations"
    ADD CONSTRAINT "job_locations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_materials"
    ADD CONSTRAINT "job_materials_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_notes"
    ADD CONSTRAINT "job_notes_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_preparedness_scores"
    ADD CONSTRAINT "job_preparedness_scores_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_reports"
    ADD CONSTRAINT "job_reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."job_reports"
    ADD CONSTRAINT "job_reports_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."job_reports"
    ADD CONSTRAINT "job_reports_issued_to_fkey" FOREIGN KEY ("issued_to") REFERENCES "public"."clients"("id");



ALTER TABLE ONLY "public"."job_reports"
    ADD CONSTRAINT "job_reports_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id");



ALTER TABLE ONLY "public"."job_scope_of_works"
    ADD CONSTRAINT "job_scope_of_works_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_scopes"
    ADD CONSTRAINT "job_scopes_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_site_info"
    ADD CONSTRAINT "job_site_info_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_staff_assignments"
    ADD CONSTRAINT "job_staff_assignments_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_tasks"
    ADD CONSTRAINT "job_tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."job_tasks"
    ADD CONSTRAINT "job_tasks_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_worker_logs"
    ADD CONSTRAINT "job_worker_logs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_worker_logs"
    ADD CONSTRAINT "job_worker_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_wrap_ups"
    ADD CONSTRAINT "job_wrap_ups_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "public"."sales_opportunities"("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."client_sites"("id");



ALTER TABLE ONLY "public"."lead_contacts"
    ADD CONSTRAINT "lead_contacts_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lead_scores"
    ADD CONSTRAINT "lead_scores_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lead_status_log"
    ADD CONSTRAINT "lead_status_log_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lead_tag_assignments"
    ADD CONSTRAINT "lead_tag_assignments_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lead_tag_assignments"
    ADD CONSTRAINT "lead_tag_assignments_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."lead_tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "public"."lead_sources"("id");



ALTER TABLE ONLY "public"."maintenance_events"
    ADD CONSTRAINT "maintenance_events_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id");



ALTER TABLE ONLY "public"."maintenance_events"
    ADD CONSTRAINT "maintenance_events_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."property_registry"("id");



ALTER TABLE ONLY "public"."maintenance_history"
    ADD CONSTRAINT "maintenance_history_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."maintenance_history"
    ADD CONSTRAINT "maintenance_history_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."property_registry"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_assignments"
    ADD CONSTRAINT "project_assignments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_briefs"
    ADD CONSTRAINT "project_briefs_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_milestones"
    ADD CONSTRAINT "project_milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."proposal_costings"
    ADD CONSTRAINT "proposal_costings_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proposal_scores"
    ADD CONSTRAINT "proposal_scores_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "proposals_brief_id_fkey" FOREIGN KEY ("brief_id") REFERENCES "public"."project_briefs"("id");



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "proposals_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "proposals_parent_proposal_id_fkey" FOREIGN KEY ("parent_proposal_id") REFERENCES "public"."proposals"("id");



ALTER TABLE ONLY "public"."sales_activities"
    ADD CONSTRAINT "sales_activities_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "public"."sales_opportunities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sales_documents"
    ADD CONSTRAINT "sales_documents_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "public"."sales_opportunities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sales_opportunities"
    ADD CONSTRAINT "sales_opportunities_current_stage_id_fkey" FOREIGN KEY ("current_stage_id") REFERENCES "public"."sales_stages"("id");



ALTER TABLE ONLY "public"."sales_opportunities"
    ADD CONSTRAINT "sales_opportunities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sales_stage_history"
    ADD CONSTRAINT "sales_stage_history_from_stage_id_fkey" FOREIGN KEY ("from_stage_id") REFERENCES "public"."sales_stages"("id");



ALTER TABLE ONLY "public"."sales_stage_history"
    ADD CONSTRAINT "sales_stage_history_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "public"."sales_opportunities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sales_stage_history"
    ADD CONSTRAINT "sales_stage_history_to_stage_id_fkey" FOREIGN KEY ("to_stage_id") REFERENCES "public"."sales_stages"("id");



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."task_tag_assignments"
    ADD CONSTRAINT "task_tag_assignments_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."task_tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."task_tag_assignments"
    ADD CONSTRAINT "task_tag_assignments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."task_categories"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_related_job_id_fkey" FOREIGN KEY ("related_job_id") REFERENCES "public"."jobs"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_related_project_id_fkey" FOREIGN KEY ("related_project_id") REFERENCES "public"."projects"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_related_proposal_id_fkey" FOREIGN KEY ("related_proposal_id") REFERENCES "public"."proposals"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON TABLE "public"."client_contacts" TO "anon";
GRANT ALL ON TABLE "public"."client_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."client_contacts" TO "service_role";



GRANT ALL ON TABLE "public"."client_reviews" TO "anon";
GRANT ALL ON TABLE "public"."client_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."client_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."client_sites" TO "anon";
GRANT ALL ON TABLE "public"."client_sites" TO "authenticated";
GRANT ALL ON TABLE "public"."client_sites" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON TABLE "public"."document_tag_assignments" TO "anon";
GRANT ALL ON TABLE "public"."document_tag_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."document_tag_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."document_tags" TO "anon";
GRANT ALL ON TABLE "public"."document_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."document_tags" TO "service_role";



GRANT ALL ON TABLE "public"."document_templates" TO "anon";
GRANT ALL ON TABLE "public"."document_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."document_templates" TO "service_role";



GRANT ALL ON TABLE "public"."document_versions" TO "anon";
GRANT ALL ON TABLE "public"."document_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."document_versions" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."evidence_media" TO "anon";
GRANT ALL ON TABLE "public"."evidence_media" TO "authenticated";
GRANT ALL ON TABLE "public"."evidence_media" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON TABLE "public"."job_assignments" TO "anon";
GRANT ALL ON TABLE "public"."job_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."job_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."job_bill_of_materials" TO "anon";
GRANT ALL ON TABLE "public"."job_bill_of_materials" TO "authenticated";
GRANT ALL ON TABLE "public"."job_bill_of_materials" TO "service_role";



GRANT ALL ON TABLE "public"."job_certificates" TO "anon";
GRANT ALL ON TABLE "public"."job_certificates" TO "authenticated";
GRANT ALL ON TABLE "public"."job_certificates" TO "service_role";



GRANT ALL ON TABLE "public"."job_checklists" TO "anon";
GRANT ALL ON TABLE "public"."job_checklists" TO "authenticated";
GRANT ALL ON TABLE "public"."job_checklists" TO "service_role";



GRANT ALL ON TABLE "public"."job_expectations" TO "anon";
GRANT ALL ON TABLE "public"."job_expectations" TO "authenticated";
GRANT ALL ON TABLE "public"."job_expectations" TO "service_role";



GRANT ALL ON TABLE "public"."job_feedback" TO "anon";
GRANT ALL ON TABLE "public"."job_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."job_feedback" TO "service_role";



GRANT ALL ON TABLE "public"."job_handover_links" TO "anon";
GRANT ALL ON TABLE "public"."job_handover_links" TO "authenticated";
GRANT ALL ON TABLE "public"."job_handover_links" TO "service_role";



GRANT ALL ON TABLE "public"."job_invoicing_summary" TO "anon";
GRANT ALL ON TABLE "public"."job_invoicing_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."job_invoicing_summary" TO "service_role";



GRANT ALL ON TABLE "public"."job_locations" TO "anon";
GRANT ALL ON TABLE "public"."job_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."job_locations" TO "service_role";



GRANT ALL ON TABLE "public"."job_materials" TO "anon";
GRANT ALL ON TABLE "public"."job_materials" TO "authenticated";
GRANT ALL ON TABLE "public"."job_materials" TO "service_role";



GRANT ALL ON TABLE "public"."job_notes" TO "anon";
GRANT ALL ON TABLE "public"."job_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."job_notes" TO "service_role";



GRANT ALL ON TABLE "public"."job_preparedness_scores" TO "anon";
GRANT ALL ON TABLE "public"."job_preparedness_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."job_preparedness_scores" TO "service_role";



GRANT ALL ON TABLE "public"."job_reports" TO "anon";
GRANT ALL ON TABLE "public"."job_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."job_reports" TO "service_role";



GRANT ALL ON TABLE "public"."job_scope_of_works" TO "anon";
GRANT ALL ON TABLE "public"."job_scope_of_works" TO "authenticated";
GRANT ALL ON TABLE "public"."job_scope_of_works" TO "service_role";



GRANT ALL ON TABLE "public"."job_scopes" TO "anon";
GRANT ALL ON TABLE "public"."job_scopes" TO "authenticated";
GRANT ALL ON TABLE "public"."job_scopes" TO "service_role";



GRANT ALL ON TABLE "public"."job_site_info" TO "anon";
GRANT ALL ON TABLE "public"."job_site_info" TO "authenticated";
GRANT ALL ON TABLE "public"."job_site_info" TO "service_role";



GRANT ALL ON TABLE "public"."job_staff_assignments" TO "anon";
GRANT ALL ON TABLE "public"."job_staff_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."job_staff_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."job_tasks" TO "anon";
GRANT ALL ON TABLE "public"."job_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."job_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."job_worker_logs" TO "anon";
GRANT ALL ON TABLE "public"."job_worker_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."job_worker_logs" TO "service_role";



GRANT ALL ON TABLE "public"."job_wrap_ups" TO "anon";
GRANT ALL ON TABLE "public"."job_wrap_ups" TO "authenticated";
GRANT ALL ON TABLE "public"."job_wrap_ups" TO "service_role";



GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";



GRANT ALL ON TABLE "public"."lead_contacts" TO "anon";
GRANT ALL ON TABLE "public"."lead_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_contacts" TO "service_role";



GRANT ALL ON TABLE "public"."lead_scores" TO "anon";
GRANT ALL ON TABLE "public"."lead_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_scores" TO "service_role";



GRANT ALL ON TABLE "public"."lead_sources" TO "anon";
GRANT ALL ON TABLE "public"."lead_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_sources" TO "service_role";



GRANT ALL ON TABLE "public"."lead_status_log" TO "anon";
GRANT ALL ON TABLE "public"."lead_status_log" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_status_log" TO "service_role";



GRANT ALL ON TABLE "public"."lead_tag_assignments" TO "anon";
GRANT ALL ON TABLE "public"."lead_tag_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_tag_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."lead_tags" TO "anon";
GRANT ALL ON TABLE "public"."lead_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_tags" TO "service_role";



GRANT ALL ON TABLE "public"."leads" TO "anon";
GRANT ALL ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";



GRANT ALL ON TABLE "public"."locations" TO "anon";
GRANT ALL ON TABLE "public"."locations" TO "authenticated";
GRANT ALL ON TABLE "public"."locations" TO "service_role";



GRANT ALL ON TABLE "public"."maintenance_events" TO "anon";
GRANT ALL ON TABLE "public"."maintenance_events" TO "authenticated";
GRANT ALL ON TABLE "public"."maintenance_events" TO "service_role";



GRANT ALL ON TABLE "public"."maintenance_history" TO "anon";
GRANT ALL ON TABLE "public"."maintenance_history" TO "authenticated";
GRANT ALL ON TABLE "public"."maintenance_history" TO "service_role";



GRANT ALL ON TABLE "public"."maintenance_programs" TO "anon";
GRANT ALL ON TABLE "public"."maintenance_programs" TO "authenticated";
GRANT ALL ON TABLE "public"."maintenance_programs" TO "service_role";



GRANT ALL ON TABLE "public"."payment_webhook_logs" TO "anon";
GRANT ALL ON TABLE "public"."payment_webhook_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_webhook_logs" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."project_assignments" TO "anon";
GRANT ALL ON TABLE "public"."project_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."project_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."project_briefs" TO "anon";
GRANT ALL ON TABLE "public"."project_briefs" TO "authenticated";
GRANT ALL ON TABLE "public"."project_briefs" TO "service_role";



GRANT ALL ON TABLE "public"."project_milestones" TO "anon";
GRANT ALL ON TABLE "public"."project_milestones" TO "authenticated";
GRANT ALL ON TABLE "public"."project_milestones" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."property_registry" TO "anon";
GRANT ALL ON TABLE "public"."property_registry" TO "authenticated";
GRANT ALL ON TABLE "public"."property_registry" TO "service_role";



GRANT ALL ON TABLE "public"."proposal_costings" TO "anon";
GRANT ALL ON TABLE "public"."proposal_costings" TO "authenticated";
GRANT ALL ON TABLE "public"."proposal_costings" TO "service_role";



GRANT ALL ON TABLE "public"."proposal_scores" TO "anon";
GRANT ALL ON TABLE "public"."proposal_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."proposal_scores" TO "service_role";



GRANT ALL ON TABLE "public"."proposals" TO "anon";
GRANT ALL ON TABLE "public"."proposals" TO "authenticated";
GRANT ALL ON TABLE "public"."proposals" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."sales_activities" TO "anon";
GRANT ALL ON TABLE "public"."sales_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."sales_activities" TO "service_role";



GRANT ALL ON TABLE "public"."sales_documents" TO "anon";
GRANT ALL ON TABLE "public"."sales_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."sales_documents" TO "service_role";



GRANT ALL ON TABLE "public"."sales_opportunities" TO "anon";
GRANT ALL ON TABLE "public"."sales_opportunities" TO "authenticated";
GRANT ALL ON TABLE "public"."sales_opportunities" TO "service_role";



GRANT ALL ON TABLE "public"."sales_stage_history" TO "anon";
GRANT ALL ON TABLE "public"."sales_stage_history" TO "authenticated";
GRANT ALL ON TABLE "public"."sales_stage_history" TO "service_role";



GRANT ALL ON TABLE "public"."sales_stages" TO "anon";
GRANT ALL ON TABLE "public"."sales_stages" TO "authenticated";
GRANT ALL ON TABLE "public"."sales_stages" TO "service_role";



GRANT ALL ON TABLE "public"."schedules" TO "anon";
GRANT ALL ON TABLE "public"."schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."schedules" TO "service_role";



GRANT ALL ON TABLE "public"."scoreboard_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."scoreboard_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."scoreboard_snapshots" TO "service_role";



GRANT ALL ON TABLE "public"."task_categories" TO "anon";
GRANT ALL ON TABLE "public"."task_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."task_categories" TO "service_role";



GRANT ALL ON TABLE "public"."task_tag_assignments" TO "anon";
GRANT ALL ON TABLE "public"."task_tag_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."task_tag_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."task_tags" TO "anon";
GRANT ALL ON TABLE "public"."task_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."task_tags" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






RESET ALL;
