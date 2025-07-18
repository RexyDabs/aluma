# Aluma User Guide

Complete user guide for the Aluma Trade Services Management Platform. This guide covers all features and workflows for different user roles.

## Table of Contents

1. [Getting Started](#getting-started)
2. [User Roles](#user-roles)
3. [Dashboard Overview](#dashboard-overview)
4. [Lead Management](#lead-management)
5. [Job Management](#job-management)
6. [Task Management](#task-management)
7. [Time Tracking](#time-tracking)
8. [Proposals & Quotes](#proposals--quotes)
9. [Invoicing & Billing](#invoicing--billing)
10. [Client Management](#client-management)
11. [Reports & Analytics](#reports--analytics)
12. [Mobile Interface](#mobile-interface)
13. [Settings & Administration](#settings--administration)

## Getting Started

### Accessing Aluma

1. **Web Browser**: Visit your Aluma instance URL
2. **Login**: Use your provided credentials or demo account
3. **First Time Setup**: Complete your profile information

### Demo Accounts

Try Aluma with these demo credentials:

| Role       | Email                   | Password     | Description                 |
| ---------- | ----------------------- | ------------ | --------------------------- |
| Admin      | `admin@aluma.demo`      | `admin123`   | Full system access          |
| Manager    | `manager@aluma.demo`    | `manager123` | Team and project management |
| Technician | `technician@aluma.demo` | `tech123`    | Field worker interface      |

### Navigation

- **Sidebar Menu**: Main navigation on the left
- **Quick Actions**: Context-sensitive buttons in the top right
- **Search**: Global search across all data
- **User Menu**: Profile and settings in the top right corner

## User Roles

### Admin 👑

**Full System Access**

- Manage all users and permissions
- Access all clients, leads, jobs, and financial data
- System configuration and settings
- Generate all reports and analytics
- Invoice management and financial overview

**Typical Tasks:**

- User invitation and role assignment
- System configuration
- Financial reporting
- Data backup and maintenance

### Manager 📊

**Operational Oversight**

- View and manage all leads and jobs
- Assign work to team members
- Create proposals and quotes
- Monitor team performance
- Access operational reports

**Typical Tasks:**

- Lead qualification and assignment
- Job planning and resource allocation
- Proposal creation and follow-up
- Team performance monitoring

### Technician 🔧

**Field Work Focus**

- View assigned jobs and tasks
- Log time and update task progress
- Access job details and client information
- Upload photos and documentation
- Mobile-optimized interface

**Typical Tasks:**

- Complete assigned tasks
- Log work hours accurately
- Update job progress
- Communicate with office team

### Subcontractor 🏗️

**Limited Access**

- View only assigned work
- Time logging for billing
- Basic job information access
- Task completion updates

**Typical Tasks:**

- Complete contracted work
- Submit time logs
- Update task status

### Staff 👥

**Basic Access**

- Limited task access
- Basic time tracking
- View assigned work only

## Dashboard Overview

The dashboard provides a real-time overview of your business operations.

### Admin Dashboard

**Key Performance Indicators (KPIs):**

- Active Jobs: Currently in-progress projects
- Pending Tasks: Outstanding work items
- Monthly Revenue: Current month earnings
- Team Utilization: Average team productivity

**Widgets:**

- Revenue Chart: Monthly revenue trends
- Job Status Distribution: Visual job pipeline
- Recent Activity: Latest system activities
- Upcoming Deadlines: Important due dates
- Team Performance: Individual productivity metrics

### Manager Dashboard

**Focus Areas:**

- Project Pipeline: Leads to jobs conversion
- Team Workload: Staff assignment overview
- Financial Performance: Revenue and profitability
- Client Satisfaction: Job completion metrics

### Technician Dashboard

**Mobile-Optimized View:**

- My Tasks: Assigned work items
- Today's Schedule: Current day priorities
- Quick Actions: Common functions
- Time Tracking: Start/stop timers

## Lead Management

### Creating Leads

1. **Navigate**: Go to Leads → New Lead
2. **Client Selection**: Choose existing client or create new
3. **Lead Information**:
   - Lead name and description
   - Estimated value and probability
   - Expected close date
   - Lead source (referral, website, etc.)
4. **Assignment**: Assign to sales team member
5. **Follow-up**: Set reminder dates

### Lead Stages

```
New → Contacted → Engaged → Proposal Sent → Won/Lost
```

**New**: Initial lead entry, no contact made
**Contacted**: Initial outreach completed
**Engaged**: Active discussions with prospect
**Proposal Sent**: Formal quote submitted
**Won**: Lead converted to job
**Lost**: Lead did not convert

### Lead Conversion

**Converting Leads to Jobs:**

1. **Qualify Lead**: Ensure lead is ready for conversion
2. **Navigate**: Lead Details → Convert to Job
3. **Job Details**:
   - Confirm scope of work
   - Set project timeline
   - Assign project manager
   - Define team requirements
4. **Create Job**: System automatically creates job record

### Lead Reports

- Conversion rates by source
- Sales pipeline performance
- Individual salesperson metrics
- Lead aging analysis

## Job Management

### Job Lifecycle

```
Scheduled → In Progress → Completed
           ↓
        On Hold → In Progress
           ↓
       Cancelled
```

### Creating Jobs

**Two Ways to Create Jobs:**

1. **From Lead Conversion**: Recommended workflow
2. **Direct Creation**: For existing clients

**Job Creation Process:**

1. **Basic Information**:
   - Job title and description
   - Client and site selection
   - Scope of works detail
2. **Scheduling**:
   - Planned start date
   - Estimated duration
   - Priority level
3. **Team Assignment**:
   - Project manager
   - Assigned technicians
   - Hourly rates
4. **Financial**:
   - Estimated value
   - Budget allocation

### Job Details Page

**Information Sections:**

- Job Overview: Status, dates, financial summary
- Tasks: Breakdown of work items
- Team: Assigned staff and roles
- Time Tracking: Hours logged by team
- Documents: Photos, plans, certificates
- Activity Log: Complete audit trail

**Quick Actions:**

- Update status
- Add tasks
- Assign team members
- Log time
- Upload documents

### Task Breakdown

**Creating Tasks within Jobs:**

1. **Navigate**: Job Details → Add Task
2. **Task Information**:
   - Task title and description
   - Estimated hours
   - Due date
   - Priority level
3. **Assignment**: Select team members
4. **Dependencies**: Link to other tasks if needed

**Task Status Flow:**

```
Pending → In Progress → Completed
                    ↓
                 Blocked
```

## Task Management

### Task Views

**List View**: Tabular display with filters
**Kanban Board**: Visual workflow management
**Calendar View**: Due date visualization
**My Tasks**: Personal task dashboard

### Task Filters

- Status: Pending, In Progress, Completed, Blocked
- Priority: Low, Medium, High, Urgent
- Assigned To: Filter by team member
- Due Date: Today, This Week, Overdue
- Job: Filter by specific project

### Task Assignment

**Assignment Methods:**

1. **During Creation**: Assign when creating tasks
2. **Bulk Assignment**: Select multiple tasks and assign
3. **Drag & Drop**: Visual assignment in kanban view

**Assignment Considerations:**

- Skills and qualifications
- Current workload
- Availability
- Location and travel requirements

### Task Updates

**Status Updates:**

- Mark tasks as started, completed, or blocked
- Add progress notes and comments
- Upload photos and documentation
- Log time spent

**Collaboration:**

- @mention team members in comments
- Real-time notifications
- Activity timeline

## Time Tracking

### Time Entry Methods

1. **Timer-Based**: Start/stop timers for real-time tracking
2. **Manual Entry**: Add time after work completion
3. **Bulk Entry**: Add multiple time entries at once

### Starting a Timer

1. **Navigate**: Tasks → Select Task → Start Timer
2. **Work Description**: Brief description of work
3. **Billable Status**: Mark as billable or non-billable
4. **Timer Control**: Start, pause, stop

### Manual Time Entry

1. **Navigate**: Time Tracking → Add Entry
2. **Entry Details**:
   - Job and task selection
   - Start and end times
   - Work description
   - Billable status
3. **Submit**: Save time entry

### Time Approvals

**Manager Review Process:**

1. **Review Queue**: View submitted time entries
2. **Validation**: Verify accuracy and completeness
3. **Approval**: Approve for billing
4. **Adjustments**: Make corrections if needed

### Time Reports

- Individual timesheets
- Project time summaries
- Billable vs non-billable analysis
- Productivity metrics

## Proposals & Quotes

### Creating Proposals

1. **Navigate**: Leads/Jobs → Create Proposal
2. **Proposal Details**:
   - Title and description
   - Valid until date
   - Terms and conditions
3. **Line Items**:
   - Service descriptions
   - Quantities and rates
   - Material costs
   - Labor hours
4. **Pricing**:
   - Subtotal calculation
   - Tax amounts
   - Total pricing

### Proposal Templates

**Pre-defined Templates:**

- Electrical installation
- Maintenance services
- Emergency repairs
- Custom projects

**Template Benefits:**

- Consistent pricing
- Faster proposal creation
- Standardized terms
- Professional presentation

### Sending Proposals

**Delivery Methods:**

- Email with PDF attachment
- Client portal access
- Printed copy

**Proposal Tracking:**

- Sent date and time
- Client view tracking
- Response notifications
- Follow-up reminders

### Proposal Management

**Status Tracking:**

- Draft: Still being prepared
- Sent: Delivered to client
- Viewed: Client has opened proposal
- Accepted: Client accepted terms
- Rejected: Client declined
- Expired: Proposal validity expired

**Version Control:**

- Revision tracking
- Change history
- Client comparison view

## Invoicing & Billing

### Invoice Creation

**Two Creation Methods:**

1. **From Completed Jobs**: Automatic generation
2. **Manual Creation**: Custom invoices

**Job-Based Invoice Process:**

1. **Job Completion**: Mark job as completed
2. **Time Validation**: Ensure all time is logged
3. **Cost Calculation**: System calculates total costs
4. **Invoice Generation**: Create invoice from job data
5. **Review & Send**: Verify details and deliver

### Invoice Details

**Standard Information:**

- Invoice number (auto-generated)
- Client billing information
- Job reference
- Service dates
- Line item breakdown
- Tax calculations
- Payment terms

**Line Items Include:**

- Labor hours and rates
- Material costs
- Equipment charges
- Travel expenses
- Additional fees

### Payment Tracking

**Payment Status:**

- Draft: Not yet sent
- Sent: Delivered to client
- Paid: Payment received
- Overdue: Past due date
- Cancelled: Invoice cancelled

**Payment Recording:**

1. **Navigate**: Invoice → Record Payment
2. **Payment Details**:
   - Amount received
   - Payment date
   - Payment method
   - Reference number
3. **Update Status**: Automatically updates invoice status

### Invoice Reports

- Outstanding invoices
- Payment history
- Revenue by period
- Client payment patterns
- Aging reports

## Client Management

### Client Information

**Business Clients:**

- Company name and ABN
- Business address
- Industry type
- Key contacts
- Billing preferences

**Residential Clients:**

- Full name
- Property address
- Contact preferences
- Service history

### Client Sites

**Multiple Properties:**

- Site names and addresses
- GPS coordinates
- Access instructions
- Site-specific notes
- Property type

**Site Benefits:**

- Accurate job location
- Navigation assistance
- Access planning
- Historical service records

### Client Communication

**Communication History:**

- Email correspondence
- Phone call logs
- Meeting notes
- Proposal submissions
- Invoice delivery

**Contact Management:**

- Primary contacts
- Emergency contacts
- Decision makers
- Technical contacts

### Client Reports

- Service history by client
- Revenue per client
- Client satisfaction metrics
- Payment history

## Reports & Analytics

### Dashboard Analytics

**Real-Time Metrics:**

- Active job count
- Pending task count
- Monthly revenue
- Team utilization rates

**Performance Trends:**

- Revenue growth
- Job completion rates
- Customer satisfaction
- Team productivity

### Financial Reports

**Revenue Analysis:**

- Monthly revenue trends
- Revenue by client
- Revenue by service type
- Profit margin analysis

**Cost Analysis:**

- Labor costs
- Material expenses
- Overhead allocation
- Project profitability

### Operational Reports

**Job Performance:**

- Completion times
- Budget vs actual
- Resource utilization
- Quality metrics

**Team Performance:**

- Individual productivity
- Billable hour ratios
- Task completion rates
- Overtime analysis

### Custom Reports

**Report Builder:**

- Select data sources
- Choose date ranges
- Apply filters
- Format output

**Export Options:**

- PDF format
- Excel spreadsheet
- CSV data
- Email delivery

## Mobile Interface

### Mobile Optimization

The Aluma mobile interface is optimized for field workers using smartphones and tablets.

**Key Features:**

- Touch-friendly interface
- Simplified navigation
- Quick actions
- Offline capability (basic features)

### Mobile Task Management

**Task Dashboard:**

- Today's tasks
- Priority indicators
- Quick status updates
- Swipe gestures

**Task Details:**

- Job information
- Client contact details
- Site access notes
- Material requirements

### Mobile Time Tracking

**Timer Features:**

- One-tap start/stop
- Background timing
- Pause functionality
- Automatic sync

**Quick Entry:**

- Recent tasks
- Common descriptions
- Voice notes (future feature)
- Photo attachments

### Mobile Job Access

**Job Information:**

- Client details
- Site location and directions
- Scope of work
- Team assignments
- Emergency contacts

**Documentation:**

- Photo uploads
- Progress notes
- Completion verification
- Customer signatures (future)

## Settings & Administration

### User Management (Admin Only)

**Adding Users:**

1. **Navigate**: Settings → Users → Invite User
2. **User Details**:
   - Full name and email
   - Role assignment
   - Initial password
3. **Send Invitation**: Email invitation to user

**Role Management:**

- Change user roles
- Activate/deactivate accounts
- Reset passwords
- Audit user activity

### System Configuration

**Company Settings:**

- Company name and details
- Logo and branding
- Contact information
- Business hours

**Email Configuration:**

- Email templates
- Notification settings
- SMTP configuration
- Delivery preferences

**Integration Settings:**

- Accounting software connections
- Third-party API keys
- Webhook configurations
- Data synchronization

### Security Settings

**Password Policies:**

- Minimum length requirements
- Complexity requirements
- Expiration policies
- History restrictions

**Access Controls:**

- IP address restrictions
- Session timeout settings
- Two-factor authentication
- Login attempt limits

### Backup & Maintenance

**Data Backup:**

- Automated daily backups
- Manual backup triggers
- Backup verification
- Restore procedures

**System Maintenance:**

- Database optimization
- Performance monitoring
- Update scheduling
- Maintenance windows

## Troubleshooting

### Common Issues

**Login Problems:**

- Verify credentials
- Check email for reset link
- Clear browser cache
- Contact administrator

**Performance Issues:**

- Check internet connection
- Close unnecessary browser tabs
- Clear browser cache
- Try different browser

**Data Sync Issues:**

- Refresh page
- Check connection status
- Wait for automatic sync
- Contact support

**Mobile App Issues:**

- Update app version
- Restart device
- Check data connection
- Clear app cache

### Getting Help

**Built-in Help:**

- Tooltips and hints
- Help links in interface
- Video tutorials
- FAQ section

**Support Channels:**

- Email support
- Live chat (if available)
- Phone support
- User community

### Feature Requests

**Submitting Requests:**

1. Navigate to Help → Feature Request
2. Describe the requested feature
3. Explain business benefit
4. Submit for review

**Request Tracking:**

- View submission status
- Receive update notifications
- Participate in discussions
- Beta testing opportunities

## Best Practices

### Data Entry

- **Consistent Naming**: Use standardized naming conventions
- **Complete Information**: Fill all relevant fields
- **Regular Updates**: Keep information current
- **Quality Control**: Review entries for accuracy

### Project Management

- **Clear Scope**: Define work scope precisely
- **Realistic Estimates**: Use historical data for estimates
- **Regular Communication**: Maintain client communication
- **Documentation**: Keep thorough records

### Time Management

- **Accurate Logging**: Record time as work is performed
- **Detailed Descriptions**: Provide clear work descriptions
- **Prompt Submission**: Submit timesheets regularly
- **Review Process**: Validate time entries before approval

### Client Relations

- **Professional Communication**: Maintain professional tone
- **Timely Responses**: Respond to client inquiries promptly
- **Quality Service**: Exceed client expectations
- **Follow-up**: Ensure client satisfaction

---

For additional help or questions not covered in this guide, please contact your system administrator or the Aluma support team.
