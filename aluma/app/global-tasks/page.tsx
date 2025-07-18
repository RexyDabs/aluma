"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getCurrentUser } from "../../lib/auth";
import type { User } from "../../lib/auth";
import MobileTaskInterface from "../../components/MobileTaskInterface";
import { supabase } from "../../lib/supabase";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import {
  Plus,
  Filter,
  Tag,
  Calendar,
  User,
  Edit,
  Trash2,
  Monitor,
  Smartphone,
} from "lucide-react";
import TaskCreationForm from "../../components/TaskCreationForm";
import QuickTaskForm from "../../components/QuickTaskForm";

interface GlobalTask {
  id: string;
  title: string;
  description: string;
  status: string;
  due_date: string | null;
  category_id: string | null;
  category?: TaskCategory;
  tags?: TaskTag[];
  assigned_to?: string[];
}

interface TaskCategory {
  id: string;
  name: string;
  color: string;
}

interface TaskTag {
  id: string;
  name: string;
  color: string;
}

const statusOptions = [
  { label: "All", value: "all-statuses" },
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" },
  { label: "Blocked", value: "blocked" },
];

export default function GlobalTasksPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"mobile" | "desktop">("mobile");
  const [tasks, setTasks] = useState<GlobalTask[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [tags, setTags] = useState<TaskTag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all-statuses");
  const [categoryFilter, setCategoryFilter] = useState("all-categories");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [dueFilter, setDueFilter] = useState("all-due-dates");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTask, setEditTask] = useState<GlobalTask | null>(null);

  useEffect(() => {
    async function initializePage() {
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (user) {
        // Determine default view mode based on user role
        const isFieldWorker = ["technician", "subcontractor", "staff"].includes(
          user.role,
        );
        setViewMode(isFieldWorker ? "mobile" : "desktop");

        // Fetch data for desktop view
        if (!isFieldWorker) {
          await fetchAll();
        }
      }

      setLoading(false);
    }

    initializePage();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError(null);

    try {
      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase.from(
        "global_tasks",
      ).select(`
          *,
          category:task_categories(id, name, color),
          tags:global_task_tags(
            tag:task_tags(id, name, color)
          )
        `);

      if (tasksError) throw tasksError;

      // Flatten the tags structure
      const processedTasks =
        tasksData?.map((task) => ({
          ...task,
          tags: task.tags?.map((t: any) => t.tag) || [],
        })) || [];

      setTasks(processedTasks);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("task_categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch tags
      const { data: tagsData, error: tagsError } = await supabase
        .from("task_tags")
        .select("*")
        .order("name");

      if (tagsError) throw tagsError;
      setTags(tagsData || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-white rounded-lg shadow-sm animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view tasks.</p>
      </div>
    );
  }

  const isFieldWorker = ["technician", "subcontractor", "staff"].includes(
    currentUser.role,
  );

  // Filter tasks based on current filter states
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (
        statusFilter &&
        statusFilter !== "all-statuses" &&
        task.status !== statusFilter
      ) {
        return false;
      }

      // Category filter
      if (categoryFilter && categoryFilter !== "all-categories") {
        if (!task.category || task.category.id !== categoryFilter) {
          return false;
        }
      }

      // Due date filter
      if (dueFilter && dueFilter !== "all-due-dates") {
        const today = new Date();
        const taskDueDate = task.due_date ? new Date(task.due_date) : null;

        switch (dueFilter) {
          case "overdue":
            if (!taskDueDate || taskDueDate >= today) return false;
            break;
          case "today":
            if (
              !taskDueDate ||
              taskDueDate.toDateString() !== today.toDateString()
            )
              return false;
            break;
          case "this_week":
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            if (
              !taskDueDate ||
              taskDueDate < weekStart ||
              taskDueDate > weekEnd
            )
              return false;
            break;
          case "next_week":
            const nextWeekStart = new Date(today);
            nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
            const nextWeekEnd = new Date(nextWeekStart);
            nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
            if (
              !taskDueDate ||
              taskDueDate < nextWeekStart ||
              taskDueDate > nextWeekEnd
            )
              return false;
            break;
        }
      }

      // Tag filter (if any tags are selected)
      if (tagFilter.length > 0) {
        const taskTagIds = task.tags?.map((tag) => tag.id) || [];
        const hasMatchingTag = tagFilter.some((filterTagId) =>
          taskTagIds.includes(filterTagId),
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [tasks, statusFilter, categoryFilter, dueFilter, tagFilter]);

  // Mobile view for field workers
  if (viewMode === "mobile" || isFieldWorker) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          {!isFieldWorker && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("desktop")}
              className="hidden sm:flex"
            >
              <Monitor className="h-4 w-4 mr-2" />
              Desktop View
            </Button>
          )}
        </div>
        <MobileTaskInterface />
      </div>
    );
  }

  // Desktop view for managers/admins
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Global Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all organizational tasks
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("mobile")}
            className="hidden sm:flex"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Mobile View
          </Button>

          <Button
            onClick={() => setShowQuickCreateModal(true)}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Quick Add
          </Button>

          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dueFilter} onValueChange={setDueFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by due date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-due-dates">All Due Dates</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="today">Due Today</SelectItem>
              <SelectItem value="this_week">Due This Week</SelectItem>
              <SelectItem value="next_week">Due Next Week</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setStatusFilter("all-statuses");
              setCategoryFilter("all-categories");
              setTagFilter([]);
              setDueFilter("all-due-dates");
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Tasks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 bg-white rounded-lg shadow-sm animate-pulse"
            ></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Error loading tasks: {error}</p>
          <Button onClick={fetchAll} className="mt-4">
            Retry
          </Button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No tasks found.</p>
          <Button onClick={() => setShowCreateModal(true)}>
            Create Your First Task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className="card-hover">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {task.title}
                  </h3>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditTask(task);
                        setShowEditModal(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {task.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      className={getStatusColor(task.status)}
                      variant="outline"
                    >
                      {task.status.replace("_", " ")}
                    </Badge>

                    {task.due_date && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {task.category && (
                    <div className="flex items-center text-xs">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: task.category.color }}
                      ></div>
                      <span className="text-gray-600">
                        {task.category.name}
                      </span>
                    </div>
                  )}

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {task.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: tag.color,
                            color: tag.color,
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {task.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{task.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskCreationForm
            categories={categories}
            tags={tags}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchAll();
            }}
            onCancel={() => setShowCreateModal(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={showQuickCreateModal}
        onOpenChange={setShowQuickCreateModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Add Task</DialogTitle>
          </DialogHeader>
          <QuickTaskForm
            onSuccess={() => {
              setShowQuickCreateModal(false);
              fetchAll();
            }}
            onCancel={() => setShowQuickCreateModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    todo: "bg-gray-100 text-gray-800 border-gray-300",
    in_progress: "bg-blue-100 text-blue-800 border-blue-300",
    done: "bg-green-100 text-green-800 border-green-300",
    blocked: "bg-red-100 text-red-800 border-red-300",
  };
  return colors[status] || colors.todo;
}
