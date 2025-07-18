'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Plus, Filter, Tag, Calendar, User, Edit, Trash2 } from 'lucide-react';
import TaskCreationForm from '../../components/TaskCreationForm';
import QuickTaskForm from '../../components/QuickTaskForm';

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
  { label: 'All', value: '' },
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
  { label: 'Blocked', value: 'blocked' },
];

export default function GlobalTasksPage() {
  const [tasks, setTasks] = useState<GlobalTask[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [tags, setTags] = useState<TaskTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [dueFilter, setDueFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTask, setEditTask] = useState<GlobalTask | null>(null);

  // Fetch tasks, categories, tags
  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      // Fetch categories
      const { data: catData } = await supabase.from('task_categories').select('*');
      setCategories(catData || []);
      // Fetch tags
      const { data: tagData } = await supabase.from('task_tags').select('*');
      setTags(tagData || []);
      // Fetch tasks with category and tags
      const { data: taskData } = await supabase
        .from('global_tasks')
        .select('*, task_categories(*), global_task_tags(task_tags(*))')
        .order('due_date', { ascending: true });
      // Map tags and category
      const mapped = (taskData || []).map((t: any) => ({
        ...t,
        category: t.task_categories,
        tags: (t.global_task_tags || []).map((gt: any) => gt.task_tags),
      }));
      setTasks(mapped);
    } catch (err) {
      setError('Failed to fetch tasks');
    }
    setLoading(false);
  }

  // Filtering
  const filteredTasks = tasks.filter(task => {
    const statusOk = !statusFilter || task.status === statusFilter;
    const categoryOk = !categoryFilter || categoryFilter === 'all' || task.category_id === categoryFilter;
    const tagsOk = tagFilter.length === 0 || tagFilter[0] === 'all-tags' || (task.tags && tagFilter.every(tf => task.tags!.some(t => t.id === tf)));
    let dueOk = true;
    if (dueFilter === 'overdue') {
      dueOk = !!(task.due_date && new Date(task.due_date) < new Date());
    } else if (dueFilter === 'today') {
      const today = new Date();
      dueOk = !!(task.due_date && new Date(task.due_date).toDateString() === today.toDateString());
    } else if (dueFilter === 'week') {
      const now = new Date();
      const week = new Date();
      week.setDate(now.getDate() + 7);
      dueOk = !!(task.due_date && new Date(task.due_date) >= now && new Date(task.due_date) <= week);
    }
    return statusOk && categoryOk && tagsOk && dueOk;
  });

  // Sidebar stats
  const statusCounts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const upcomingTasks = tasks.filter(t => t.due_date && new Date(t.due_date) > new Date()).slice(0, 5);

  // Modal handlers
  function openEditModal(task: GlobalTask) {
    setEditTask(task);
    setShowEditModal(true);
  }
  function closeEditModal() {
    setEditTask(null);
    setShowEditModal(false);
  }

  // Task create/edit logic (simplified for brevity)
  // ...

  return (
    <div className="flex max-w-7xl mx-auto py-8 gap-8">
      {/* Sidebar */}
      <aside className="w-72 space-y-6">
        <Card className="p-4">
          <div className="font-semibold mb-2">Task Status</div>
          <ul className="space-y-1">
            {statusOptions.slice(1).map(opt => (
              <li key={opt.value} className="flex items-center gap-2">
                <Badge className="capitalize">{opt.label}</Badge>
                <span className="ml-auto font-mono">{statusCounts[opt.value] || 0}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-4">
          <div className="font-semibold mb-2">Upcoming Tasks</div>
          <ul className="space-y-1">
            {upcomingTasks.length === 0 ? (
              <li className="text-gray-400 text-sm">No upcoming tasks</li>
            ) : (
              upcomingTasks.map(t => (
                <li key={t.id} className="flex items-center gap-2">
                  <span className="truncate flex-1">{t.title}</span>
                  {t.due_date && <span className="text-xs text-gray-500">{new Date(t.due_date).toLocaleDateString()}</span>}
                </li>
              ))
            )}
          </ul>
        </Card>
        <div className="space-y-2">
          <Button className="w-full" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Full Task
          </Button>
          <QuickTaskForm
            isOpen={showQuickCreateModal}
            onClose={() => setShowQuickCreateModal(false)}
            onTaskCreated={(taskId) => {
              setShowQuickCreateModal(false);
              fetchAll();
            }}
            trigger={
              <Button variant="outline" className="w-full" onClick={() => setShowQuickCreateModal(true)}>
                <Plus className="w-4 h-4 mr-1" /> Quick Task
              </Button>
            }
          />
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 space-y-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dueFilter} onValueChange={setDueFilter}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Due" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>
            {/* Tag filter */}
            <Select value={tagFilter[0] || ''} onValueChange={v => setTagFilter(v ? [v] : [])}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Tag" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all-tags">All</SelectItem>
                {tags.map(tag => (
                  <SelectItem key={tag.id} value={tag.id}>{tag.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Task List */}
        <Card className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-6 text-gray-500">Loading tasks...</div>
          ) : error ? (
            <div className="p-6 text-red-500">Error: {error}</div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-6 text-gray-500">No tasks found.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Due</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Tags</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-2 font-medium">{task.title}</td>
                    <td className="px-4 py-2">
                      <Badge className="capitalize">{task.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-4 py-2">{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-2">
                      {task.category ? (
                        <Badge className={`bg-${task.category.color}-100 text-${task.category.color}-800`}>{task.category.name}</Badge>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {task.tags && task.tags.length > 0 ? (
                          task.tags.map(tag => (
                            <Badge key={tag.id} className={`bg-${tag.color}-100 text-${tag.color}-800`}>
                              <Tag className="w-3 h-3 inline mr-1" />{tag.name}
                            </Badge>
                          ))
                        ) : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditModal(task)}><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="destructive"><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </main>
      {/* Full Task Creation Form */}
      <TaskCreationForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTaskCreated={(taskId) => {
          setShowCreateModal(false);
          fetchAll();
        }}
      />
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Title" value={editTask?.title || ''} />
            <Textarea placeholder="Description" value={editTask?.description || ''} />
            {/* Add category, tags, due date, status, assignment fields here */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal}>Cancel</Button>
            <Button>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 