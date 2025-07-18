# Aluma Component Library

A comprehensive guide to the reusable components in the Aluma Trade Services Management Platform.

## Overview

Aluma's component library is built on top of [shadcn/ui](https://ui.shadcn.com/) and follows atomic design principles. Components are organized into:

- **Atoms** - Basic building blocks (Button, Input, Badge)
- **Molecules** - Simple component combinations (SearchInput, StatusBadge)
- **Organisms** - Complex UI sections (Sidebar, TaskCard, Dashboard)
- **Templates** - Page-level layouts
- **Pages** - Complete page implementations

## Base UI Components

### Button

A versatile button component with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui/button';

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Link</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// With icons
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Add New
</Button>
```

**Props:**

```typescript
interface ButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}
```

### Card

Container component for grouping related content.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Job Details</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Job content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Edit Job</Button>
  </CardFooter>
</Card>;
```

### Badge

Small status or label indicators.

```tsx
import { Badge } from '@/components/ui/badge';

<Badge>In Progress</Badge>
<Badge variant="destructive">Overdue</Badge>
<Badge variant="outline">Pending</Badge>
```

### Input

Form input component with validation support.

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="space-y-2">
  <Label htmlFor="client-name">Client Name</Label>
  <Input
    id="client-name"
    placeholder="Enter client name"
    value={clientName}
    onChange={(e) => setClientName(e.target.value)}
  />
</div>;
```

### Select

Dropdown selection component.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

<Select value={status} onValueChange={setStatus}>
  <SelectTrigger>
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="pending">Pending</SelectItem>
    <SelectItem value="in_progress">In Progress</SelectItem>
    <SelectItem value="completed">Completed</SelectItem>
  </SelectContent>
</Select>;
```

### Dialog

Modal dialog component.

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create New Task</DialogTitle>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>;
```

## Business Components

### ModernSidebar

Main navigation sidebar with role-based menu items.

```tsx
import ModernSidebar from "@/components/ModernSidebar";

<ModernSidebar currentUser={user} onSignOut={handleSignOut} />;
```

**Features:**

- Role-based navigation filtering
- Collapsible design
- Active route highlighting
- User profile section
- Sign out functionality

**Props:**

```typescript
interface ModernSidebarProps {
  currentUser: User | null;
  onSignOut: () => void;
}
```

### DashboardWidgets

Collection of dashboard KPI widgets.

```tsx
import DashboardWidgets from "@/components/DashboardWidgets";

<DashboardWidgets
  kpis={{
    activeJobs: 12,
    pendingTasks: 45,
    monthlyRevenue: 125000,
    teamUtilization: 78.5,
  }}
  loading={false}
/>;
```

**Features:**

- Real-time KPI display
- Loading states
- Responsive grid layout
- Interactive charts
- Color-coded metrics

### TaskManager

Comprehensive task management interface.

```tsx
import TaskManager from "@/components/TaskManager";

<TaskManager
  jobId="job-uuid"
  userRole="technician"
  onTaskUpdate={handleTaskUpdate}
/>;
```

**Features:**

- Task listing and filtering
- Status updates
- Time tracking integration
- Assignment management
- Progress visualization

### QuickTaskForm

Streamlined form for rapid task creation.

```tsx
import QuickTaskForm from "@/components/QuickTaskForm";

<QuickTaskForm
  jobId="job-uuid"
  onSuccess={handleTaskCreated}
  onCancel={handleCancel}
/>;
```

**Features:**

- Minimal required fields
- Auto-completion
- Quick assignment
- Validation feedback

### EnhancedMobileTaskInterface

Mobile-optimized task interface for field workers.

```tsx
import EnhancedMobileTaskInterface from "@/components/EnhancedMobileTaskInterface";

<EnhancedMobileTaskInterface
  userId="user-uuid"
  onTaskComplete={handleTaskComplete}
/>;
```

**Features:**

- Touch-friendly interface
- Swipe gestures
- Voice notes (future)
- Photo attachments (future)
- Offline capability

### RoleBasedAccess

Higher-order component for access control.

```tsx
import RoleBasedAccess from "@/components/RoleBasedAccess";

<RoleBasedAccess requiredRole="admin" fallback={<AccessDenied />}>
  <AdminPanel />
