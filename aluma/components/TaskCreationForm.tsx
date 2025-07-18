'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Calendar, Clock, Users, Tag, FolderOpen, AlertCircle, Plus, X } from 'lucide-react';

interface TaskCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface TaskTag {
  id: string;
  name: string;
  color: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface TaskCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (taskId: string) => void;
  initialData?: {
    title?: string;
    description?: string;
    category_id?: string;
    assigned_to?: string[];
    tags?: string[];
  };
}

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
  { value: 'blocked', label: 'Blocked' },
];

export default function TaskCreationForm({ 
  isOpen, 
  onClose, 
  onTaskCreated,
  initialData 
}: TaskCreationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Form data
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(initialData?.assigned_to || []);
  
  // Available options
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [tags, setTags] = useState<TaskTag[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [showAssigneeSelector, setShowAssigneeSelector] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      getCurrentUser().then(setCurrentUser);
    }
  }, [isOpen]);

  async function fetchOptions() {
    try {
      // Fetch categories
      const { data: catData } = await supabase
        .from('task_categories')
        .select('*')
        .order('name');
      setCategories(catData || []);

      // Fetch tags
      const { data: tagData } = await supabase
        .from('task_tags')
        .select('*')
        .order('name');
      setTags(tagData || []);

      // Fetch users (only active users)
      const { data: userData } = await supabase
        .from('users')
        .select('id, full_name, email, role')
        .eq('active', true)
        .order('full_name');
      setUsers(userData || []);
    } catch (err) {
      console.error('Error fetching options:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!currentUser) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create the task
      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        category_id: categoryId && categoryId !== 'no-category' ? categoryId : null,
        due_date: dueDate || null,
        estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null,
        notes: notes.trim() || null,
        is_recurring: isRecurring,
        recurrence_pattern: recurrencePattern || null,
        assigned_to: selectedAssignees.length > 0 ? selectedAssignees : null,
        created_by: currentUser.id,
      };

      const { data: task, error: taskError } = await supabase
        .from('global_tasks')
        .insert(taskData)
        .select()
        .single();

      if (taskError) throw taskError;

      // Add tags if any are selected
      if (selectedTags.length > 0 && task) {
        const tagAssignments = selectedTags.map(tagId => ({
          task_id: task.id,
          tag_id: tagId,
        }));

        const { error: tagError } = await supabase
          .from('global_task_tags')
          .insert(tagAssignments);

        if (tagError) {
          console.error('Error adding tags:', tagError);
          // Don't throw here as the task was created successfully
        }
      }

      // Reset form
      resetForm();
      onTaskCreated(task.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
    setCategoryId('no-category');
    setDueDate('');
    setEstimatedHours('');
    setNotes('');
    setIsRecurring(false);
    setRecurrencePattern('');
    setSelectedTags([]);
    setSelectedAssignees([]);
    setError(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function toggleTag(tagId: string) {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  }

  function toggleAssignee(userId: string) {
    setSelectedAssignees(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }

  function removeTag(tagId: string) {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
  }

  function removeAssignee(userId: string) {
    setSelectedAssignees(prev => prev.filter(id => id !== userId));
  }

  const selectedTagObjects = tags.filter(tag => selectedTags.includes(tag.id));
  const selectedAssigneeObjects = users.filter(user => selectedAssignees.includes(user.id));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the task..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Badge className={option.color}>{option.label}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-category">No Category</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tags and Assignees */}
          <div className="space-y-4">
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTagObjects.map(tag => (
                  <Badge 
                    key={tag.id} 
                    className="flex items-center gap-1"
                    style={{ backgroundColor: tag.color, color: 'white' }}
                  >
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => removeTag(tag.id)}
                      className="ml-1 hover:bg-black/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <Dialog open={showTagSelector} onOpenChange={setShowTagSelector}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <Tag className="w-4 h-4 mr-1" />
                      Add Tags
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Tags</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2">
                      {tags.map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`p-2 rounded border text-left ${
                            selectedTags.includes(tag.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Badge 
                            style={{ backgroundColor: tag.color, color: 'white' }}
                            className="mb-1"
                          >
                            {tag.name}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div>
              <Label>Assignees</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedAssigneeObjects.map(user => (
                  <Badge key={user.id} className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {user.full_name}
                    <button
                      type="button"
                      onClick={() => removeAssignee(user.id)}
                      className="ml-1 hover:bg-black/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <Dialog open={showAssigneeSelector} onOpenChange={setShowAssigneeSelector}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <Users className="w-4 h-4 mr-1" />
                      Assign Users
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Assignees</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                      {users.map(user => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => toggleAssignee(user.id)}
                          className={`w-full p-3 rounded border text-left ${
                            selectedAssignees.includes(user.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <Badge variant="outline" className="mt-1">{user.role}</Badge>
                        </button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <FolderOpen className="w-4 h-4" />
              Advanced Options
            </button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimatedHours">Estimated Hours</Label>
                    <Input
                      id="estimatedHours"
                      type="number"
                      step="0.5"
                      min="0"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRecurring"
                    checked={isRecurring}
                    onCheckedChange={(checked) => setIsRecurring(!!checked)}
                  />
                  <Label htmlFor="isRecurring">Recurring Task</Label>
                </div>

                {isRecurring && (
                  <div>
                    <Label htmlFor="recurrencePattern">Recurrence Pattern</Label>
                    <Select value={recurrencePattern} onValueChange={setRecurrencePattern}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 