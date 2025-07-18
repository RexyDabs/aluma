'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Clock, User, AlertTriangle, CheckCircle, Play, Pause } from 'lucide-react';

interface JobTask {
  id: string;
  job_id: string;
  title: string;
  description: string;
  scope_reference: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'normal' | 'high' | 'critical';
  estimated_hours: number;
  due_date: string;
  assigned_to: string[];
  materials_required: any[];
  notes: string;
  created_at: string;
  updated_at: string;
}

interface TaskLog {
  id: string;
  task_id: string;
  staff_name: string;
  log_type: 'start' | 'progress' | 'complete' | 'note' | 'block';
  hours_worked: number;
  notes: string;
  materials_used: any[];
  created_at: string;
}

interface TaskAssignment {
  id: string;
  task_id: string;
  staff_name: string;
  assigned_at: string;
  unassigned_at: string | null;
}

const statusColors: Record<JobTask['status'], string> = {
  not_started: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  blocked: 'bg-red-100 text-red-800',
};

const priorityColors: Record<JobTask['priority'], string> = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-600',
};

const priorityIcons: Record<JobTask['priority'], React.ReactNode> = {
  low: null,
  normal: null,
  high: <AlertTriangle className="w-4 h-4" />,
  critical: <AlertTriangle className="w-4 h-4 text-red-600" />,
};

interface TaskManagerProps {
  jobId: string;
  jobStaff: { name: string; role: string }[];
  scopeOfWorks: string;
}

