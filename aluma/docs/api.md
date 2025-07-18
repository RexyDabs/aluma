# Aluma API Documentation

This document describes the REST API endpoints and data models for the Aluma Trade Services Management Platform.

## Base URL

```
Production: https://aluma.app/api
Development: http://localhost:3000/api
```

## Authentication

All API requests require authentication via Supabase JWT tokens.

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Getting a Token

```javascript
const {
  data: { session },
} = await supabase.auth.getSession();
const token = session?.access_token;
```

## Core Endpoints

### Users

#### Get Current User

```http
GET /api/auth/user
```

**Response:**

```json
{
  "id": "uuid",
  "full_name": "John Doe",
  "email": "john@example.com",
  "role": "technician",
  "active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Invite User (Admin Only)

```http
POST /api/users/invite
```

**Request:**

```json
{
  "email": "newuser@example.com",
  "full_name": "New User",
  "role": "technician"
}
```

### Clients

#### List Clients

```http
GET /api/clients
```

**Query Parameters:**

- `limit` (optional): Number of records to return (default: 50)
- `offset` (optional): Number of records to skip (default: 0)
- `search` (optional): Search term for client name or email

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Acme Construction",
      "type": "business",
      "abn": "12345678901",
      "address": "123 Main St",
      "suburb": "Sydney",
      "state": "NSW",
      "postcode": "2000",
      "phone": "+61400000000",
      "email": "contact@acme.com",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1,
  "has_more": false
}
```

#### Create Client

```http
POST /api/clients
```

**Request:**

```json
{
  "name": "New Client Ltd",
  "type": "business",
  "abn": "98765432109",
  "address": "456 Oak Ave",
  "suburb": "Melbourne",
  "state": "VIC",
  "postcode": "3000",
  "phone": "+61411111111",
  "email": "hello@newclient.com",
  "notes": "Important client notes"
}
```

#### Get Client

```http
GET /api/clients/{id}
```

#### Update Client

```http
PUT /api/clients/{id}
```

#### Delete Client

```http
DELETE /api/clients/{id}
```

### Leads

#### List Leads

```http
GET /api/leads
```

**Query Parameters:**

- `status` (optional): Filter by status (new, contacted, engaged, proposal_sent, won, lost)
- `assigned_to` (optional): Filter by assigned user ID
- `created_after` (optional): ISO date string
- `value_min` (optional): Minimum lead value
- `value_max` (optional): Maximum lead value

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "client_id": "uuid",
      "name": "Office Renovation Project",
      "description": "Complete office electrical fitout",
      "status": "proposal_sent",
      "source": "referral",
      "value": 25000.0,
      "probability": 75,
      "expected_close_date": "2024-02-15",
      "assigned_to": "uuid",
      "created_by": "uuid",
      "notes": "High priority client",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-05T00:00:00Z",
      "client": {
        "name": "Acme Construction",
        "email": "contact@acme.com"
      }
    }
  ],
  "count": 1
}
```

#### Create Lead

```http
POST /api/leads
```

**Request:**

```json
{
  "client_id": "uuid",
  "name": "Kitchen Renovation",
  "description": "Electrical work for kitchen renovation",
  "source": "website",
  "value": 8500.0,
  "probability": 60,
  "expected_close_date": "2024-03-01",
  "assigned_to": "uuid",
  "notes": "Customer called about quote"
}
```

#### Update Lead Status

```http
PATCH /api/leads/{id}/status
```

**Request:**

```json
{
  "status": "won",
  "notes": "Client accepted proposal"
}
```

#### Convert Lead to Job

```http
POST /api/leads/{id}/convert
```

**Request:**

```json
{
  "scheduled_date": "2024-02-01",
  "project_manager": "uuid",
  "estimated_hours": 40,
  "notes": "Conversion notes"
}
```

### Jobs

#### List Jobs

```http
GET /api/jobs
```

**Query Parameters:**

- `status` (optional): scheduled, in_progress, completed, cancelled, on_hold
- `assigned_to` (optional): Filter by assigned user ID
- `client_id` (optional): Filter by client
- `scheduled_after` (optional): ISO date string
- `scheduled_before` (optional): ISO date string

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "job_number": "JOB-2024-001",
      "title": "Kitchen Electrical Installation",
      "description": "Complete kitchen electrical renovation",
      "scope_of_works": "Install power points, lighting, safety switches",
      "status": "in_progress",
      "priority": "medium",
      "scheduled_date": "2024-01-15",
      "start_date": "2024-01-15",
      "estimated_hours": 24.0,
      "actual_hours": 18.5,
      "estimated_value": 8500.0,
      "actual_cost": 1572.5,
      "created_by": "uuid",
      "project_manager": "uuid",
      "client": {
        "name": "Johnson Family",
        "address": "45 Oak Avenue"
      },
      "tasks_count": 5,
      "completed_tasks": 3,
      "progress_percentage": 60
    }
  ]
}
```