</RoleBasedAccess>;
```

**Props:**

```typescript
interface RoleBasedAccessProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  fallback?: React.ReactNode;
}
```

## Form Components

### TaskCreationForm

Complete form for creating detailed tasks.

```tsx
import TaskCreationForm from "@/components/TaskCreationForm";

<TaskCreationForm
  jobId="job-uuid"
  categories={categories}
  tags={tags}
  onSuccess={handleSuccess}
  onCancel={handleCancel}
/>;
```

**Features:**

- Rich text description
- Category and tag selection
- Due date picker
- Priority selection
- Assignment interface
- Estimated hours input

### ClientForm

Form for creating and editing clients.

```tsx
import ClientForm from "@/components/ClientForm";

<ClientForm
  client={existingClient} // Optional for editing
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>;
```

### JobForm

Comprehensive job creation and editing form.

```tsx
import JobForm from "@/components/JobForm";

<JobForm
  job={existingJob} // Optional for editing
  clients={clients}
  sites={sites}
  users={users}
  onSubmit={handleSubmit}
/>;
```

## Data Display Components

### JobCard

Card component for displaying job information.

```tsx
import JobCard from "@/components/JobCard";

<JobCard
  job={job}
  onClick={handleJobClick}
  showAssignments={true}
  showProgress={true}
/>;
```

**Features:**

- Job status visualization
- Progress indicators
- Assignment display
- Action buttons
- Responsive design

### TaskCard

Individual task display component.

```tsx
import TaskCard from "@/components/TaskCard";

<TaskCard
  task={task}
  showJob={true}
  onStatusChange={handleStatusChange}
  onEdit={handleEdit}
/>;
```

### StatusBadge

Colored badge for status indication.

```tsx
import StatusBadge from '@/components/StatusBadge';

<StatusBadge status="in_progress" type="job" />
<StatusBadge status="overdue" type="task" />
```

**Props:**

```typescript
interface StatusBadgeProps {
  status: string;
  type: "job" | "task" | "lead" | "invoice";
  size?: "sm" | "md" | "lg";
}
```

### PriorityIndicator

Visual priority level indicator.

```tsx
import PriorityIndicator from '@/components/PriorityIndicator';

<PriorityIndicator priority="high" />
<PriorityIndicator priority="urgent" showLabel={true} />
```

## Layout Components

### PageHeader

Standardized page header with breadcrumbs and actions.

```tsx
import PageHeader from "@/components/PageHeader";

<PageHeader
  title="Job Management"
  subtitle="Track and manage all active jobs"
  breadcrumbs={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Jobs", href: "/jobs" },
  ]}
  actions={
    <Button onClick={handleCreateJob}>
      <Plus className="h-4 w-4 mr-2" />
      New Job
    </Button>
  }
/>;
```

### ContentLayout

Main content wrapper with consistent spacing.

```tsx
import ContentLayout from "@/components/ContentLayout";

<ContentLayout>
  <PageHeader title="Dashboard" />
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* Content */}
  </div>
</ContentLayout>;
```

### FilterBar

Horizontal filter interface for lists.

```tsx
import FilterBar from "@/components/FilterBar";

<FilterBar
  filters={[
    {
      key: "status",
      label: "Status",
      options: statusOptions,
      value: statusFilter,
      onChange: setStatusFilter,
    },
    {
      key: "priority",
      label: "Priority",
      options: priorityOptions,
      value: priorityFilter,
      onChange: setPriorityFilter,
    },
  ]}
  onReset={handleResetFilters}
/>;
```

## Utility Components

### LoadingSpinner

Consistent loading indicator.

```tsx
import LoadingSpinner from "@/components/LoadingSpinner";

<LoadingSpinner size="lg" text="Loading jobs..." />;
```

### EmptyState

Component for empty data states.

```tsx
import EmptyState from "@/components/EmptyState";

<EmptyState
  icon={<Briefcase />}
  title="No jobs found"
  description="Get started by creating your first job"
  action={<Button onClick={handleCreateJob}>Create Job</Button>}
/>;
```

### ErrorBoundary

Error boundary for graceful error handling.

```tsx
import ErrorBoundary from "@/components/ErrorBoundary";

<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>;
```

### ConfirmDialog

Confirmation dialog for destructive actions.

```tsx
import ConfirmDialog from "@/components/ConfirmDialog";

