"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Target,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle2,
  Zap,
  Activity,
} from "lucide-react";

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    trend: number;
    monthly: Array<{ month: string; revenue: number; target: number }>;
  };
  jobs: {
    completed: number;
    active: number;
    overdue: number;
    completionRate: number;
    statusBreakdown: Array<{ status: string; count: number; color: string }>;
  };
  team: {
    totalMembers: number;
    activeToday: number;
    avgHoursPerWeek: number;
    topPerformers: Array<{
      name: string;
      completedTasks: number;
      hoursLogged: number;
    }>;
    productivityTrend: Array<{
      week: string;
      efficiency: number;
      tasks: number;
    }>;
  };
  leads: {
    total: number;
    converted: number;
    conversionRate: number;
    pipeline: Array<{ stage: string; count: number; value: number }>;
    sourceBreakdown: Array<{ source: string; count: number; value: number }>;
  };
  insights: Array<{
    type: "success" | "warning" | "info";
    title: string;
    description: string;
    action?: string;
  }>;
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateMockAnalytics();
  }, [timeRange]);

  // Generate comprehensive mock analytics data
  function generateMockAnalytics() {
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const data: AnalyticsData = {
        revenue: {
          current: 145250,
          previous: 128900,
          trend: 12.7,
          monthly: [
            { month: "Jan", revenue: 95000, target: 100000 },
            { month: "Feb", revenue: 110000, target: 105000 },
            { month: "Mar", revenue: 125000, target: 115000 },
            { month: "Apr", revenue: 135000, target: 120000 },
            { month: "May", revenue: 145250, target: 130000 },
            { month: "Jun", revenue: 0, target: 140000 },
          ],
        },
        jobs: {
          completed: 47,
          active: 23,
          overdue: 3,
          completionRate: 94.2,
          statusBreakdown: [
            { status: "Completed", count: 47, color: "#10b981" },
            { status: "Active", count: 23, color: "#3b82f6" },
            { status: "Planning", count: 8, color: "#f59e0b" },
            { status: "Overdue", count: 3, color: "#ef4444" },
          ],
        },
        team: {
          totalMembers: 12,
          activeToday: 9,
          avgHoursPerWeek: 38.5,
          topPerformers: [
            { name: "Mike Johnson", completedTasks: 24, hoursLogged: 42.5 },
            { name: "Sarah Chen", completedTasks: 21, hoursLogged: 38.2 },
            { name: "Dave Wilson", completedTasks: 19, hoursLogged: 40.1 },
          ],
          productivityTrend: [
            { week: "W1", efficiency: 87, tasks: 156 },
            { week: "W2", efficiency: 91, tasks: 162 },
            { week: "W3", efficiency: 89, tasks: 158 },
            { week: "W4", efficiency: 94, tasks: 171 },
            { week: "W5", efficiency: 96, tasks: 178 },
          ],
        },
        leads: {
          total: 89,
          converted: 31,
          conversionRate: 34.8,
          pipeline: [
            { stage: "Initial Contact", count: 89, value: 445000 },
            { stage: "Qualified", count: 56, value: 378000 },
            { stage: "Proposal Sent", count: 42, value: 294000 },
            { stage: "Negotiating", count: 31, value: 217000 },
            { stage: "Won", count: 23, value: 161000 },
          ],
          sourceBreakdown: [
            { source: "Referrals", count: 34, value: 170000 },
            { source: "Website", count: 28, value: 140000 },
            { source: "Social Media", count: 15, value: 75000 },
            { source: "Direct", count: 12, value: 60000 },
          ],
        },
        insights: [
          {
            type: "success",
            title: "Revenue Goal Exceeded",
            description: "May revenue exceeded target by $15,250 (11.7%)",
            action: "View Details",
          },
          {
            type: "warning",
            title: "Overdue Jobs Alert",
            description:
              "3 jobs are past their due date. Consider reassigning resources.",
            action: "View Jobs",
          },
          {
            type: "info",
            title: "Team Performance Peak",
            description:
              "Team efficiency reached 96% this week - highest this quarter!",
            action: "View Team",
          },
          {
            type: "warning",
            title: "Lead Follow-up Needed",
            description: "8 qualified leads haven't been contacted in 7+ days.",
            action: "Review Leads",
          },
        ],
      };

      setAnalyticsData(data);
      setLoading(false);
    }, 800);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case "info":
        return <Zap className="h-5 w-5 text-blue-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-orange-50 border-orange-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (loading || !analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Business Analytics
          </h2>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-80 bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Business Analytics
          </h2>
          <p className="text-gray-600">
            Real-time insights into your business performance
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 3 months</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Monthly Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(analyticsData.revenue.current)}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    +{analyticsData.revenue.trend}% vs last month
                  </span>
                </div>
              </div>
              <DollarSign className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Job Completion Rate</p>
                <p className="text-2xl font-bold">
                  {analyticsData.jobs.completionRate}%
                </p>
                <div className="flex items-center mt-2">
                  <Target className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {analyticsData.jobs.completed} jobs completed
                  </span>
                </div>
              </div>
              <CheckCircle2 className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Team Efficiency</p>
                <p className="text-2xl font-bold">96%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {analyticsData.team.activeToday}/
                    {analyticsData.team.totalMembers} active today
                  </span>
                </div>
              </div>
              <Users className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Lead Conversion</p>
                <p className="text-2xl font-bold">
                  {analyticsData.leads.conversionRate}%
                </p>
                <div className="flex items-center mt-2">
                  <Target className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {analyticsData.leads.converted}/{analyticsData.leads.total}{" "}
                    converted
                  </span>
                </div>
              </div>
              <Award className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Revenue vs Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.revenue.monthly}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis
                  stroke="#64748b"
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), ""]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Job Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Job Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.jobs.statusBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {analyticsData.jobs.statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Productivity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team Productivity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.team.productivityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#64748b" />
                <YAxis yAxisId="left" stroke="#64748b" />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  name="Efficiency %"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="tasks"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Tasks Completed"
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Lead Sources Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={analyticsData.leads.sourceBreakdown}
                layout="horizontal"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  stroke="#64748b"
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <YAxis
                  dataKey="source"
                  type="category"
                  stroke="#64748b"
                  width={80}
                />
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    "Value",
                  ]}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            AI-Powered Business Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyticsData.insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getInsightBgColor(insight.type)}`}
              >
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {insight.description}
                    </p>
                    {insight.action && (
                      <Button size="sm" variant="outline" className="text-xs">
                        {insight.action}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Top Performers This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.team.topPerformers.map((performer, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {performer.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {performer.completedTasks} tasks completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {performer.hoursLogged}h logged
                  </div>
                  <Badge variant="secondary" className="mt-1">
                    Top Performer
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
