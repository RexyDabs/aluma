# Task Creation System

This document describes the full-stack task creation system implemented for the Aluma SaaS application, including both client-side forms and server-side API endpoints.

## Overview

The task creation system provides multiple ways to create tasks in the `global_tasks` table, with comprehensive form validation, role-based access control, and real-time updates.

## Database Schema

### Global Tasks Table

```sql
CREATE TABLE "public"."global_tasks" (
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
```

### Related Tables

- **`task_categories`**: Predefined categories for organizing tasks
- **`task_tags`**: Tags for labeling and filtering tasks
- **`global_task_tags`**: Many-to-many relationship between tasks and tags
- **`users`**: User assignments and creation tracking

## Components

### 1. TaskCreationForm (`components/TaskCreationForm.tsx`)

A comprehensive task creation form with all advanced features.

**Features:**
- ✅ Full task details (title, description, status, priority)
- ✅ Category selection with color coding
- ✅ Multiple tag assignment
- ✅ Multiple user assignment
- ✅ Due date and time estimation
- ✅ Advanced options (recurring tasks, notes)
- ✅ Real-time validation
- ✅ Error handling and loading states

**Usage:**
```tsx
import TaskCreationForm from '../components/TaskCreationForm';

function MyComponent() {
  const [showForm, setShowForm] = useState(false);

  return (
    <TaskCreationForm
      isOpen={showForm}
      onClose={() => setShowForm(false)}
      onTaskCreated={(taskId) => {
        console.log('Task created:', taskId);
        // Refresh data or navigate
      }}
      initialData={{
        title: 'Pre-filled title',
        category_id: 'some-category-id',
        assigned_to: ['user-id-1', 'user-id-2'],
        tags: ['tag-id-1', 'tag-id-2']
      }}
    />
  );
}
```

### 2. QuickTaskForm (`components/QuickTaskForm.tsx`)

A simplified task creation form for rapid task creation.

**Features:**
- ✅ Essential fields only (title, description, priority, due date, assignee)
- ✅ Streamlined UI for quick creation
- ✅ Same validation and error handling
- ✅ Customizable trigger button

**Usage:**
```tsx
import QuickTaskForm from '../components/QuickTaskForm';

function MyComponent() {
  return (
    <QuickTaskForm
      isOpen={showQuickForm}
      onClose={() => setShowQuickForm(false)}
      onTaskCreated={(taskId) => {
        console.log('Quick task created:', taskId);
      }}
      trigger={
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Quick Task
        </Button>
      }
    />
  );
}
```

## API Endpoints

### POST `/api/tasks`

Creates a new task with server-side validation.

**Request Body:**
```json
{
  "title": "Task title",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "category_id": "uuid",
  "due_date": "2024-01-15",
  "estimated_hours": 2.5,
  "notes": "Additional notes",
  "is_recurring": false,
  "recurrence_pattern": "weekly",
  "assigned_to": ["user-id-1", "user-id-2"],
  "tags": ["tag-id-1", "tag-id-2"],
  "created_by": "user-id"
}
```

**Response:**
```json
{
  "success": true,
  "task": {
    "id": "task-uuid",
    "title": "Task title",
    "description": "Task description",
    "status": "todo",
    "priority": "medium",
    "created_at": "2024-01-01T00:00:00Z",
    // ... other fields
  },
  "message": "Task created successfully"
}
```

### GET `/api/tasks`

Retrieves tasks with optional filtering.

**Query Parameters:**
- `status`: Filter by task status
- `category`: Filter by category ID
- `assigned_to`: Filter by assigned user
- `created_by`: Filter by task creator

**Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "task-uuid",
      "title": "Task title",
      "status": "todo",
      "category": {
        "id": "category-uuid",
        "name": "Development",
        "color": "#3b82f6"
      },
      "tags": [
        {
          "id": "tag-uuid",
          "name": "urgent",
          "color": "#ef4444"
        }
      ]
    }
  ]
}
```

## Setup Instructions

### 1. Database Setup

Run the SQL script to create the required tables:

```sql
-- Run scripts/create-global-tasks-table.sql in Supabase SQL Editor
```

### 2. Default Data

The script includes default categories and tags:

**Categories:**
- Development (Blue)
- Design (Purple)
- Marketing (Green)
- Administration (Orange)
- Support (Red)
- Planning (Cyan)

**Tags:**
- urgent (Red)
- bug (Dark Red)
- feature (Green)
- improvement (Purple)
- documentation (Cyan)
- testing (Orange)

### 3. Role-Based Access

The system integrates with the existing RBAC system:

- **Admin/Manager**: Can create tasks and assign to any user
- **Technician/Subcontractor**: Can create tasks but limited assignment options
- **Staff**: Can create basic tasks

## Usage Examples

### Basic Task Creation

```tsx
// Using the full form
<TaskCreationForm
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  onTaskCreated={(taskId) => {
    // Handle success
    toast.success('Task created successfully!');
    refreshTasks();
  }}
