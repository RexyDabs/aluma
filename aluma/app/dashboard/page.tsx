"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
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
import {
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  Target,
  Wrench,
  Plus,
  Calendar,
  FileText,
  TrendingUp,
} from "lucide-react";

interface Lead {
  id: string;
  full_name: string;
  company: string;
  phone: string;
  email: string;
  current_status: string;
  created_at: string;
  source?: string;
}

interface LeadStatusLog {
  id: string;
  lead_id: string;
  status: string;
  changed_at: string;
}

interface LeadContact {
  id: string;
  lead_id: string;
  contact_type: string;
  contact_notes: string;
  created_at: string;
}

interface SourceCount {
  source: string;
  count: number;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-green-100 text-green-800",
  proposed: "bg-purple-100 text-purple-800",
  lost: "bg-red-100 text-red-800",
  won: "bg-emerald-100 text-emerald-800",
};

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800",
  manager: "bg-purple-100 text-purple-800",
  technician: "bg-blue-100 text-blue-800",
  subcontractor: "bg-orange-100 text-orange-800",
  staff: "bg-gray-100 text-gray-800",
};

const viewTypes = [
  { label: "Table", value: "table" },
  { label: "Cards", value: "cards" },
  { label: "Chart", value: "chart" },
];

const dateRanges = [
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "This Year", value: "this_year" },
  { label: "All Time", value: "all_time" },
];

