# Role-Based Access Control (RBAC) System

This document describes the role-based access control system implemented in the Aluma SaaS application for tradies/sole traders.

## Overview

The RBAC system provides granular control over what users can see and do within the application based on their assigned roles. This ensures that technicians and subcontractors only see their assigned work, while managers and admins have broader access.

## User Roles

### 1. **Admin** 🔴
- **Full system access**
- Can manage all users and their roles
- Can view all leads, jobs, tasks, and financial data
- Can access system settings and reports
- Can create and manage invoices
- Can assign jobs to any user

**Permissions:**
- ✅ User management
- ✅ All leads access
- ✅ All jobs access
- ✅ All tasks access
- ✅ Financial reports
- ✅ System settings
- ✅ Job assignment
- ✅ Proposal creation
- ✅ Invoice management

### 2. **Manager** 🟣
- **Operational oversight**
- Can view all leads and jobs
- Can manage team assignments
- Can create proposals
- Cannot access financial reports or user management

**Permissions:**
- ❌ User management
- ✅ All leads access
- ✅ All jobs access
- ✅ All tasks access
- ❌ Financial reports
- ❌ System settings
- ✅ Job assignment
- ✅ Proposal creation
- ❌ Invoice management

### 3. **Technician** 🔵
- **Field work focus**
- Can only see assigned jobs and tasks
- Can log time and complete tasks
- Can view job reports for their assignments
- Cannot access leads or proposals

**Permissions:**
- ❌ User management
- ❌ All leads access
- ❌ All jobs access
- ❌ All tasks access
- ❌ Financial reports
- ❌ System settings
- ❌ Job assignment
- ❌ Proposal creation
- ❌ Invoice management

### 4. **Subcontractor** 🟠
- **Limited field access**
- Can only see assigned jobs and tasks
- Can log time and complete tasks
- Cannot access leads, proposals, or reports

**Permissions:**
- ❌ User management
- ❌ All leads access
- ❌ All jobs access
- ❌ All tasks access
- ❌ Financial reports
- ❌ System settings
- ❌ Job assignment
- ❌ Proposal creation
- ❌ Invoice management

### 5. **Staff** ⚪
- **Basic access**
- Minimal permissions for general staff
- Can only see assigned tasks
- Cannot access most system features

**Permissions:**
- ❌ User management
- ❌ All leads access
- ❌ All jobs access
- ❌ All tasks access
- ❌ Financial reports
- ❌ System settings
- ❌ Job assignment
- ❌ Proposal creation
- ❌ Invoice management

## Implementation Details

### Database Schema

The RBAC system uses the following tables:

```sql
-- Users table with role field
users (
  id: uuid,
  auth_user_id: uuid,  -- Links to Supabase Auth
  full_name: text,
  email: text,
  phone: text,
  role: text,          -- Current role
  active: boolean,
  created_at: timestamp
)

-- Roles table for role definitions
roles (
  id: uuid,
  name: text
)

-- User roles for many-to-many relationships
user_roles (
  id: uuid,
  user_id: uuid,
  role_id: uuid,
  assigned_at: timestamp
)

-- Job assignments linking users to jobs
job_assignments (
  id: uuid,
  job_id: uuid,
  user_id: uuid,
  assigned_role: text,
  assigned_at: timestamp
)
```

### Key Components

#### 1. **Authentication & Authorization (`lib/auth.ts`)**
- `getCurrentUser()`: Fetches current user from Supabase Auth
- `getUserPermissions()`: Returns permissions for a given role
- `hasPermission()`: Checks if user has specific permission
- `getRoleBasedFilters()`: Returns database filters based on user role
- `getNavigationItems()`: Returns navigation menu based on permissions
- `canAccessPage()`: Checks if user can access specific pages

#### 2. **Role-Based Navigation (`components/RoleBasedNavigation.tsx`)**
- Dynamic navigation menu based on user permissions
- Shows/hides menu items based on role
- Displays user info and role badge
- Handles sign out functionality

#### 3. **Access Control Wrapper (`components/RoleBasedAccess.tsx`)**
- Protects pages and components based on permissions
- Shows access denied page for unauthorized users
- Provides loading states and fallback content
- Higher-order component for easy page protection

