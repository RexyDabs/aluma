"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCurrentUser, getNavigationItems, canAccessPage } from "../lib/auth";
import type { User } from "../lib/auth";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import {
  DashboardIcon,
  TargetIcon,
  GearIcon,
  CheckboxIcon,
  StopwatchIcon,
  FileTextIcon,
  CurrencyDollarIcon,
  BarChartIcon,
  PersonIcon,
  ExitIcon,
  GearIcon as SettingsIcon,
  BellIcon,
  MagnifyingGlassIcon,
  AvatarIcon,
} from "@radix-ui/react-icons";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const iconMap: Record<string, React.ReactNode> = {
  DashboardIcon: <DashboardIcon className="h-5 w-5" />,
  TargetIcon: <TargetIcon className="h-5 w-5" />,
  GearIcon: <GearIcon className="h-5 w-5" />,
  CheckboxIcon: <CheckboxIcon className="h-5 w-5" />,
  StopwatchIcon: <StopwatchIcon className="h-5 w-5" />,
  FileTextIcon: <FileTextIcon className="h-5 w-5" />,
  CurrencyDollarIcon: <CurrencyDollarIcon className="h-5 w-5" />,
  BarChartIcon: <BarChartIcon className="h-5 w-5" />,
  PersonIcon: <PersonIcon className="h-5 w-5" />,
};

interface ModernSidebarProps {
  children: React.ReactNode;
}

export default function ModernSidebar({ children }: ModernSidebarProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    async function initializeNavigation() {
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (user) {
        const items = getNavigationItems(user).map((item) => ({
          ...item,
          icon: iconMap[item.icon] || <LayoutDashboard className="h-5 w-5" />,
        }));
        setNavigationItems(items);
      }

      setLoading(false);
    }

    initializeNavigation();
  }, []);

  // Don't show sidebar on homepage
  if (pathname === "/" || pathname === "/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="w-64 bg-white shadow-sm border-r animate-pulse">
          <div className="h-16 bg-gray-100 border-b"></div>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-white shadow-sm border-b animate-pulse"></div>
          <div className="flex-1 p-6">
            <div className="animate-pulse">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <>{children}</>;
  }

  const isFieldWorker = ["technician", "subcontractor", "staff"].includes(
    currentUser.role,
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 flex flex-col bg-white shadow-sm border-r
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${sidebarCollapsed ? "w-16" : "w-64"}
        lg:static lg:inset-0
      `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
              <DashboardIcon className="h-5 w-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Aluma
              </h1>
            )}
          </div>

          {/* Desktop collapse button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* User info */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <AvatarIcon className="h-4 w-4 text-white" />
              </div>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.full_name}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    className={getRoleBadgeColor(currentUser.role)}
                    variant="secondary"
                  >
                    {currentUser.role}
                  </Badge>
                  {isFieldWorker && (
                    <Badge
                      className="bg-green-100 text-green-800"
                      variant="secondary"
                    >
                      Field
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const canAccess = canAccessPage(currentUser, item.href);

            if (!canAccess) return null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${
                    isActive
                      ? "bg-blue-100 text-blue-900 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }
                  ${sidebarCollapsed ? "justify-center" : "justify-start"}
                `}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="ml-3">{item.label}</span>
                )}
                {isActive && !sidebarCollapsed && (
                  <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="space-y-2">
            {!sidebarCollapsed && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-600 hover:text-gray-900"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-600 hover:text-gray-900"
                  onClick={async () => {
                    if (process.env.NODE_ENV === "development") {
                      localStorage.removeItem("dev-user");
                    }
                    await fetch("/api/auth/signout", { method: "POST" });
                    window.location.href = "/";
                  }}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </Button>
              </>
            )}

            {sidebarCollapsed && (
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full p-2 justify-center"
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full p-2 justify-center"
                  title="Sign Out"
                  onClick={async () => {
                    if (process.env.NODE_ENV === "development") {
                      localStorage.removeItem("dev-user");
                    }
                    await fetch("/api/auth/signout", { method: "POST" });
                    window.location.href = "/";
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Breadcrumb */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <span>Aluma</span>
              <span>/</span>
              <span className="font-medium text-gray-900">
                {navigationItems.find((item) => item.href === pathname)
                  ?.label || "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search button */}
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            {/* Dev badge */}
            {process.env.NODE_ENV === "development" && (
              <Badge className="bg-orange-100 text-orange-800 text-xs">
                DEV
              </Badge>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function getRoleBadgeColor(role: string): string {
  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-800 border-red-200",
    manager: "bg-purple-100 text-purple-800 border-purple-200",
    technician: "bg-blue-100 text-blue-800 border-blue-200",
    subcontractor: "bg-orange-100 text-orange-800 border-orange-200",
    staff: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return roleColors[role] || "bg-gray-100 text-gray-800 border-gray-200";
}
