# Job Management System (JMS)

A comprehensive task management system for trade services companies, built with Next.js, TailwindCSS, shadcn/ui, and Supabase.

## Features

### 🎯 Core Functionality
- **Job Lifecycle Management**: From lead to completion
- **Task Breakdown**: Break down jobs into manageable tasks
- **Real-time Updates**: Live task status and progress tracking
- **Staff Assignment**: Assign tasks to specific workers
- **Progress Tracking**: Visual progress indicators and time tracking
- **Activity Logging**: Detailed logs of task activities and notes

### 📊 Dashboard & Analytics
- **Jobs Dashboard**: Overview of all jobs with task statistics
- **Task Progress**: Real-time progress tracking per job
- **Performance Metrics**: Completion rates, time tracking, and efficiency
- **Status Filtering**: Filter jobs by status (scheduled, in progress, completed, cancelled)

### 🛠 Task Management
- **Smart Task Creation**: AI-powered task suggestions based on scope of works
- **Custom Tasks**: Create custom tasks with descriptions and priorities
- **Task Status**: Track tasks through not started → in progress → completed/blocked
- **Priority Levels**: Low, Normal, High, Critical priority management
- **Time Estimation**: Estimated hours for each task
- **Due Dates**: Set deadlines for task completion

### 👥 Staff Management
- **Staff Assignment**: Assign multiple workers to tasks
- **Check-in/Check-out**: Track staff arrival and departure times
- **Time Logging**: Record hours worked on specific tasks
- **Role-based Assignment**: Assign tasks based on worker roles

### 📝 Activity & Logging
- **Task Logs**: Detailed activity logs for each task
- **Progress Notes**: Add notes and updates to tasks
- **Material Tracking**: Track materials used on tasks
- **Blocking Issues**: Mark tasks as blocked with reasons

## Database Schema

### Core Tables
- `jobs`: Main job information and status
- `job_tasks`: Individual tasks within jobs
- `task_assignments`: Staff assignments to tasks
- `task_logs`: Activity logs and progress updates
- `staff_times`: Staff check-in/check-out tracking
- `job_wrapup`: Job completion checklist

### Key Relationships
- Jobs → Tasks (one-to-many)
- Tasks → Assignments (one-to-many)
- Tasks → Logs (one-to-many)
- Jobs → Staff Times (one-to-many)

## Usage Guide

### Creating Jobs
1. Navigate to `/jobs` to view the jobs dashboard
2. Click "Create New Job" to add a new job
3. Fill in job details including scope of works
4. Assign staff and set scheduled date

### Managing Tasks
1. Open a job detail page (`/jobs/[id]`)
2. Click "Create Tasks" to open the task creator
3. Select from suggested tasks or create custom ones
4. Assign tasks to staff members
5. Set priorities and estimated hours

### Tracking Progress
1. Use the TaskManager component to view all tasks
2. Click "Start" to begin a task
3. Add progress logs with notes and hours worked
4. Mark tasks as completed or blocked
5. Monitor overall job progress

### Staff Management
1. Assign staff to jobs in the job creation process
2. Use check-in/check-out functionality for time tracking
3. Assign specific tasks to individual workers
4. Track hours worked per task and per worker

## Components

### TaskManager
- Main task management interface
- Real-time task status updates
- Progress tracking and visualization
- Task detail dialogs with activity logs

### TaskCreator
- Smart task suggestion based on scope
- Custom task creation
- Bulk task creation
- Priority and assignment management

### Jobs Dashboard
- Overview of all jobs
- Task statistics and progress
- Status filtering and sorting
- Quick actions for job management

## Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL)
- **Real-time**: Supabase real-time subscriptions
- **Icons**: Lucide React
- **Charts**: Recharts (for future analytics)

## Future Enhancements

### Planned Features
- **Scheduling**: Calendar integration and scheduling
- **Compliance**: Safety checklists and compliance tracking
- **Reporting**: Advanced analytics and reporting
- **Mobile App**: Native mobile application
- **Automation**: Automated task creation and assignment
- **Integration**: Third-party tool integrations

### Analytics & Reporting
- Job completion time analysis
- Worker productivity metrics
- Cost tracking and profitability
- Client satisfaction tracking
- Resource utilization reports

## Getting Started

1. **Setup Database**: Run the schema in `supabase-schema.sql`
2. **Install Dependencies**: `npm install`
3. **Configure Environment**: Set up Supabase environment variables
4. **Start Development**: `npm run dev`
5. **Access JMS**: Navigate to `/jobs` to start managing jobs

## Best Practices

### Task Creation
- Break down complex jobs into smaller, manageable tasks
- Use clear, descriptive task titles
- Set realistic time estimates
- Assign appropriate priorities

### Progress Tracking
- Update task status regularly
- Add detailed notes for complex tasks
- Log hours worked accurately
- Mark blocking issues promptly

### Staff Management
- Assign tasks based on worker skills and availability
- Use check-in/check-out for accurate time tracking
- Monitor task assignments for workload balance
- Provide clear task descriptions and expectations

## Support

For technical support or feature requests, please refer to the project documentation or contact the development team. 