#### 4. **User Management (`app/users/page.tsx`)**
- Admin-only page for managing users and roles
- Role assignment interface
- User status management (active/inactive)
- Role permissions overview

### Role-Based Data Filtering

The system automatically filters data based on user roles:

#### Leads
- **Admin/Manager**: See all leads
- **Technician/Subcontractor/Staff**: Only see assigned leads

#### Jobs
- **Admin/Manager**: See all jobs
- **Technician/Subcontractor**: Only see assigned jobs via `job_assignments`

#### Tasks
- **Admin/Manager**: See all tasks
- **Technician/Subcontractor/Staff**: Only see assigned tasks

#### Proposals
- **Admin/Manager**: See all proposals
- **Technician/Subcontractor/Staff**: Only see proposals they created

## Setup Instructions

### 1. Database Setup

Run the SQL script to create default roles:

```sql
-- Run in Supabase SQL Editor
INSERT INTO roles (id, name) VALUES 
  (gen_random_uuid(), 'admin'),
  (gen_random_uuid(), 'manager'),
  (gen_random_uuid(), 'technician'),
  (gen_random_uuid(), 'subcontractor'),
  (gen_random_uuid(), 'staff')
ON CONFLICT (name) DO NOTHING;
```

### 2. Create First Admin User

After setting up Supabase Auth, create your first admin user:

```sql
-- Replace with your actual auth user ID
INSERT INTO users (auth_user_id, full_name, email, role, active) VALUES 
  ('your-auth-user-id-here', 'Admin User', 'admin@example.com', 'admin', true);
```

### 3. Row Level Security (Optional)

For additional security, enable RLS policies in Supabase:

```sql
-- Enable RLS on tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

See `scripts/setup-roles.sql` for complete RLS policy examples.

## Usage Examples

### Protecting a Page

```tsx
// Protect entire page
export default function AdminPage() {
  return (
    <RoleBasedAccess requiredRole="admin">
      <AdminContent />
    </RoleBasedAccess>
  );
}

// Or use the HOC
const ProtectedAdminPage = withRoleAccess(AdminPage, undefined, 'admin');
```

### Checking Permissions in Components

```tsx
function MyComponent() {
  const { currentUser, hasAccess } = useRoleAccess('/admin');
  
  if (!hasAccess) {
    return <AccessDenied />;
  }
  
  return <AdminContent />;
}
```

### Role-Based Data Fetching

```tsx
// In your data fetching logic
const filters = getRoleBasedFilters(currentUser);
const leadsQuery = supabase
  .from('leads')
  .select('*')
  .or(`assigned_to.eq.${currentUser.id},created_by.eq.${currentUser.id}`);
```

## Security Considerations

1. **Always verify permissions server-side** - Client-side checks can be bypassed
2. **Use RLS policies** - Additional database-level security
3. **Regular role audits** - Review user permissions periodically
4. **Principle of least privilege** - Give users minimum required access
5. **Audit logging** - Track role changes and access attempts

## Extending the System

### Adding New Roles

1. Add role to `rolePermissions` in `lib/auth.ts`
2. Add role to database via SQL
3. Update role colors in components
4. Test permissions thoroughly

### Adding New Permissions

1. Add permission to `rolePermissions` interface
2. Update all role definitions
3. Add permission checks in components
4. Update navigation and access control

### Custom Role Logic

For complex permission logic, extend the `getUserPermissions()` function or create custom permission checkers.

## Troubleshooting

### Common Issues

1. **User not found**: Ensure user exists in both Auth and users table
2. **Permission denied**: Check role assignment and active status
3. **Data not showing**: Verify role-based filters are working
4. **Navigation issues**: Check `getNavigationItems()` logic

### Debug Mode

Enable debug logging by adding console logs to auth functions:

```tsx
console.log('Current user:', currentUser);
console.log('User permissions:', userPermissions);
console.log('Role-based filters:', getRoleBasedFilters(currentUser));
```

## Future Enhancements

- **Dynamic permissions**: Database-driven permission system
- **Role hierarchies**: Inherited permissions
- **Time-based access**: Temporary role assignments
- **Audit trails**: Detailed access logging
- **Permission groups**: Batch permission management
- **API rate limiting**: Role-based API quotas 