"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
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
  Plus,
  Calendar,
  Star,
  Filter,
  Search,
  MoreVertical,
  MessageSquare,
  Edit3,
  Image as ImageIcon,
  Upload,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "critical";
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  tags?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
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
  todo: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
  done: "bg-green-100 text-green-800 border-green-200",
  blocked: "bg-red-100 text-red-800 border-red-200",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export default function EnhancedMobileTaskInterface() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTimeEntries, setActiveTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showProgressUpdate, setShowProgressUpdate] = useState(false);
  const [progressNote, setProgressNote] = useState("");

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    const user = await getCurrentUser();
    setCurrentUser(user);
    if (user) {
      await fetchTasks(user.id);
      await fetchActiveTimeEntries(user.id);
    }
    setLoading(false);
  }

  async function fetchTasks(userId: string) {
    try {
      const { data, error } = await supabase
        .from("global_tasks")
        .select(
          `
          *,
          category:task_categories(id, name, color),
          tags:global_task_tags(
            tag:task_tags(id, name, color)
          )
        `,
        )
        .or(`assigned_to.cs.{${userId}},created_by.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Process tags structure
      const processedTasks =
        data?.map((task) => ({
          ...task,
          tags: task.tags?.map((t: any) => t.tag) || [],
        })) || [];

      setTasks(processedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  async function fetchActiveTimeEntries(userId: string) {
    try {
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("user_id", userId)
        .is("end_time", null);

      if (error) throw error;
      setActiveTimeEntries(data || []);
    } catch (error) {
      console.error("Error fetching time entries:", error);
    }
  }

  async function startTimer(taskId: string) {
    if (!currentUser) return;

    try {
      // Stop any existing timers
      await stopAllTimers();

      const { error } = await supabase.from("time_entries").insert({
        task_id: taskId,
        user_id: currentUser.id,
        start_time: new Date().toISOString(),
      });

      if (error) throw error;

      // Update task status to in_progress
      await supabase
        .from("global_tasks")
        .update({ status: "in_progress" })
        .eq("id", taskId);

      await fetchActiveTimeEntries(currentUser.id);
      await fetchTasks(currentUser.id);
    } catch (error) {
      console.error("Error starting timer:", error);
    }
  }

  async function stopTimer(taskId: string) {
    if (!currentUser) return;

    try {
      const activeEntry = activeTimeEntries.find(
        (entry) => entry.task_id === taskId,
      );

      if (activeEntry) {
        const endTime = new Date();
        const startTime = new Date(activeEntry.start_time);
        const hours =
          (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

        await supabase
          .from("time_entries")
          .update({
            end_time: endTime.toISOString(),
            hours: Math.round(hours * 100) / 100,
          })
          .eq("id", activeEntry.id);

        await fetchActiveTimeEntries(currentUser.id);
      }
    } catch (error) {
      console.error("Error stopping timer:", error);
    }
  }

  async function stopAllTimers() {
    const activeEntries = activeTimeEntries.filter((entry) => !entry.end_time);

    for (const entry of activeEntries) {
      await stopTimer(entry.task_id);
    }
  }

  async function updateTaskStatus(taskId: string, newStatus: string) {
    try {
      await supabase
        .from("global_tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      await fetchTasks(currentUser?.id);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  }

  async function submitProgressUpdate() {
    if (!selectedTask || !progressNote.trim()) return;

    try {
      // Add progress note to task
      await supabase.from("task_notes").insert({
        task_id: selectedTask.id,
        user_id: currentUser?.id,
        note: progressNote.trim(),
        note_type: "progress",
      });

      setProgressNote("");
      setShowProgressUpdate(false);
    } catch (error) {
      console.error("Error submitting progress update:", error);
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getTaskTimer = (taskId: string) => {
    return activeTimeEntries.find(
      (entry) => entry.task_id === taskId && !entry.end_time,
    );
  };

  const isTaskActive = (taskId: string) => {
    return !!getTaskTimer(taskId);
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "todo":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <Play className="h-4 w-4" />;
      case "done":
        return <CheckCircle className="h-4 w-4" />;
      case "blocked":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">My Tasks</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {filteredTasks.length} tasks
            </Badge>
          </div>

          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex space-x-2">
              {["all", "todo", "in_progress", "done"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="flex-1 text-xs"
                >
                  {status === "all" ? "All" : status.replace("_", " ")}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="p-4 space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No tasks found</p>
            <p className="text-sm text-gray-500">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const timer = getTaskTimer(task.id);
            const isActive = isTaskActive(task.id);

            return (
              <Card
                key={task.id}
                className="bg-white shadow-sm border border-gray-200"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm leading-5 mb-1">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskDetail(true);
                      }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={statusColors[task.status]}
                        variant="outline"
                      >
                        {getTaskStatusIcon(task.status)}
                        <span className="ml-1 text-xs">
                          {task.status.replace("_", " ")}
                        </span>
                      </Badge>
                      <Badge
                        className={priorityColors[task.priority]}
                        variant="secondary"
                      >
                        {task.priority}
                      </Badge>
                    </div>

                    {task.due_date && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Timer Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isActive ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => stopTimer(task.id)}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <Pause className="h-3 w-3 mr-1" />
                          Stop
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => startTimer(task.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      )}

                      {timer && (
                        <div className="flex items-center text-xs text-green-600 font-medium">
                          <Timer className="h-3 w-3 mr-1" />
                          Active
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-1">
                      {task.status !== "done" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateTaskStatus(task.id, "done")}
                          className="text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Task Detail Modal */}
      <Dialog open={showTaskDetail} onOpenChange={setShowTaskDetail}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg">Task Details</DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  {selectedTask.title}
                </h3>
                {selectedTask.description && (
                  <p className="text-sm text-gray-600">
                    {selectedTask.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-700">
                    Status
                  </label>
                  <Badge
                    className={statusColors[selectedTask.status]}
                    variant="outline"
                  >
                    {selectedTask.status.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">
                    Priority
                  </label>
                  <Badge
                    className={priorityColors[selectedTask.priority]}
                    variant="secondary"
                  >
                    {selectedTask.priority}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => {
                    setShowProgressUpdate(true);
                    setShowTaskDetail(false);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Progress Update
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateTaskStatus(selectedTask.id, "blocked")}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Block
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateTaskStatus(selectedTask.id, "done")}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Progress Update Modal */}
      <Dialog open={showProgressUpdate} onOpenChange={setShowProgressUpdate}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Progress Update</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="What progress have you made on this task?"
              value={progressNote}
              onChange={(e) => setProgressNote(e.target.value)}
              rows={4}
            />

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowProgressUpdate(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={submitProgressUpdate}
                disabled={!progressNote.trim()}
                className="flex-1"
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