#### Create Job

```http
POST /api/jobs
```

**Request:**

```json
{
  "client_id": "uuid",
  "site_id": "uuid",
  "title": "Bathroom Renovation Electrical",
  "description": "Electrical work for bathroom renovation",
  "scope_of_works": "Install exhaust fan, lighting, heated towel rail circuit",
  "scheduled_date": "2024-02-01",
  "estimated_hours": 16,
  "estimated_value": 4500.0,
  "project_manager": "uuid",
  "priority": "medium"
}
```

#### Get Job Details

```http
GET /api/jobs/{id}
```

Includes related tasks, assignments, and time entries.

#### Update Job Status

```http
PATCH /api/jobs/{id}/status
```

**Request:**

```json
{
  "status": "completed",
  "completion_date": "2024-01-20",
  "notes": "Job completed successfully"
}
```

### Tasks

#### List Tasks

```http
GET /api/tasks
```

**Query Parameters:**

- `job_id` (optional): Filter by job
- `assigned_to` (optional): Filter by assigned user
- `status` (optional): pending, in_progress, completed, blocked
- `due_before` (optional): ISO date string

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "job_id": "uuid",
      "title": "Install power circuits",
      "description": "Run new cables and install power points",
      "status": "in_progress",
      "priority": "high",
      "estimated_hours": 8.0,
      "actual_hours": 6.5,
      "due_date": "2024-01-16",
      "sequence_order": 2,
      "notes": "Making good progress",
      "assigned_users": [
        {
          "id": "uuid",
          "full_name": "Dave Fletcher",
          "role": "technician"
        }
      ],
      "job": {
        "job_number": "JOB-2024-001",
        "title": "Kitchen Electrical"
      }
    }
  ]
}
```

#### Create Task

```http
POST /api/tasks
```

**Request:**

```json
{
  "job_id": "uuid",
  "title": "Install safety switches",
  "description": "Install RCD protection for new circuits",
  "estimated_hours": 4.0,
  "due_date": "2024-01-17",
  "priority": "high",
  "sequence_order": 3,
  "assigned_to": ["uuid"]
}
```

#### Update Task

```http
PUT /api/tasks/{id}
```

#### Update Task Status

```http
PATCH /api/tasks/{id}/status
```

**Request:**

```json
{
  "status": "completed",
  "notes": "Task completed successfully",
  "actual_hours": 7.5
}
```

### Time Tracking

#### Create Time Entry

```http
POST /api/time-entries
```

**Request:**

```json
{
  "job_id": "uuid",
  "task_id": "uuid",
  "start_time": "2024-01-15T08:00:00Z",
  "end_time": "2024-01-15T16:00:00Z",
  "description": "Installing power circuits",
  "billable": true
}
```

#### Start Timer

```http
POST /api/time-entries/start
```

**Request:**

```json
{
  "job_id": "uuid",
  "task_id": "uuid",
  "description": "Starting work on task"
}
```

#### Stop Timer

```http
POST /api/time-entries/{id}/stop
```

**Request:**

```json
{
  "end_time": "2024-01-15T16:00:00Z",
  "description": "Completed circuit installation"
}
```

#### List Time Entries

```http
GET /api/time-entries
```

**Query Parameters:**

- `user_id` (optional): Filter by user
- `job_id` (optional): Filter by job
- `date_from` (optional): ISO date string
- `date_to` (optional): ISO date string
- `billable` (optional): true/false

### Proposals

#### List Proposals

```http
GET /api/proposals
```

#### Create Proposal

```http
POST /api/proposals
```

**Request:**

```json
{
  "lead_id": "uuid",
  "client_id": "uuid",
  "title": "Kitchen Electrical Proposal",
  "description": "Complete electrical work for kitchen renovation",
  "valid_until": "2024-02-15",
  "terms_conditions": "Payment terms: 30% deposit, 70% on completion",
  "items": [
    {
      "description": "Power point installation",
      "quantity": 8,
      "unit_price": 150.0
    },
    {
      "description": "LED lighting installation",
      "quantity": 12,
      "unit_price": 95.0
    }
  ]
}
```

#### Send Proposal

```http
POST /api/proposals/{id}/send
```

#### Accept/Reject Proposal

```http
PATCH /api/proposals/{id}/respond
```

**Request:**

```json
{
  "status": "accepted",
  "client_notes": "Proposal looks good, please proceed"
}
```

### Invoices

#### List Invoices

```http
GET /api/invoices
```

#### Create Invoice

```http
POST /api/invoices
```

**Request:**

```json
{
  "job_id": "uuid",
  "client_id": "uuid",
  "issue_date": "2024-01-20",
  "due_date": "2024-02-03",
  "payment_terms": "Net 14 days",
  "items": [
    {
      "description": "Kitchen electrical work - 24 hours",
      "quantity": 24,
      "unit_price": 85.0
    },
    {
      "description": "Materials and equipment",
      "quantity": 1,
      "unit_price": 450.0
    }
  ]
}
```

#### Generate PDF

```http
GET /api/invoices/{id}/pdf
```

Returns PDF file for download.

#### Mark as Paid

```http
PATCH /api/invoices/{id}/payment
```

**Request:**

```json
{
  "paid_amount": 2490.0,
  "paid_at": "2024-01-25T00:00:00Z",
  "payment_method": "bank_transfer",
  "reference": "TXN123456"
}
```

## Reports & Analytics

### Dashboard KPIs

```http
GET /api/reports/dashboard
```

**Response:**

```json
{
  "active_jobs": 12,
  "pending_tasks": 45,
  "overdue_tasks": 3,
  "monthly_revenue": 125000.0,
  "outstanding_invoices": 25000.0,
  "team_utilization": 78.5,
  "lead_conversion_rate": 65.2,
  "average_job_value": 8750.0
}
```

### Job Performance

```http
GET /api/reports/jobs
```

**Query Parameters:**

- `period` (optional): last_30_days, last_90_days, year_to_date
- `client_id` (optional): Filter by client
- `project_manager` (optional): Filter by project manager

### Time Reports

```http
GET /api/reports/time
```

**Query Parameters:**

- `user_id` (optional): Filter by user
- `date_from` (required): ISO date string
- `date_to` (required): ISO date string
- `billable_only` (optional): true/false

### Revenue Reports

```http
GET /api/reports/revenue
```

## Webhooks

Aluma supports webhooks for real-time notifications of important events.

### Available Events

- `job.status_changed` - Job status updated
- `task.completed` - Task marked as completed
- `invoice.paid` - Invoice payment received
- `lead.converted` - Lead converted to job
- `user.created` - New user account created

### Webhook Configuration

```http
POST /api/webhooks
```

**Request:**

```json
{
  "url": "https://your-app.com/webhooks/aluma",
  "events": ["job.status_changed", "invoice.paid"],
  "secret": "your_webhook_secret"
}
```

### Webhook Payload Example

```json
{
  "event": "job.status_changed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "job_id": "uuid",
    "old_status": "in_progress",
    "new_status": "completed",
    "updated_by": "uuid"
  }
}
```

## Rate Limiting

API requests are limited to prevent abuse:

- **Authenticated Users**: 1000 requests per hour
- **Admin Users**: 5000 requests per hour
- **Webhook Endpoints**: 100 requests per minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642291200
```

