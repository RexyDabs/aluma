"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  PersonIcon,
  CheckCircledIcon,
  ClockIcon,
  DashboardIcon,
  TargetIcon,
  GearIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ActivityLogIcon,
} from "@radix-ui/react-icons";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
    period: string;
  };
  icon: React.ReactNode;
  color: "blue" | "green" | "orange" | "red" | "purple";
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

interface ActivityItem {
  id: string;
  type: "job" | "lead" | "task" | "user";
  title: string;
  description: string;
  time: string;
  status?: string;
}

export function KPICard({ title, value, change, icon, color }: KPICardProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className="flex items-center space-x-1">
                {change.type === "increase" ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    change.type === "increase"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {change.value}% {change.period}
                </span>
              </div>
            )}
          </div>
          <div
            className={`p-3 bg-gradient-to-r ${colorClasses[color]} rounded-xl`}
          >
            <div className="text-white">{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickActionsGrid({ actions }: { actions: QuickActionProps[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Frequently used actions for faster workflow
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto p-4 flex flex-col space-y-2 hover:shadow-medium transition-all"
            onClick={action.onClick}
          >
            <div className={`p-2 bg-gradient-to-r ${action.color} rounded-lg`}>
              <div className="text-white">{action.icon}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-sm">{action.title}</div>
              <div className="text-xs text-gray-600">{action.description}</div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "job":
        return <GearIcon className="h-4 w-4" />;
      case "lead":
        return <TargetIcon className="h-4 w-4" />;
      case "task":
        return <CheckCircledIcon className="h-4 w-4" />;
      case "user":
        return <PersonIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "job":
        return "text-blue-600 bg-blue-100";
      case "lead":
        return "text-green-600 bg-green-100";
      case "task":
        return "text-purple-600 bg-purple-100";
      case "user":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest updates across your organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClockIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div
                className={`p-2 rounded-full ${getActivityColor(activity.type)}`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <p className="text-sm text-gray-600">{activity.description}</p>
                {activity.status && (
                  <Badge className="mt-1" variant="outline">
                    {activity.status}
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function AlertsWidget({
  alerts,
}: {
  alerts: Array<{
    id: string;
    type: "warning" | "error" | "info";
    title: string;
    message: string;
  }>;
}) {
  if (alerts.length === 0) return null;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case "error":
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case "info":
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "warning":
        return "border-orange-200 bg-orange-50 text-orange-800";
      case "error":
        return "border-red-200 bg-red-50 text-red-800";
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-800";
      default:
        return "border-gray-200 bg-gray-50 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts & Notifications</CardTitle>
        <CardDescription>
          Important items requiring your attention
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 border rounded-lg ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-start space-x-2">
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <p className="font-medium text-sm">{alert.title}</p>
                <p className="text-sm opacity-90">{alert.message}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ScheduleWidget({
  todayTasks,
}: {
  todayTasks: Array<{ id: string; title: string; time: string; type: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5" />
          <span>Today's Schedule</span>
        </CardTitle>
        <CardDescription>Tasks and appointments for today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {todayTasks.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <CalendarIcon className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks scheduled for today</p>
          </div>
        ) : (
          todayTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {task.title}
                </p>
                <p className="text-xs text-gray-600">{task.type}</p>
              </div>
              <div className="text-xs text-gray-500">{task.time}</div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
