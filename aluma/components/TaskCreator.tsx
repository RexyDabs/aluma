'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Plus, Wand2 } from 'lucide-react';

interface TaskCreatorProps {
  jobId: string;
  scopeOfWorks: string;
  jobStaff: { name: string; role: string }[];
  onTasksCreated: () => void;
}

interface SuggestedTask {
  title: string;
  description: string;
  estimated_hours: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  assigned_to: string[];
}

const commonTasks = [
  {
    title: 'Site Setup & Safety',
    description: 'Set up work area, safety barriers, and equipment',
    estimated_hours: 1,
    priority: 'high' as const,
    keywords: ['setup', 'safety', 'barriers', 'equipment']
  },
  {
    title: 'Materials & Tools Check',
    description: 'Verify all required materials and tools are available',
    estimated_hours: 0.5,
    priority: 'high' as const,
    keywords: ['materials', 'tools', 'check', 'verify']
  },
  {
    title: 'Site Cleanup',
    description: 'Clean work area and dispose of waste materials',
    estimated_hours: 1,
    priority: 'normal' as const,
    keywords: ['clean', 'cleanup', 'dispose', 'waste']
  },
  {
    title: 'Quality Inspection',
    description: 'Inspect completed work for quality and compliance',
    estimated_hours: 0.5,
    priority: 'high' as const,
    keywords: ['inspect', 'quality', 'compliance', 'check']
  },
  {
    title: 'Client Handover',
    description: 'Demonstrate completed work to client and get sign-off',
    estimated_hours: 0.5,
    priority: 'normal' as const,
    keywords: ['handover', 'client', 'demonstrate', 'sign-off']
  }
];