/>
```

### Quick Task Creation

```tsx
// Using the quick form
<QuickTaskForm
  isOpen={showQuickForm}
  onClose={() => setShowQuickForm(false)}
  onTaskCreated={(taskId) => {
    // Handle success
    console.log('Quick task created:', taskId);
  }}
/>
```

### API-Based Task Creation

```tsx
// Using the API directly
async function createTask(taskData) {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...taskData,
      created_by: currentUser.id,
    }),
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Task created:', result.task);
  } else {
    console.error('Error:', result.error);
  }
}
```

### Task Filtering

```tsx
// Fetch tasks with filters
async function fetchTasks(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/tasks?${params}`);
  const result = await response.json();
  
  if (result.success) {
    setTasks(result.tasks);
  }
}

// Usage
fetchTasks({
  status: 'todo',
  category: 'development-category-id',
  assigned_to: 'current-user-id'
});
```

## Form Features

### Validation

- **Title**: Required, minimum 3 characters
- **Description**: Optional, supports markdown
- **Due Date**: Optional, must be future date
- **Estimated Hours**: Optional, must be positive number
- **Assignees**: Optional, must be valid user IDs
- **Tags**: Optional, must be valid tag IDs

### Priority Levels

- **Low**: Gray badge
- **Medium**: Blue badge (default)
- **High**: Orange badge
- **Urgent**: Red badge

### Status Options

- **To Do**: Default status for new tasks
- **In Progress**: Task is being worked on
- **Review**: Task is ready for review
- **Done**: Task is completed
- **Blocked**: Task is blocked by external factors

### Advanced Features

- **Recurring Tasks**: Set tasks to repeat daily, weekly, monthly, etc.
- **Parent Tasks**: Link tasks to parent tasks for subtask management
- **External References**: Link to external systems or documents
- **Time Tracking**: Estimated vs actual hours
- **Notes**: Additional context and information

## Integration Points

### With Role-Based Access Control

Tasks respect user permissions:
- Users can only see tasks they're assigned to or created
- Admins and managers can see all tasks
- Assignment options are filtered by user role

### With Dashboard

Tasks appear in the dashboard:
- Recent tasks widget
- Task completion statistics
- Upcoming due dates
- Assigned task counts

### With Job Management

Tasks can be linked to jobs:
- Job-specific tasks
- Task assignments to job staff
- Task completion tracking

## Error Handling

### Client-Side Errors

- Form validation errors
- Network request failures
- Authentication errors
- Permission denied errors

### Server-Side Errors

- Database constraint violations
- Invalid data types
- Missing required fields
- Foreign key constraint failures

### Error Recovery

- Automatic retry for network errors
- Form state preservation on validation errors
- User-friendly error messages
- Fallback to API endpoints if client-side fails

## Performance Considerations

### Optimization

- Lazy loading of form components
- Debounced search in user/tag selectors
- Optimistic updates for better UX
- Efficient database queries with proper indexing

### Caching

- Category and tag data cached in components
- User list cached for assignment dropdowns
- Task list cached with proper invalidation

## Security

### Data Validation

- Server-side validation for all inputs
- SQL injection prevention
- XSS protection
- Input sanitization

### Access Control

- Role-based permissions
- User assignment validation
- Creator tracking
- Audit logging

## Future Enhancements

### Planned Features

- **Bulk Task Creation**: Create multiple tasks at once
- **Task Templates**: Predefined task templates
- **Task Dependencies**: Link tasks that depend on each other
- **Time Tracking**: Built-in time tracking for tasks
- **Task Comments**: Discussion threads on tasks
- **File Attachments**: Attach files to tasks
- **Task Automation**: Automatic task creation based on triggers
- **Task Analytics**: Detailed reporting and analytics

### Integration Opportunities

- **Calendar Integration**: Sync tasks with calendar apps
- **Email Notifications**: Notify assignees of new tasks
- **Slack/Teams Integration**: Post task updates to chat
- **Project Management**: Integration with external PM tools
- **Time Tracking**: Integration with time tracking services 