<ConfirmDialog
  open={showDeleteConfirm}
  title="Delete Job"
  description="Are you sure you want to delete this job? This action cannot be undone."
  onConfirm={handleDelete}
  onCancel={() => setShowDeleteConfirm(false)}
  variant="destructive"
/>;
```

## Chart Components

### ProgressChart

Visual progress indicator for jobs and tasks.

```tsx
import ProgressChart from "@/components/ProgressChart";

<ProgressChart
  completed={75}
  total={100}
  label="Job Progress"
  showPercentage={true}
/>;
```

### RevenueChart

Revenue visualization component.

```tsx
import RevenueChart from "@/components/RevenueChart";

<RevenueChart data={monthlyRevenue} period="monthly" currency="AUD" />;
```

## Mobile Components

### MobileNavigation

Bottom navigation for mobile devices.

```tsx
import MobileNavigation from "@/components/MobileNavigation";

<MobileNavigation currentUser={user} activeRoute="/tasks" />;
```

### SwipeableTaskCard

Mobile task card with swipe actions.

```tsx
import SwipeableTaskCard from "@/components/SwipeableTaskCard";

<SwipeableTaskCard
  task={task}
  onSwipeLeft={handleComplete}
  onSwipeRight={handleEdit}
/>;
```

## Styling Guidelines

### Theme Variables

Components use CSS custom properties for theming:

```css
:root {
  --primary: 220 90% 56%;
  --primary-foreground: 220 26% 14%;
  --secondary: 220 14.3% 95.9%;
  --secondary-foreground: 220 26% 14%;
  --muted: 220 14.3% 95.9%;
  --muted-foreground: 220 26% 14%;
  --accent: 220 14.3% 95.9%;
  --accent-foreground: 220 26% 14%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 20% 98%;
  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 220 90% 56%;
  --radius: 0.5rem;
}
```

### Component Classes

Standard utility classes used throughout:

```css
/* Card hover effect */
.card-hover {
  @apply transition-all duration-200 hover:shadow-md hover:-translate-y-1;
}

/* Status colors */
.status-pending {
  @apply bg-yellow-100 text-yellow-800;
}
.status-in-progress {
  @apply bg-blue-100 text-blue-800;
}
.status-completed {
  @apply bg-green-100 text-green-800;
}
.status-blocked {
  @apply bg-red-100 text-red-800;
}

/* Priority indicators */
.priority-low {
  @apply border-l-4 border-gray-400;
}
.priority-medium {
  @apply border-l-4 border-yellow-400;
}
.priority-high {
  @apply border-l-4 border-orange-400;
}
.priority-urgent {
  @apply border-l-4 border-red-400;
}
```

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- **Semantic HTML** - Proper heading structure and landmarks
- **Keyboard Navigation** - Full keyboard accessibility
- **Screen Reader Support** - ARIA labels and descriptions
- **Color Contrast** - Minimum 4.5:1 contrast ratio
- **Focus Management** - Visible focus indicators

### Example Implementation

```tsx
<button
  aria-label="Complete task"
  aria-describedby="task-description"
  className="focus:ring-2 focus:ring-primary focus:outline-none"
  onClick={handleComplete}
>
  <Check className="h-4 w-4" />
  <span className="sr-only">Mark as complete</span>
</button>
```

## Testing

### Component Testing

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  it("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Storybook Stories

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Button",
    variant: "default",
  },
};

export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
  },
};
```

## Contributing

### Creating New Components

1. **Component Structure**

   ```
   components/
   ├── ui/               # Base UI components
   ├── business/         # Business logic components
   ├── forms/           # Form components
   ├── charts/          # Data visualization
   └── layout/          # Layout components
   ```

2. **Component Template**

   ```tsx
   interface ComponentProps {
     // Props definition
   }

   export default function Component({ ...props }: ComponentProps) {
     // Component implementation
   }
   ```

3. **Documentation Requirements**
   - PropTypes/TypeScript interfaces
   - Usage examples
   - Accessibility notes
   - Testing coverage

### Style Guidelines

- Use Tailwind CSS utilities
- Follow mobile-first responsive design
- Implement proper focus states
- Include hover and active states
- Use semantic color classes

---

For questions about components or to request new components, contact the development team or create an issue in the repository.