export default function TaskCreator({ jobId, scopeOfWorks, jobStaff, onTasksCreated }: TaskCreatorProps) {
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [customTasks, setCustomTasks] = useState<SuggestedTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [newCustomTask, setNewCustomTask] = useState<SuggestedTask>({
    title: '',
    description: '',
    estimated_hours: 0,
    priority: 'normal',
    assigned_to: []
  });

  // Auto-suggest tasks based on scope of works
  React.useEffect(() => {
    if (scopeOfWorks) {
      const scopeLower = scopeOfWorks.toLowerCase();
      const commonSuggestions = commonTasks
        .filter(task => 
          task.keywords.some(keyword => scopeLower.includes(keyword))
        )
        .map(task => ({
          title: task.title,
          description: task.description,
          estimated_hours: task.estimated_hours,
          priority: task.priority,
          assigned_to: []
        }));
      
      const scopeSpecificSuggestions: SuggestedTask[] = [];
      
      // Add scope-specific suggestions
      if (scopeLower.includes('electrical') || scopeLower.includes('wiring')) {
        scopeSpecificSuggestions.push({
          title: 'Electrical Testing',
          description: 'Test all electrical connections and circuits',
          estimated_hours: 1,
          priority: 'high',
          assigned_to: []
        });
      }
      
      if (scopeLower.includes('plumbing') || scopeLower.includes('pipe')) {
        scopeSpecificSuggestions.push({
          title: 'Pressure Testing',
          description: 'Test plumbing system for leaks and pressure',
          estimated_hours: 1,
          priority: 'high',
          assigned_to: []
        });
      }
      
      if (scopeLower.includes('carpentry') || scopeLower.includes('wood')) {
        scopeSpecificSuggestions.push({
          title: 'Final Assembly',
          description: 'Complete final assembly and finishing touches',
          estimated_hours: 2,
          priority: 'normal',
          assigned_to: []
        });
      }
      
      setSuggestedTasks([...commonSuggestions, ...scopeSpecificSuggestions]);
    }
  }, [scopeOfWorks]);

  async function createSelectedTasks() {
    if (selectedTasks.size === 0 && customTasks.length === 0) return;
    
    setLoading(true);
    
    try {
      const tasksToCreate = [
        ...Array.from(selectedTasks).map(index => suggestedTasks[index]),
        ...customTasks
      ];
      
      for (const task of tasksToCreate) {
        // Create the task
        const { data: taskData, error: taskError } = await supabase
          .from('job_tasks')
          .insert({
            job_id: jobId,
            title: task.title,
            description: task.description,
            priority: task.priority,
            estimated_hours: task.estimated_hours,
            status: 'not_started',
          })
          .select()
          .single();
        
        if (taskError) throw taskError;
        
        // Create assignments for assigned staff
        if (task.assigned_to.length > 0) {
          await supabase
            .from('task_assignments')
            .insert(task.assigned_to.map(staff => ({
              task_id: taskData.id,
              staff_name: staff,
            })));
        }
      }
      
      setSelectedTasks(new Set());
      setCustomTasks([]);
      setNewCustomTask({
        title: '',
        description: '',
        estimated_hours: 0,
        priority: 'normal',
        assigned_to: []
      });
      setShowCustomForm(false);
      onTasksCreated();
    } catch (error) {
      console.error('Failed to create tasks:', error);
    }
    
    setLoading(false);
  }

  function addCustomTask() {
    if (!newCustomTask.title.trim()) return;
    
    setCustomTasks([...customTasks, { ...newCustomTask }]);
    setNewCustomTask({
      title: '',
      description: '',
      estimated_hours: 0,
      priority: 'normal',
      assigned_to: []
    });
    setShowCustomForm(false);
  }

  function removeCustomTask(index: number) {
    setCustomTasks(customTasks.filter((_, i) => i !== index));
  }

  function toggleTaskSelection(index: number) {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTasks(newSelected);
  }

  const priorityColors = {
    low: 'bg-gray-100 text-gray-600',
    normal: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    critical: 'bg-red-100 text-red-600',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Task Creator</h3>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setShowCustomForm(!showCustomForm)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Custom Task
        </Button>
      </div>

      {/* Custom Task Form */}
      {showCustomForm && (
        <Card className="p-4 mb-4 border-dashed">
          <h4 className="font-medium mb-3">Create Custom Task</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Task Title</label>
              <Input
                value={newCustomTask.title}
                onChange={e => setNewCustomTask({ ...newCustomTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={newCustomTask.description}
                onChange={e => setNewCustomTask({ ...newCustomTask, description: e.target.value })}
                placeholder="Task description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <Select 
                  value={newCustomTask.priority} 
                  onValueChange={v => setNewCustomTask({ ...newCustomTask, priority: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Est. Hours</label>
                <Input
                  type="number"
                  value={newCustomTask.estimated_hours}
                  onChange={e => setNewCustomTask({ ...newCustomTask, estimated_hours: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addCustomTask}>Add Task</Button>
              <Button size="sm" variant="outline" onClick={() => setShowCustomForm(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Custom Tasks List */}
      {customTasks.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Custom Tasks</h4>
          <div className="space-y-2">
            {customTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{task.title}</span>
                    <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <span className="text-xs text-gray-500">{task.estimated_hours}h estimated</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => removeCustomTask(index)}>Remove</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Tasks */}
      {suggestedTasks.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 className="w-4 h-4 text-blue-500" />
            <h4 className="font-medium">Suggested Tasks</h4>
          </div>
          <div className="space-y-2">
            {suggestedTasks.map((task, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded hover:bg-gray-50">
                <Checkbox
                  checked={selectedTasks.has(index)}
                  onCheckedChange={() => toggleTaskSelection(index)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{task.title}</span>
                    <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <span className="text-xs text-gray-500">{task.estimated_hours}h estimated</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Tasks Button */}
      {(selectedTasks.size > 0 || customTasks.length > 0) && (
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-gray-600">
            {selectedTasks.size + customTasks.length} task(s) selected
          </span>
          <Button onClick={createSelectedTasks} disabled={loading}>
            {loading ? 'Creating...' : `Create ${selectedTasks.size + customTasks.length} Task(s)`}
          </Button>
        </div>
      )}

      {suggestedTasks.length === 0 && customTasks.length === 0 && !showCustomForm && (
        <div className="text-center py-8 text-gray-500">
          <Wand2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <div>No tasks suggested yet</div>
          <div className="text-sm">Add a scope of works to get task suggestions</div>
        </div>
      )}
    </Card>
  );
} 