export default function TaskManager({ jobId, jobStaff, scopeOfWorks }: TaskManagerProps) {
  const [tasks, setTasks] = useState<JobTask[]>([]);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New task dialog
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    scope_reference: '',
    priority: 'normal' as JobTask['priority'],
    estimated_hours: 0,
    due_date: '',
    assigned_to: [] as string[],
    materials_required: [] as any[],
  });
  
  // Task detail dialog
  const [selectedTask, setSelectedTask] = useState<JobTask | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [newLog, setNewLog] = useState({
    log_type: 'note' as TaskLog['log_type'],
    hours_worked: 0,
    notes: '',
    materials_used: [] as any[],
  });

  useEffect(() => {
    fetchTasks();
  }, [jobId]);

  async function fetchTasks() {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('job_tasks')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });
      
      // Fetch task logs
      const { data: logsData, error: logsError } = await supabase
        .from('task_logs')
        .select('*')
        .in('task_id', tasksData?.map(t => t.id) || []);
      
      // Fetch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('task_assignments')
        .select('*')
        .in('task_id', tasksData?.map(t => t.id) || []);
      
      if (tasksError || logsError || assignmentsError) {
        setError(tasksError?.message || logsError?.message || assignmentsError?.message || 'Failed to fetch tasks');
      } else {
        setTasks(tasksData || []);
        setTaskLogs(logsData || []);
        setAssignments(assignmentsData || []);
      }
    } catch (err) {
      setError('Failed to fetch tasks');
    }
    
    setLoading(false);
  }

  // Real-time subscription
  useEffect(() => {
    let channel: any;
    if (jobId) {
      channel = supabase
        .channel('tasks-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'job_tasks', filter: `job_id=eq.${jobId}` }, () => {
          fetchTasks();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'task_logs' }, () => {
          fetchTasks();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'task_assignments' }, () => {
          fetchTasks();
        })
        .subscribe();
    }
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [jobId]);

  async function createTask() {
    if (!newTask.title.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('job_tasks')
        .insert({
          job_id: jobId,
          ...newTask,
          status: 'not_started',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create assignments for assigned staff
      if (newTask.assigned_to.length > 0) {
        await supabase
          .from('task_assignments')
          .insert(newTask.assigned_to.map(staff => ({
            task_id: data.id,
            staff_name: staff,
          })));
      }
      
      setNewTaskOpen(false);
      setNewTask({
        title: '',
        description: '',
        scope_reference: '',
        priority: 'normal',
        estimated_hours: 0,
        due_date: '',
        assigned_to: [],
        materials_required: [],
      });
      fetchTasks();
    } catch (err) {
      setError('Failed to create task');
    }
  }

  async function updateTaskStatus(taskId: string, status: JobTask['status']) {
    try {
      await supabase
        .from('job_tasks')
        .update({ status })
        .eq('id', taskId);
      
      // Add a log entry for status change
      await supabase
        .from('task_logs')
        .insert({
          task_id: taskId,
          staff_name: 'System', // Could be current user
          log_type: status === 'completed' ? 'complete' : status === 'in_progress' ? 'start' : 'progress',
          notes: `Status changed to ${status}`,
        });
      
      fetchTasks();
    } catch (err) {
      setError('Failed to update task status');
    }
  }

  async function addTaskLog(taskId: string) {
    if (!newLog.notes.trim() && newLog.log_type === 'note') return;
    
    try {
      await supabase
        .from('task_logs')
        .insert({
          task_id: taskId,
          staff_name: 'Current User', // Should be actual current user
          ...newLog,
        });
      
      setNewLog({
        log_type: 'note',
        hours_worked: 0,
        notes: '',
        materials_used: [],
      });
      fetchTasks();
    } catch (err) {
      setError('Failed to add log entry');
    }
  }

  function getTaskProgress(task: JobTask): number {
    const logs = taskLogs.filter(log => log.task_id === task.id);
    if (logs.length === 0) return 0;
    
    const completedLogs = logs.filter(log => log.log_type === 'complete');
    if (completedLogs.length > 0) return 100;
    
    const progressLogs = logs.filter(log => log.log_type === 'progress');
    return Math.min(progressLogs.length * 25, 90); // Simple progress calculation
  }

  function getTaskLogs(taskId: string): TaskLog[] {
    return taskLogs
      .filter(log => log.task_id === taskId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  function getTaskAssignments(taskId: string): TaskAssignment[] {
    return assignments.filter(assignment => assignment.task_id === taskId && !assignment.unassigned_at);
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;

  return (
    <div className="space-y-6">
      {/* Task Summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Task Management</h3>
          <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
            <DialogTrigger asChild>
              <Button>Add Task</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Task Title</label>
                  <Input
                    value={newTask.title}
                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    value={newTask.description}
                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Task description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Scope Reference</label>
                  <Input
                    value={newTask.scope_reference}
                    onChange={e => setNewTask({ ...newTask, scope_reference: e.target.value })}
                    placeholder="Reference to scope item"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <Select value={newTask.priority} onValueChange={v => setNewTask({ ...newTask, priority: v as JobTask['priority'] })}>
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
                      value={newTask.estimated_hours}
                      onChange={e => setNewTask({ ...newTask, estimated_hours: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <Input
                    type="datetime-local"
                    value={newTask.due_date}
                    onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assign To</label>
                  <div className="space-y-2">
                    {jobStaff.map(staff => (
                      <div key={staff.name} className="flex items-center space-x-2">
                        <Checkbox
                          checked={newTask.assigned_to.includes(staff.name)}
                          onCheckedChange={checked => {
                            if (checked) {
                              setNewTask({ ...newTask, assigned_to: [...newTask.assigned_to, staff.name] });
                            } else {
                              setNewTask({ ...newTask, assigned_to: newTask.assigned_to.filter(s => s !== staff.name) });
                            }
                          }}
                        />
                        <span className="text-sm">{staff.name} ({staff.role})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewTaskOpen(false)}>Cancel</Button>
                <Button onClick={createTask}>Create Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Task Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalTasks}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{blockedTasks}</div>
            <div className="text-sm text-gray-600">Blocked</div>
          </div>
        </div>
        
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Overall Progress</span>
            <span>{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</span>
          </div>
          <Progress value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} className="h-2" />
        </div>
      </Card>

      {/* Task List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading tasks...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Error: {error}</div>
      ) : tasks.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <div className="mb-2">No tasks created yet</div>
          <div className="text-sm">Create your first task to get started</div>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <Card key={task.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <Badge className={statusColors[task.status]}>{task.status.replace('_', ' ')}</Badge>
                    <Badge className={priorityColors[task.priority]} variant="outline">
                      {priorityIcons[task.priority]}
                      <span className="ml-1">{task.priority}</span>
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {task.estimated_hours > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.estimated_hours}h</span>
                      </div>
                    )}
                    {task.due_date && (
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    )}
                    {getTaskAssignments(task.id).length > 0 && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{getTaskAssignments(task.id).length} assigned</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.status === 'not_started' && (
                    <Button size="sm" onClick={() => updateTaskStatus(task.id, 'in_progress')}>
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </Button>
                  )}
                  {task.status === 'in_progress' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, 'completed')}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, 'blocked')}>
                        <Pause className="w-3 h-3 mr-1" />
                        Block
                      </Button>
                    </>
                  )}
                  {task.status === 'blocked' && (
                    <Button size="sm" onClick={() => updateTaskStatus(task.id, 'in_progress')}>
                      <Play className="w-3 h-3 mr-1" />
                      Resume
                    </Button>
                  )}
                  <Dialog open={taskDetailOpen && selectedTask?.id === task.id} onOpenChange={(open) => {
                    setTaskDetailOpen(open);
                    if (open) setSelectedTask(task);
                    else setSelectedTask(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">Details</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{task.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-sm text-gray-600">{task.description || 'No description'}</p>
                        </div>
                        {task.scope_reference && (
                          <div>
                            <h4 className="font-medium mb-2">Scope Reference</h4>
                            <p className="text-sm text-gray-600">{task.scope_reference}</p>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium mb-2">Progress</h4>
                          <Progress value={getTaskProgress(task)} className="h-2 mb-2" />
                          <span className="text-sm text-gray-600">{getTaskProgress(task)}% complete</span>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Activity Log</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {getTaskLogs(task.id).map(log => (
                              <div key={log.id} className="text-sm border-l-2 border-gray-200 pl-3">
                                <div className="flex justify-between">
                                  <span className="font-medium">{log.staff_name}</span>
                                  <span className="text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                                </div>
                                <div className="text-gray-600">{log.notes}</div>
                                {log.hours_worked > 0 && (
                                  <div className="text-xs text-gray-500">{log.hours_worked}h worked</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Add Log Entry</h4>
                          <div className="space-y-2">
                            <Select value={newLog.log_type} onValueChange={v => setNewLog({ ...newLog, log_type: v as TaskLog['log_type'] })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="note">Note</SelectItem>
                                <SelectItem value="progress">Progress Update</SelectItem>
                                <SelectItem value="block">Block</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              placeholder="Hours worked (optional)"
                              value={newLog.hours_worked}
                              onChange={e => setNewLog({ ...newLog, hours_worked: parseFloat(e.target.value) || 0 })}
                            />
                            <Textarea
                              placeholder="Add notes..."
                              value={newLog.notes}
                              onChange={e => setNewLog({ ...newLog, notes: e.target.value })}
                              rows={3}
                            />
                            <Button onClick={() => addTaskLog(task.id)}>Add Log</Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {/* Task Progress Bar */}
              <div className="mb-2">
                <Progress value={getTaskProgress(task)} className="h-1" />
              </div>
              
              {/* Assigned Staff */}
              {getTaskAssignments(task.id).length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <User className="w-3 h-3" />
                  <span>Assigned: {getTaskAssignments(task.id).map(a => a.staff_name).join(', ')}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 