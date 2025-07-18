"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../../lib/auth";
import type { User } from "../../lib/auth";
import TimeTrackingWidget from "../../components/TimeTrackingWidget";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Clock,
  Calendar,
  MapPin,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface TimeHistory {
  id: string;
  date: string;
  job_title: string;
  client_name: string;
  check_in: string;
  check_out: string;
  total_hours: number;
  location: string;
  status: "approved" | "pending" | "rejected";
}

export default function TimeTrackingPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeHistory, setTimeHistory] = useState<TimeHistory[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [weeklyHours, setWeeklyHours] = useState(0);

  useEffect(() => {
    async function initializePage() {
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (user) {
        await fetchTimeHistory(user.id);
      }

      setLoading(false);
    }

    initializePage();
  }, [selectedWeek]);

  async function fetchTimeHistory(userId: string) {
    try {
      // Mock time history data
      const mockHistory: TimeHistory[] = [
        {
          id: "1",
          date: "2024-01-15",
          job_title: "Kitchen Renovation",
          client_name: "Smith Family",
          check_in: "08:00",
          check_out: "16:30",
          total_hours: 8.5,
          location: "123 Oak Street, Sydney",
          status: "approved",
        },
        {
          id: "2",
          date: "2024-01-14",
          job_title: "Bathroom Remodel",
          client_name: "Jones Residence",
          check_in: "07:30",
          check_out: "15:45",
          total_hours: 8.25,
          location: "456 Pine Avenue, Melbourne",
          status: "approved",
        },
        {
          id: "3",
          date: "2024-01-13",
          job_title: "Deck Construction",
          client_name: "Wilson Property",
          check_in: "08:15",
          check_out: "17:00",
          total_hours: 8.75,
          location: "789 Cedar Road, Brisbane",
          status: "pending",
        },
        {
          id: "4",
          date: "2024-01-12",
          job_title: "Kitchen Renovation",
          client_name: "Smith Family",
          check_in: "08:00",
          check_out: "16:00",
          total_hours: 8.0,
          location: "123 Oak Street, Sydney",
          status: "approved",
        },
        {
          id: "5",
          date: "2024-01-11",
          job_title: "Bathroom Remodel",
          client_name: "Jones Residence",
          check_in: "08:30",
          check_out: "12:00",
          total_hours: 3.5,
          location: "456 Pine Avenue, Melbourne",
          status: "approved",
        },
      ];

      setTimeHistory(mockHistory);

      // Calculate weekly hours
      const total = mockHistory.reduce(
        (sum, entry) => sum + entry.total_hours,
        0,
      );
      setWeeklyHours(total);
    } catch (error) {
      console.error("Error fetching time history:", error);
    }
  }

  const getWeekRange = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // Sunday
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Saturday

    return {
      start: start.toLocaleDateString(),
      end: end.toLocaleDateString(),
    };
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(selectedWeek.getDate() + (direction === "next" ? 7 : -7));
    setSelectedWeek(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="h-96 bg-white rounded-lg shadow-sm animate-pulse"></div>
          </div>
          <div className="lg:col-span-2">
            <div className="h-96 bg-white rounded-lg shadow-sm animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view time tracking.</p>
      </div>
    );
  }

  const weekRange = getWeekRange(selectedWeek);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-600 mt-1">
            Manage your work hours and track time efficiently
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Time Tracking Widget */}
        <div className="lg:col-span-1">
          <TimeTrackingWidget />
        </div>

        {/* Right Column - Time History and Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Weekly Summary</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateWeek("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {weekRange.start} - {weekRange.end}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateWeek("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {weeklyHours.toFixed(1)}h
                  </div>
                  <div className="text-sm text-gray-600">Total Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.min(weeklyHours, 40).toFixed(1)}h
                  </div>
                  <div className="text-sm text-gray-600">Regular</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.max(weeklyHours - 40, 0).toFixed(1)}h
                  </div>
                  <div className="text-sm text-gray-600">Overtime</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress towards 40h</span>
                  <span>
                    {Math.min((weeklyHours / 40) * 100, 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((weeklyHours / 40) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Recent Time Entries</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {entry.job_title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {entry.client_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          {entry.total_hours}h
                        </div>
                        <Badge
                          className={getStatusColor(entry.status)}
                          variant="outline"
                        >
                          {entry.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {entry.check_in} - {entry.check_out}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 mt-2 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{entry.location}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <Button variant="outline">View All Entries</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
