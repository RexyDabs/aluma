import { supabase } from "./supabase";

export interface User {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
  role?: Role;
}

// Role-based permissions
export const rolePermissions = {
  admin: {
    canManageUsers: true,
    canViewAllLeads: true,
    canViewAllJobs: true,
    canViewAllTasks: true,
    canViewFinancialReports: true,
    canManageSystemSettings: true,
    canAssignJobs: true,
    canCreateProposals: true,
    canManageInvoices: true,
  },
  manager: {
    canManageUsers: false,
    canViewAllLeads: true,
    canViewAllJobs: true,
    canViewAllTasks: true,
    canViewFinancialReports: false,
    canManageSystemSettings: false,
    canAssignJobs: true,
    canCreateProposals: true,
    canManageInvoices: false,
  },
  technician: {
    canManageUsers: false,
    canViewAllLeads: false,
    canViewAllJobs: false,
    canViewAllTasks: false,
    canViewFinancialReports: false,
    canManageSystemSettings: false,
    canAssignJobs: false,
    canCreateProposals: false,
    canManageInvoices: false,
  },
  subcontractor: {
    canManageUsers: false,
    canViewAllLeads: false,
    canViewAllJobs: false,
    canViewAllTasks: false,
    canViewFinancialReports: false,
    canManageSystemSettings: false,
    canAssignJobs: false,
    canCreateProposals: false,
    canManageInvoices: false,
  },
  staff: {
    canManageUsers: false,
    canViewAllLeads: false,
    canViewAllJobs: false,
    canViewAllTasks: false,
    canViewFinancialReports: false,
    canManageSystemSettings: false,
    canAssignJobs: false,
    canCreateProposals: false,
    canManageInvoices: false,
  },
};

// Get current user from Supabase Auth
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Development bypass - check localStorage first
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      const devUser = localStorage.getItem("dev-user");
      if (devUser) {
        const parsedUser = JSON.parse(devUser);
        return {
          id: parsedUser.id,
          auth_user_id: parsedUser.id,
          full_name: parsedUser.full_name,
          email: parsedUser.email,
          phone: "",
          role: parsedUser.role,
          active: true,
          created_at: new Date().toISOString(),
        };
      }
    }

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return null;
    }

    // Get user details from our users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", authUser.id)
      .single();

    if (userError || !userData) {
      return null;
    }

    return userData;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Get user permissions based on role
export function getUserPermissions(role: string) {
  return (
    rolePermissions[role as keyof typeof rolePermissions] ||
    rolePermissions.staff
  );
}

// Check if user has specific permission
export function hasPermission(
  user: User | null,
  permission: keyof typeof rolePermissions.admin,
): boolean {
  if (!user || !user.active) return false;
  const permissions = getUserPermissions(user.role);
  return permissions[permission] || false;
}

// Get role-based filters for data queries
export function getRoleBasedFilters(user: User | null) {
  if (!user || !user.active) return {};

  const permissions = getUserPermissions(user.role);

  // If user can view all data, return empty filters
  if (
    permissions.canViewAllLeads &&
    permissions.canViewAllJobs &&
    permissions.canViewAllTasks
  ) {
    return {};
  }

  // Return filters based on user's role
  return {
    // For leads - only show if user has permission or is assigned
    leads: permissions.canViewAllLeads ? {} : { assigned_to: user.id },

    // For jobs - only show assigned jobs for technicians/subcontractors
    jobs: permissions.canViewAllJobs
      ? {}
      : {
          "job_assignments.user_id": user.id,
        },

    // For tasks - only show assigned tasks for technicians/subcontractors
    tasks: permissions.canViewAllTasks
      ? {}
      : {
          assigned_to: user.id,
        },

    // For proposals - only show if user can create/view all
    proposals: permissions.canCreateProposals
      ? {}
      : {
          created_by: user.id,
        },
  };
}

// Get navigation items based on user role
export function getNavigationItems(user: User | null) {
  if (!user || !user.active) return [];

  const permissions = getUserPermissions(user.role);

  const items = [
    { label: "Dashboard", href: "/dashboard", icon: "DashboardIcon" },
  ];

  const isFieldWorker = ["technician", "subcontractor", "staff"].includes(
    user.role,
  );

  // Field workers get focused navigation
  if (isFieldWorker) {
    items.push({
      label: "My Tasks",
      href: "/global-tasks",
      icon: "CheckboxIcon",
    });
    items.push({
      label: "Time Tracking",
      href: "/time-tracking",
      icon: "StopwatchIcon",
    });
  } else {
    // Office workers get management navigation
    if (permissions.canViewAllLeads) {
      items.push({ label: "Leads", href: "/leads", icon: "TargetIcon" });
    }

    if (permissions.canViewAllJobs) {
      items.push({ label: "Jobs", href: "/jobs", icon: "GearIcon" });
    }

    if (permissions.canViewAllTasks) {
      items.push({
        label: "Tasks",
        href: "/global-tasks",
        icon: "CheckboxIcon",
      });
    }
  }

  if (permissions.canCreateProposals) {
    items.push({
      label: "Proposals",
      href: "/proposals",
      icon: "FileTextIcon",
    });
  }

  if (permissions.canManageInvoices) {
    items.push({ label: "Invoices", href: "/invoices", icon: "FileTextIcon" });
  }

  if (permissions.canViewFinancialReports) {
    items.push({ label: "Reports", href: "/reports", icon: "FileTextIcon" });
  }

  if (permissions.canManageUsers) {
    items.push({ label: "Users", href: "/users", icon: "PersonIcon" });
  }

  return items;
}

// Check if user can access a specific page
export function canAccessPage(user: User | null, page: string): boolean {
  if (!user || !user.active) return false;

  const permissions = getUserPermissions(user.role);

  const isFieldWorker = ["technician", "subcontractor", "staff"].includes(
    user.role,
  );

  switch (page) {
    case "/dashboard":
      return true;
    case "/time-tracking":
      return isFieldWorker; // Only field workers can access time tracking
    case "/global-tasks":
      return permissions.canViewAllTasks || isFieldWorker; // Field workers can see their tasks
    case "/leads":
      return permissions.canViewAllLeads;
    case "/jobs":
      return permissions.canViewAllJobs;
    case "/proposals":
      return permissions.canCreateProposals;
    case "/invoices":
      return permissions.canManageInvoices;
    case "/reports":
      return permissions.canViewFinancialReports;
    case "/users":
      return permissions.canManageUsers;
    default:
      return false;
  }
}

// Get user's assigned jobs
export async function getUserAssignedJobs(userId: string) {
  try {
    const { data, error } = await supabase
      .from("job_assignments")
      .select(
        `
        *,
        job:jobs(*)
      `,
      )
      .eq("user_id", userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching user assigned jobs:", error);
    return [];
  }
}

// Get user's assigned tasks
export async function getUserAssignedTasks(userId: string) {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("assigned_to", userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching user assigned tasks:", error);
    return [];
  }
}
