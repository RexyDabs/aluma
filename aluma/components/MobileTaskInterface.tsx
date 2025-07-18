"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  CheckCircle,
  Clock,
  Play,
  Pause,
  MapPin,
  Phone,
  AlertTriangle,
  Camera,
  FileText,
  ChevronRight,
  Timer,
  User,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "not_started" | "in_progress" | "completed" | "blocked";
  priority: "low" | "medium" | "high" | "critical";
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  job?: {
    id: string;
    title: string;
    client_name: string;
    site_address: string;
    contact_phone: string;
  };
}

interface TimeEntry {
  id: string;
  task_id: string;
  start_time: string;
  end_time: string | null;
  hours: number | null;
}

const statusColors = {
  not_started: "bg-gray-100 text-gray-800 border-gray-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  blocked: "bg-red-100 text-red-800 border-red-200",
};

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export default function MobileTaskInterface() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTimeEntry, setActiveTimeEntry] = useState<TimeEntry | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    initializeData();
  }, []);

  async function initializeData() {
    const user = await getCurrentUser();
    setCurrentUser(user);

    if (user) {
      await fetchUserTasks(user.id);
      await checkActiveTimeEntry(user.id);
    }

    setLoading(false);
  }

  async function fetchUserTasks(userId: string) {
    try {
      // Mock data for demonstration - replace with actual Supabase query
      const mockTasks: Task[] = [
        {
          id: "1",
          title: "Install Kitchen Cabinets",
          description: "Mount upper and lower cabinets in kitchen renovation",
          status: "not_started",
          priority: "high",
          due_date: new Date().toISOString(),
          estimated_hours: 4,
          actual_hours: null,
          job: {
            id: "j1",
            title: "Smith Kitchen Renovation",
            client_name: "John Smith",
            site_address: "123 Oak Street, Sydney NSW 2000",
            contact_phone: "+61 400 123 456",
          },
        },
        {
          id: "2",
          title: "Plumbing Rough-in",
          description: "Install rough plumbing for bathroom renovation",
          status: "in_progress",
          priority: "critical",
          due_date: new Date().toISOString(),
          estimated_hours: 6,
          actual_hours: 2.5,
          job: {
            id: "j2",
            title: "Jones Bathroom Remodel",
            client_name: "Sarah Jones",
            site_address: "456 Pine Avenue, Melbourne VIC 3000",
            contact_phone: "+61 400 789 012",
          },
        },
        {
          id: "3",
          title: "Final Inspection",
          description: "Conduct final walkthrough and quality check",
          status: "completed",
          priority: "medium",
          due_date: new Date(Date.now() - 86400000).toISOString(),
          estimated_hours: 1,
          actual_hours: 1.5,
          job: {
            id: "j3",
            title: "Wilson Deck Construction",
            client_name: "Mike Wilson",
            site_address: "789 Cedar Road, Brisbane QLD 4000",
            contact_phone: "+61 400 345 678",
          },
        },
      ];

      setTasks(mockTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  async function checkActiveTimeEntry(userId: string) {
    // Check if there's an active time entry
    // Mock implementation
    setActiveTimeEntry(null);
  }

  async function startTask(task: Task) {
    try {
      // Start time tracking
      const timeEntry: TimeEntry = {
        id: Date.now().toString(),
        task_id: task.id,
        start_time: new Date().toISOString(),
        end_time: null,
        hours: null,
      };

      setActiveTimeEntry(timeEntry);

      // Update task status to in_progress
      const updatedTasks = tasks.map((t) =>
        t.id === task.id ? { ...t, status: "in_progress" as const } : t,
      );
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error starting task:", error);
    }
  }

  async function pauseTask() {
    if (!activeTimeEntry) return;

    try {
      const endTime = new Date();
      const startTime = new Date(activeTimeEntry.start_time);
      const hours =
        (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      // Update the task with actual hours
      const updatedTasks = tasks.map((t) =>
        t.id === activeTimeEntry.task_id
          ? { ...t, actual_hours: (t.actual_hours || 0) + hours }
          : t,
      );
      setTasks(updatedTasks);
      setActiveTimeEntry(null);
    } catch (error) {
      console.error("Error pausing task:", error);
    }
  }

  async function completeTask(task: Task) {
    try {
      // If there's an active time entry for this task, end it
      if (activeTimeEntry?.task_id === task.id) {
        await pauseTask();
      }

      // Update task status to completed
      const updatedTasks = tasks.map((t) =>
        t.id === task.id ? { ...t, status: "completed" as const } : t,
      );
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error completing task:", error);
    }
  }

  const getTaskIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "in_progress":
        return <Play className="h-5 w-5 text-blue-600" />;
      case "blocked":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatTime = (hours: number | null) => {
    if (!hours) return "0h";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getActiveTaskTime = () => {
    if (!activeTimeEntry) return "0:00";

    const now = new Date();
    const start = new Date(activeTimeEntry.start_time);
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-white rounded-lg shadow-sm animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  const todayTasks = tasks.filter((task) => {
    if (!task.due_date) return false;
    const today = new Date().toDateString();
    const taskDate = new Date(task.due_date).toDateString();
    return today === taskDate;
  });

  const activeTasks = tasks.filter((task) => task.status === "in_progress");
  const completedTasks = tasks.filter((task) => task.status === "completed");

  return (
    <div className="space-y-6 pb-6">
      {/* Active Timer Widget */}
      {activeTimeEntry && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-full">
                  <Timer className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900">
                    Task in Progress
                  </p>
                  <p className="text-sm text-blue-700">
                    {tasks.find((t) => t.id === activeTimeEntry.task_id)?.title}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">
                  {getActiveTaskTime()}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={pauseTask}
                  className="mt-1 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {todayTasks.length}
            </div>
            <div className="text-sm text-gray-600">Today's Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {activeTasks.length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {completedTasks.length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Today's Tasks</h2>
        <div className="space-y-3">
          {todayTasks.map((task) => (
            <Card
              key={task.id}
              className="card-hover cursor-pointer"
              onClick={() => setSelectedTask(task)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getTaskIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {task.title}
                        </h3>
                        <Badge
                          className={priorityColors[task.priority]}
                          variant="outline"
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {task.description}
                      </p>

                      {task.job && (
                        <div className="text-sm text-gray-500 mb-2">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{task.job.client_name}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Est: {formatTime(task.estimated_hours)}
                          {task.actual_hours &&
                            ` | Actual: ${formatTime(task.actual_hours)}`}
                        </span>
                        <Badge
                          className={statusColors[task.status]}
                          variant="outline"
                        >
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-2">
                    {task.status === "not_started" && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          startTask(task);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    )}

                    {task.status === "in_progress" && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          completeTask(task);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Button>
                    )}

                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedTask.title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTask(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-600 text-sm">
                    {selectedTask.description}
                  </p>
                </div>

                {selectedTask.job && (
                  <div>
                    <h3 className="font-medium mb-2">Job Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{selectedTask.job.client_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {selectedTask.job.site_address}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a
                          href={`tel:${selectedTask.job.contact_phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedTask.job.contact_phone}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Photo
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Notes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
