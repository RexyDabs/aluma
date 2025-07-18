"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "../../lib/auth";
import type { User } from "../../lib/auth";
import AnalyticsDashboard from "../../components/AnalyticsDashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Download,
  Share2,
  Calendar,
  Filter,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function initialize() {
      const user = await getCurrentUser();
      setCurrentUser(user);

      // Check if user has access to analytics (admin/manager only)
      const allowedRoles = ["admin", "manager"];
      setHasAccess(user ? allowedRoles.includes(user.role) : false);

      setLoading(false);
    }

    initialize();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Authentication Required
        </h2>
        <p className="text-gray-600">Please log in to view analytics.</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Access Restricted
        </h2>
        <p className="text-gray-600 mb-4">
          Analytics dashboard is only available to managers and administrators.
        </p>
        <Badge
          variant="outline"
          className="bg-orange-50 text-orange-700 border-orange-200"
        >
          Current Role: {currentUser.role}
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              Real-time
            </Badge>
          </div>
          <p className="text-gray-600">
            Comprehensive business insights and performance metrics for
            data-driven decisions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <TrendingUp className="h-5 w-5 mr-2" />
            Quick Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">$145K</div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">94%</div>
              <div className="text-sm text-gray-600">Job Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">96%</div>
              <div className="text-sm text-gray-600">Team Efficiency</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">35%</div>
              <div className="text-sm text-gray-600">Lead Conversion</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analytics Dashboard */}
      <AnalyticsDashboard />

      {/* Footer Notice */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              Data refreshed automatically every 15 minutes • Last updated:{" "}
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