## Error Handling

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### Common Error Codes

- `AUTHENTICATION_REQUIRED` (401)
- `INSUFFICIENT_PERMISSIONS` (403)
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (422)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_ERROR` (500)

## Data Models

### User

```typescript
interface User {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: "admin" | "manager" | "technician" | "subcontractor" | "staff";
  active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Client

```typescript
interface Client {
  id: string;
  name: string;
  type: "business" | "residential";
  abn?: string;
  address?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  phone?: string;
  email?: string;
  notes?: string;
  status: "active" | "inactive";
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

### Job

```typescript
interface Job {
  id: string;
  job_number: string;
  title: string;
  description?: string;
  scope_of_works?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "on_hold";
  priority: "low" | "medium" | "high" | "urgent";
  scheduled_date?: string;
  start_date?: string;
  completion_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  estimated_value?: number;
  actual_cost?: number;
  client_id: string;
  site_id?: string;
  lead_id?: string;
  created_by: string;
  project_manager?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

### Task

```typescript
interface Task {
  id: string;
  job_id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string;
  completed_at?: string;
  sequence_order: number;
  parent_task_id?: string;
  created_by: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { AlumaClient } from "@aluma/api-client";

const client = new AlumaClient({
  baseUrl: "https://aluma.app/api",
  apiKey: "your_api_key",
});

// Create a new job
const job = await client.jobs.create({
  title: "Kitchen Renovation",
  client_id: "client-uuid",
  estimated_hours: 24,
});

// List tasks for a job
const tasks = await client.tasks.list({
  job_id: job.id,
});
```

### Python

```python
from aluma import AlumaClient

client = AlumaClient(
    base_url='https://aluma.app/api',
    api_key='your_api_key'
)

# Create a new lead
lead = client.leads.create({
    'name': 'Office Renovation',
    'client_id': 'client-uuid',
    'value': 25000.00
})
```

## Testing

### Test Environment

```
Base URL: https://staging-api.aluma.app
```

### Test Credentials

```
Admin: test-admin@aluma.app / test123
Manager: test-manager@aluma.app / test123
Technician: test-tech@aluma.app / test123
```

### Postman Collection

Download the complete Postman collection: [aluma-api.postman_collection.json](./postman/aluma-api.postman_collection.json)

---

For questions or support, contact our API team at `api-support@aluma.app`.
