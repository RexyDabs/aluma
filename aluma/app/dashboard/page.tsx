"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import {
  getCurrentUser,
  getUserPermissions,
  getUserAssignedJobs,
  getUserAssignedTasks,
} from "../../lib/auth";
import type { User } from "../../lib/auth";
import {
  KPICard,
  QuickActionsGrid,
  ActivityFeed,
  AlertsWidget,
  ScheduleWidget,
} from "../../components/DashboardWidgets";
import QuickTaskForm from "../../components/QuickTaskForm";
import { Button } from "../../components/ui/button";
import { Plus, TrendingUp } from "lucide-react";
import {
  PersonIcon,
  CheckCircledIcon,
  ClockIcon,
  DashboardIcon,
  TargetIcon,
  GearIcon,
  CalendarIcon,
  FileTextIcon,
  PlusCircledIcon,
  ClipboardIcon,
} from "@radix-ui/react-icons";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>({});
  const [showQuickTaskModal, setShowQuickTaskModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function initializeDashboard() {
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (user) {
        const permissions = getUserPermissions(user.role);
        setUserPermissions(permissions);

        // Fetch dashboard data based on user role
        await fetchDashboardData(user, permissions);
      }

      setLoading(false);
    }

    initializeDashboard();
  }, []);

  function handleTaskCreated(taskId: string) {
    // Optionally refresh dashboard data or show success message
    console.log("Task created with ID:", taskId);
    // Could add a toast notification here
  }

  async function fetchDashboardData(user: User, permissions: any) {
    try {
      const data: any = {
        kpis: {
          totalLeads: 0,
          activeJobs: 0,
          completedTasks: 0,
          revenue: 0,
        },
        activities: [],
        alerts: [],
        schedule: [],
      };

      // Fetch KPIs based on permissions
      if (permissions.canViewAllLeads) {
        const { data: leads } = await supabase.from("leads").select("*");
        data.kpis.totalLeads = leads?.length || 0;
      }

      if (permissions.canViewAllJobs) {
        const { data: jobs } = await supabase
          .from("jobs")
          .select("*")
          .eq("status", "active");
        data.kpis.activeJobs = jobs?.length || 0;
      } else {
        // For field workers, get assigned jobs
        const assignedJobs = await getUserAssignedJobs(user.id);
        data.kpis.activeJobs = assignedJobs.length;
      }

      if (permissions.canViewAllTasks) {
        const { data: tasks } = await supabase
          .from("global_tasks")
          .select("*")
          .eq("status", "completed");
        data.kpis.completedTasks = tasks?.length || 0;
      } else {
        // For field workers, get assigned tasks
        const assignedTasks = await getUserAssignedTasks(user.id);
        data.kpis.completedTasks = assignedTasks.filter(
          (t) => t.status === "completed",
        ).length;
      }

      // Sample activities (replace with real data)
      data.activities = [
        {
          id: "1",
          type: "job",
          title: "New job assigned",
          description: "Kitchen renovation at Smith residence",
          time: "2 hours ago",
          status: "Active",
        },
        {
          id: "2",
          type: "lead",
          title: "Lead converted",
          description: "John Doe signed proposal for bathroom remodel",
          time: "4 hours ago",
          status: "Won",
        },
        {
          id: "3",
          type: "task",
          title: "Task completed",
          description: "Plumbing installation finished",
          time: "1 day ago",
          status: "Completed",
        },
      ];

      // Sample alerts
      data.alerts = [
        {
          id: "1",
          type: "warning",
          title: "Overdue Tasks",
          message: "You have 3 tasks that are past their due date",
        },
        {
          id: "2",
          type: "info",
          title: "Schedule Update",
          message: "Tomorrow's job at Oak Street has been rescheduled",
        },
      ];

      // Sample schedule
      data.schedule = [
        {
          id: "1",
          title: "Kitchen Installation",
          time: "9:00 AM",
          type: "Job Site Visit",
        },
        {
          id: "2",
          title: "Client Meeting",
          time: "2:00 PM",
          type: "Proposal Review",
        },
        {
          id: "3",
          title: "Material Pickup",
          time: "4:30 PM",
          type: "Supply Run",
        },
      ];

      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-white rounded-lg shadow-sm animate-pulse"
            ></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-64 bg-white rounded-lg shadow-sm animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view the dashboard.</p>
      </div>
    );
  }

  const isFieldWorker = ["technician", "subcontractor", "staff"].includes(
    currentUser.role,
  );
  const isManager = ["admin", "manager"].includes(currentUser.role);

  // Role-based KPIs
  const getKPIs = () => {
    if (isFieldWorker) {
      return [
        {
          title: "Active Jobs",
          value: dashboardData.kpis?.activeJobs || 0,
          icon: <GearIcon className="h-6 w-6" />,
          color: "blue" as const,
          change: { value: 12, type: "increase" as const, period: "this week" },
        },
        {
          title: "Tasks Today",
          value: dashboardData.schedule?.length || 0,
          icon: <CheckCircledIcon className="h-6 w-6" />,
          color: "green" as const,
          change: {
            value: 8,
            type: "increase" as const,
            period: "vs yesterday",
          },
        },
        {
          title: "Hours Logged",
          value: "32.5",
          icon: <ClockIcon className="h-6 w-6" />,
          color: "purple" as const,
          change: { value: 5, type: "increase" as const, period: "this week" },
        },
        {
          title: "Completion Rate",
          value: "94%",
          icon: <TrendingUp className="h-6 w-6" />,
          color: "orange" as const,
          change: { value: 2, type: "increase" as const, period: "this month" },
        },
      ];
    }

    return [
      {
        title: "Total Leads",
        value: dashboardData.kpis?.totalLeads || 0,
        icon: <TargetIcon className="h-6 w-6" />,
        color: "blue" as const,
        change: { value: 15, type: "increase" as const, period: "this month" },
      },
      {
        title: "Active Jobs",
        value: dashboardData.kpis?.activeJobs || 0,
        icon: <GearIcon className="h-6 w-6" />,
        color: "green" as const,
        change: { value: 8, type: "increase" as const, period: "this week" },
      },
      {
        title: "Revenue (MTD)",
        value: "$24,500",
        icon: <PersonIcon className="h-6 w-6" />,
        color: "purple" as const,
        change: {
          value: 22,
          type: "increase" as const,
          period: "vs last month",
        },
      },
      {
        title: "Team Members",
        value: 12,
        icon: <PersonIcon className="h-6 w-6" />,
        color: "orange" as const,
        change: { value: 2, type: "increase" as const, period: "new hires" },
      },
    ];
  };

  // Role-based quick actions
  const getQuickActions = () => {
    if (isFieldWorker) {
      return [
        {
          title: "Check In",
          description: "Start your workday",
          icon: <ClockIcon className="h-5 w-5" />,
          onClick: () => router.push("/time-tracking"),
          color: "from-green-500 to-green-600",
        },
        {
          title: "View Tasks",
          description: "See today's assignments",
          icon: <ClipboardIcon className="h-5 w-5" />,
          onClick: () => router.push("/global-tasks"),
          color: "from-blue-500 to-blue-600",
        },
        {
          title: "Quick Task",
          description: "Create a new task quickly",
          icon: <Plus className="h-5 w-5" />,
          onClick: () => setShowQuickTaskModal(true),
          color: "from-emerald-500 to-emerald-600",
        },
        {
          title: "Report Issue",
          description: "Log a problem or delay",
          icon: <FileTextIcon className="h-5 w-5" />,
          onClick: () => router.push("/issues"),
          color: "from-orange-500 to-orange-600",
        },
        {
          title: "Job Details",
          description: "View current job info",
          icon: <GearIcon className="h-5 w-5" />,
          onClick: () => router.push("/jobs"),
          color: "from-purple-500 to-purple-600",
        },
      ];
    }

    return [
      {
        title: "New Lead",
        description: "Add a potential client",
        icon: <Plus className="h-5 w-5" />,
        onClick: () => router.push("/leads"),
        color: "from-blue-500 to-blue-600",
      },
      {
        title: "Create Job",
        description: "Start a new project",
        icon: <GearIcon className="h-5 w-5" />,
        onClick: () => router.push("/jobs"),
        color: "from-green-500 to-green-600",
      },
      {
        title: "Add User",
        description: "Invite team member",
        icon: <PlusCircledIcon className="h-5 w-5" />,
        onClick: () => router.push("/users"),
        color: "from-purple-500 to-purple-600",
      },
      {
        title: "Analytics",
        description: "View business insights",
        icon: <TrendingUp className="h-5 w-5" />,
        onClick: () => router.push("/analytics"),
        color: "from-indigo-500 to-indigo-600",
      },
      {
        title: "Generate Report",
        description: "Create performance report",
        icon: <FileTextIcon className="h-5 w-5" />,
        onClick: () => router.push("/reports"),
        color: "from-orange-500 to-orange-600",
      },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {currentUser.full_name}!
        </h1>
        <p className="text-gray-600">
          {isFieldWorker
            ? "Ready to tackle today's tasks? Here's your field overview."
            : "Here's what's happening with your business today."}
        </p>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => setShowQuickTaskModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Quick Task
        </Button>
        <Button variant="outline" onClick={() => router.push("/global-tasks")}>
          View All Tasks
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getKPIs().map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions and Schedule */}
        <div className="space-y-6">
          <QuickActionsGrid actions={getQuickActions()} />
          <ScheduleWidget todayTasks={dashboardData.schedule || []} />
        </div>

        {/* Middle Column - Activity Feed */}
        <div>
          <ActivityFeed activities={dashboardData.activities || []} />
        </div>

        {/* Right Column - Alerts */}
        <div>
          <AlertsWidget alerts={dashboardData.alerts || []} />
        </div>
      </div>

      {/* Additional Analytics for Managers */}
      {isManager && (
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">89%</div>
                <div className="text-sm text-gray-600">Jobs On Time</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">$145K</div>
                <div className="text-sm text-gray-600">Monthly Revenue</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">4.8★</div>
                <div className="text-sm text-gray-600">Customer Rating</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Task Creation Modal */}
      <QuickTaskForm
        isOpen={showQuickTaskModal}
        onClose={() => setShowQuickTaskModal(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