function getDateRange(range: string) {
  const now = new Date();
  let start: Date | null = null;
  let end: Date | null = null;
  if (range === "this_month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (range === "last_month") {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (range === "this_year") {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else {
    start = null;
    end = null;
  }
  return { start, end };
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    async function initializeUser() {
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (user) {
        const permissions = getUserPermissions(user.role);
        setUserPermissions(permissions);

        // Fetch user-specific data if needed
        if (!permissions.canViewAllJobs) {
          const jobs = await getUserAssignedJobs(user.id);
          setAssignedJobs(jobs);
        }
        if (!permissions.canViewAllTasks) {
          const tasks = await getUserAssignedTasks(user.id);
          setAssignedTasks(tasks);
        }
      }
    }
    initializeUser();
  }, []);

  useEffect(() => {
    let leadsSub: any;
    async function fetchAll() {
      setLoading(true);
      setError(null);

      // Build query based on user permissions
      let leadsQuery = supabase
        .from("leads")
        .select(
          "id, full_name, company, phone, email, current_status, created_at, source",
        );

      // Apply role-based filtering
      if (currentUser && !userPermissions?.canViewAllLeads) {
        // For non-admin users, only show leads they're assigned to or created
        leadsQuery = leadsQuery.or(
          `assigned_to.eq.${currentUser.id},created_by.eq.${currentUser.id}`,
        );
      }

      const { data: leadsData, error: leadsError } = await leadsQuery;

      // Fetch all status logs (filtered by visible leads)
      const { data: statusLogData, error: statusLogError } = await supabase
        .from("lead_status_log")
        .select("*");

      // Fetch all contacts (filtered by visible leads)
      const { data: contactsData, error: contactsError } = await supabase
        .from("lead_contacts")
        .select("*");

      if (leadsError || statusLogError || contactsError) {
        setError(
          leadsError?.message ||
            statusLogError?.message ||
            contactsError?.message ||
            "Unknown error",
        );
        setLeads([]);
        setStatusLogs([]);
        setContacts([]);
      } else {
        setLeads(leadsData || []);
        setStatusLogs(statusLogData || []);
        setContacts(contactsData || []);
      }
      setLoading(false);
    }

    if (currentUser) {
      fetchAll();
      // Subscribe to real-time changes
      leadsSub = supabase
        .channel("leads-db-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "leads" },
          fetchAll,
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "lead_status_log" },
          fetchAll,
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "lead_contacts" },
          fetchAll,
        )
        .subscribe();
    }

    return () => {
      if (leadsSub) supabase.removeChannel(leadsSub);
    };
  }, [currentUser, userPermissions]);

  // Date range filter
  const { start, end } = getDateRange(dateRange);
  const leadsInRange = leads.filter((lead) => {
    if (!start || !end) return true;
    const created = new Date(lead.created_at);
    return created >= start && created <= end;
  });

  // Scoreboard stats
  const totalLeads = leadsInRange.length;
  const statusCounts = leadsInRange.reduce<Record<string, number>>(
    (acc, lead) => {
      acc[lead.current_status] = (acc[lead.current_status] || 0) + 1;
      return acc;
    },
    {},
  );
  const won = statusCounts["won"] || 0;
  const lost = statusCounts["lost"] || 0;
  const conversionRate = totalLeads ? Math.round((won / totalLeads) * 100) : 0;

  // Filtered leads
  const filteredLeads = statusFilter
    ? leadsInRange.filter((l) => l.current_status === statusFilter)
    : leadsInRange;

  // Source breakdown for leads in range
  const counts: Record<string, number> = {};
  leadsInRange.forEach((l: Lead) => {
    if (!l.source) return;
    counts[l.source] = (counts[l.source] || 0) + 1;
  });
  const filteredSourceCounts = Object.entries(counts).map(
    ([source, count]) => ({ source, count }),
  );
  const maxSourceCount = Math.max(
    ...filteredSourceCounts.map((s) => s.count),
    1,
  );

  // Action Items: follow-ups and overdue proposals
  const now = new Date();
  // Map for quick lookup
  const lastContactMap: Record<string, Date> = {};
  contacts.forEach((c) => {
    const d = new Date(c.created_at);
    if (!lastContactMap[c.lead_id] || d > lastContactMap[c.lead_id]) {
      lastContactMap[c.lead_id] = d;
    }
  });
  const lastStatusMap: Record<string, { status: string; changed_at: Date }> =
    {};
  statusLogs.forEach((s) => {
    const d = new Date(s.changed_at);
    if (!lastStatusMap[s.lead_id] || d > lastStatusMap[s.lead_id].changed_at) {
      lastStatusMap[s.lead_id] = { status: s.status, changed_at: d };
    }
  });
  // Follow-ups: no contact in 7+ days
  const followUps = leadsInRange.filter((lead) => {
    const lastContact = lastContactMap[lead.id];
    return (
      !lastContact ||
      (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24) > 7
    );
  });
  // Overdue proposals: status is 'qualified' or 'proposed' and no status change in 14+ days
  const overdueProposals = leadsInRange.filter((lead) => {
    const lastStatus = lastStatusMap[lead.id];
    return (
      (lead.current_status === "qualified" ||
        lead.current_status === "proposed") &&
      (!lastStatus ||
        (now.getTime() - lastStatus.changed_at.getTime()) /
          (1000 * 60 * 60 * 24) >
          14)
    );
  });
  // New leads this week
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const newLeadsThisWeek = leadsInRange.filter((lead) => {
    const created = new Date(lead.created_at);
    return created >= startOfWeek;
  });
  // Lost leads this month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lostLeadsThisMonth = leadsInRange.filter((lead) => {
    const lastStatus = lastStatusMap[lead.id];
    return (
      lead.current_status === "lost" &&
      lastStatus &&
      lastStatus.status === "lost" &&
      lastStatus.changed_at >= startOfMonth
    );
  });
  // Stale leads: no status change in 30+ days
  const staleLeads = leadsInRange.filter((lead) => {
    const lastStatus = lastStatusMap[lead.id];
    return (
      !lastStatus ||
      (now.getTime() - lastStatus.changed_at.getTime()) /
        (1000 * 60 * 60 * 24) >
        30
    );
  });

  // Chart data: leads created per day (last 30 days)
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const leadsByDay = days.map((day) => {
    const count = leads.filter((lead) => {
      const created = new Date(lead.created_at);
      return (
        created >= day &&
        created < new Date(day.getTime() + 24 * 60 * 60 * 1000)
      );
    }).length;
    return { date: day.toLocaleDateString(), count };
  });
  // Pie chart data for sources
  const pieData = filteredSourceCounts.map((s) => ({
    name: s.source,
    value: s.count,
  }));
  // Tailwind-inspired color palette
  const pieColors = [
    "#3b82f6", // blue-500
    "#f59e42", // orange-400
    "#10b981", // emerald-500
    "#f43f5e", // rose-500
    "#6366f1", // indigo-500
    "#fbbf24", // yellow-400
    "#a3e635", // lime-400
    "#f472b6", // pink-400
    "#818cf8", // indigo-400
    "#f87171", // red-400
  ];
  // Bar chart data for status
  const barData = Object.keys(statusCounts).map((status, idx) => ({
    status,
    count: statusCounts[status],
    fill: pieColors[idx % pieColors.length],
  }));

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* User Context Header */}
      {currentUser && (
        <div className="bg-white rounded shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                Welcome, {currentUser.full_name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className={
                    roleColors[currentUser.role] || "bg-gray-100 text-gray-800"
                  }
                >
                  {currentUser.role}
                </Badge>
                <span className="text-sm text-gray-600">
                  {userPermissions?.canViewAllLeads
                    ? "Full access"
                    : "Limited access"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {assignedJobs.length > 0 && (
                  <div>Assigned Jobs: {assignedJobs.length}</div>
                )}
                {assignedTasks.length > 0 && (
                  <div>Assigned Tasks: {assignedTasks.length}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scoreboard Cluster */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">{totalLeads}</div>
          <div className="text-gray-600">Total Leads</div>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">{won}</div>
          <div className="text-green-700">Won</div>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">{lost}</div>
          <div className="text-red-700">Lost</div>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">{conversionRate}%</div>
          <div className="text-gray-600">Conversion Rate</div>
        </div>
      </div>

      {/* Filters & View Switcher */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2 items-center">
          <span className="font-medium">Date Range:</span>
          <select
            className="border rounded px-2 py-1"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            {dateRanges.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <span className="font-medium ml-4">Filter by status:</span>
          <select
            className="border rounded px-2 py-1"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            {Object.keys(statusCounts).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <span className="font-medium">View:</span>
          {viewTypes.map((v) => (
            <Button
              key={v.value}
              variant={viewType === v.value ? "default" : "outline"}
              onClick={() => setViewType(v.value)}
            >
              {v.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Source Breakdown Bar Chart */}
      <div className="bg-white rounded shadow p-6 min-h-[180px]">
        <div className="font-semibold mb-2">Lead Source Breakdown</div>
        {filteredSourceCounts.length === 0 ? (
          <div className="text-gray-400">No source data available.</div>
        ) : (
          <div className="flex items-end gap-4 h-32">
            {filteredSourceCounts.map((s) => (
              <div key={s.source} className="flex flex-col items-center flex-1">
                <div
                  className="bg-blue-500 rounded-t w-8"
                  style={{ height: `${(s.count / maxSourceCount) * 100}%` }}
                  title={`${s.source}: ${s.count}`}
                ></div>
                <div className="text-xs mt-2 text-center break-words w-12">
                  {s.source}
                </div>
                <div className="text-xs text-gray-500">{s.count}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Items */}
      <div className="bg-white rounded shadow p-6 min-h-[120px] mb-4">
        <div className="font-semibold mb-2">Action Items</div>
        {loading ? (
          <div className="text-gray-400">Loading action items...</div>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : (
          <>
            <div className="mb-2 font-medium">
              Follow-ups (no contact in 7+ days):
            </div>
            {followUps.length === 0 ? (
              <div className="text-gray-500 mb-2">No follow-ups needed.</div>
            ) : (
              <ul className="list-disc pl-5 text-gray-700 mb-4">
                {followUps.map((lead) => (
                  <li key={lead.id}>
                    {lead.full_name} ({lead.company})
                  </li>
                ))}
              </ul>
            )}
            <div className="mb-2 font-medium">
              Overdue Proposals (no status change in 14+ days):
            </div>
            {overdueProposals.length === 0 ? (
              <div className="text-gray-500 mb-2">No overdue proposals.</div>
            ) : (
              <ul className="list-disc pl-5 text-gray-700 mb-4">
                {overdueProposals.map((lead) => (
                  <li key={lead.id}>
                    {lead.full_name} ({lead.company})
                  </li>
                ))}
              </ul>
            )}
            <div className="mb-2 font-medium">New Leads This Week:</div>
            {newLeadsThisWeek.length === 0 ? (
              <div className="text-gray-500 mb-2">No new leads this week.</div>
            ) : (
              <ul className="list-disc pl-5 text-gray-700 mb-4">
                {newLeadsThisWeek.map((lead) => (
                  <li key={lead.id}>
                    {lead.full_name} ({lead.company})
                  </li>
                ))}
              </ul>
            )}
            <div className="mb-2 font-medium">Lost Leads This Month:</div>
            {lostLeadsThisMonth.length === 0 ? (
              <div className="text-gray-500 mb-2">
                No lost leads this month.
              </div>
            ) : (
              <ul className="list-disc pl-5 text-gray-700 mb-4">
                {lostLeadsThisMonth.map((lead) => (
                  <li key={lead.id}>
                    {lead.full_name} ({lead.company})
                  </li>
                ))}
              </ul>
            )}
            <div className="mb-2 font-medium">
              Stale Leads (no status change in 30+ days):
            </div>
            {staleLeads.length === 0 ? (
              <div className="text-gray-500">No stale leads.</div>
            ) : (
              <ul className="list-disc pl-5 text-gray-700">
                {staleLeads.map((lead) => (
                  <li key={lead.id}>
                    {lead.full_name} ({lead.company})
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Line Chart: Leads Created Over Last 30 Days */}
        <div className="bg-white rounded shadow p-4">
          <div className="font-semibold mb-2">Leads Created (Last 30 Days)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={leadsByDay}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis allowDecimals={false} width={30} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  borderRadius: "0.375rem",
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Leads Created"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Pie Chart: Lead Sources */}
        <div className="bg-white rounded shadow p-4">
          <div className="font-semibold mb-2">Lead Sources</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {pieData.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={pieColors[idx % pieColors.length]}
                  />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  borderRadius: "0.375rem",
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Bar Chart: Status Counts */}
        <div className="bg-white rounded shadow p-4">
          <div className="font-semibold mb-2">Current Status Counts</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={barData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} width={30} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  borderRadius: "0.375rem",
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" name="Leads">
                {barData.map((entry, idx) => (
                  <Cell key={`bar-cell-${idx}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main View: Table, Cards, or Chart */}
      <div className="bg-white rounded shadow p-0 overflow-x-auto">
        {loading ? (
          <div className="p-6 text-gray-500">Loading leads...</div>
        ) : error ? (
          <div className="p-6 text-red-500">Error: {error}</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-6 text-gray-500">No leads found.</div>
        ) : viewType === "table" ? (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Company</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2 font-medium text-blue-700">
                    {lead.full_name}
                  </td>
                  <td className="px-4 py-2">{lead.company}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[lead.current_status] || "bg-gray-100 text-gray-800"}`}
                    >
                      {lead.current_status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : viewType === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="border rounded p-4 shadow hover:shadow-lg transition"
              >
                <div className="font-bold text-lg mb-1">{lead.full_name}</div>
                <div className="text-gray-600 mb-1">{lead.company}</div>
                <div className="mb-1">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[lead.current_status] || "bg-gray-100 text-gray-800"}`}
                  >
                    {lead.current_status}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(lead.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-gray-400">[Chart view coming soon]</div>
        )}
      </div>
    </div>
  );
}
