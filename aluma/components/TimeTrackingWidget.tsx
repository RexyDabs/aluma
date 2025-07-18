"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Clock,
  MapPin,
  Play,
  Square,
  Calendar,
  User,
  Timer,
  CheckCircle,
} from "lucide-react";

interface TimeEntry {
  id: string;
  user_id: string;
  job_id?: string;
  task_id?: string;
  check_in_time: string;
  check_out_time?: string;
  location_lat?: number;
  location_lng?: number;
  notes?: string;
  status: "active" | "completed";
}

interface Job {
  id: string;
  title: string;
  client_name: string;
  site_address: string;
}

export default function TimeTrackingWidget() {
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayHours, setTodayHours] = useState(0);

  useEffect(() => {
    initializeTimeTracking();

    // Update current time every second when checked in
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  async function initializeTimeTracking() {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (user) {
        await checkActiveEntry(user.id);
        await fetchAvailableJobs(user.id);
        await calculateTodayHours(user.id);
      }
    } catch (error) {
      console.error("Error initializing time tracking:", error);
    } finally {
      setLoading(false);
    }
  }

  async function checkActiveEntry(userId: string) {
    try {
      // Mock check for active time entry
      // In real implementation, query supabase for active entries
      const mockActiveEntry: TimeEntry | null = null;
      setCurrentEntry(mockActiveEntry);
    } catch (error) {
      console.error("Error checking active entry:", error);
    }
  }

  async function fetchAvailableJobs(userId: string) {
    try {
      // Mock job data - replace with actual query
      const mockJobs: Job[] = [
        {
          id: "1",
          title: "Kitchen Renovation",
          client_name: "Smith Family",
          site_address: "123 Oak Street, Sydney NSW",
        },
        {
          id: "2",
          title: "Bathroom Remodel",
          client_name: "Jones Residence",
          site_address: "456 Pine Avenue, Melbourne VIC",
        },
        {
          id: "3",
          title: "Deck Construction",
          client_name: "Wilson Property",
          site_address: "789 Cedar Road, Brisbane QLD",
        },
      ];

      setAvailableJobs(mockJobs);
      if (mockJobs.length > 0) {
        setSelectedJob(mockJobs[0].id);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  }

  async function calculateTodayHours(userId: string) {
    try {
      // Mock calculation - replace with actual query
      setTodayHours(6.5); // 6.5 hours worked today
    } catch (error) {
      console.error("Error calculating today hours:", error);
    }
  }

  async function getCurrentLocation(): Promise<{
    lat: number;
    lng: number;
  } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  }

  async function checkIn() {
    if (!currentUser || !selectedJob) return;

    try {
      const location = await getCurrentLocation();

      const newEntry: TimeEntry = {
        id: Date.now().toString(),
        user_id: currentUser.id,
        job_id: selectedJob,
        check_in_time: new Date().toISOString(),
        location_lat: location?.lat,
        location_lng: location?.lng,
        status: "active",
      };

      // In real implementation, save to Supabase
      setCurrentEntry(newEntry);
    } catch (error) {
      console.error("Error checking in:", error);
    }
  }

  async function checkOut() {
    if (!currentEntry) return;

    try {
      const location = await getCurrentLocation();

      const updatedEntry: TimeEntry = {
        ...currentEntry,
        check_out_time: new Date().toISOString(),
        status: "completed",
      };

      // In real implementation, update in Supabase
      setCurrentEntry(null);

      // Recalculate today's hours
      await calculateTodayHours(currentUser.id);
    } catch (error) {
      console.error("Error checking out:", error);
    }
  }

  const getWorkedTime = () => {
    if (!currentEntry || !currentEntry.check_in_time) return "0:00:00";

    const start = new Date(currentEntry.check_in_time);
    const now = currentTime;
    const diff = now.getTime() - start.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedJobDetails = availableJobs.find(
    (job) => job.id === selectedJob,
  );

  return (
    <div className="space-y-4">
      {/* Current Status Card */}
      <Card
        className={currentEntry ? "bg-green-50 border-green-200" : "bg-gray-50"}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Timer className="h-5 w-5" />
            <span>Time Tracking</span>
            {currentEntry && (
              <Badge className="bg-green-100 text-green-800 border-green-300">
                Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentEntry ? (
            <div className="space-y-4">
              {/* Active session info */}
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700 mb-1">
                  {getWorkedTime()}
                </div>
                <p className="text-sm text-green-600">
                  Started at {formatTime(new Date(currentEntry.check_in_time))}
                </p>
              </div>

              {/* Job info */}
              {selectedJobDetails && (
                <div className="bg-white rounded-lg p-3 border">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">
                      {selectedJobDetails.client_name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedJobDetails.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedJobDetails.site_address}
                    </span>
                  </div>
                </div>
              )}

              {/* Check out button */}
              <Button
                onClick={checkOut}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <Square className="h-4 w-4 mr-2" />
                Check Out
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Job selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Job
                </label>
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {availableJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.client_name} - {job.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Job details */}
              {selectedJobDetails && (
                <div className="bg-white rounded-lg p-3 border">
                  <div className="flex items-center space-x-2 mb-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedJobDetails.site_address}
                    </span>
                  </div>
                </div>
              )}

              {/* Check in button */}
              <Button
                onClick={checkIn}
                disabled={!selectedJob}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Check In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Today's Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {todayHours.toFixed(1)}h
              </div>
              <div className="text-sm text-gray-600">Hours Worked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-gray-600">Current Time</div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Regular Hours (8h):</span>
              <span className="font-medium">
                {Math.min(todayHours, 8).toFixed(1)}h
              </span>
            </div>
            {todayHours > 8 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Overtime:</span>
                <span className="font-medium text-orange-600">
                  {(todayHours - 8).toFixed(1)}h
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <Clock className="h-4 w-4 mr-2" />
            View Time History
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <MapPin className="h-4 w-4 mr-2" />
            Check GPS Accuracy
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <CheckCircle className="h-4 w-4 mr-2" />
            Submit Timesheet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
