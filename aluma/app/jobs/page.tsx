'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Progress } from '../../components/ui/progress';
import Link from 'next/link';
import { Clock, MapPin, Users, CheckCircle, AlertTriangle } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  lead_id: string;
  scheduled_date: string;
  status: 'scheduled' | 'in_progress' | 'complete' | 'cancelled';
  start_time?: string | null;
  end_time?: string | null;
  leads: { id: string; full_name: string; company: string };
  _task_stats?: {
    total: number;
    completed: number;
    in_progress: number;
    blocked: number;
  };
}

const statusColors: Record<Job['status'], string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  complete: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusFilters = [
  { label: 'All Jobs', value: 'all' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'complete' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch jobs with lead information
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title, lead_id, scheduled_date, status, start_time, end_time, leads(id, full_name, company)')
        .order('scheduled_date', { ascending: false });
      
      if (jobsError) throw jobsError;
      
      // Fetch task statistics for each job
      const jobsWithStats = await Promise.all(
        (jobsData || []).map(async (job) => {
          const { data: taskStats } = await supabase
            .from('job_tasks')
            .select('status')
            .eq('job_id', job.id);
          
          const stats = {
            total: taskStats?.length || 0,
            completed: taskStats?.filter(t => t.status === 'completed').length || 0,
            in_progress: taskStats?.filter(t => t.status === 'in_progress').length || 0,
            blocked: taskStats?.filter(t => t.status === 'blocked').length || 0,
          };
          
          return { 
            ...job, 
            leads: Array.isArray(job.leads) ? job.leads[0] : job.leads,
            _task_stats: stats 
          };
        })
      );
      
      setJobs(jobsWithStats);
    } catch (err) {
      setError('Failed to fetch jobs');
    }
    
    setLoading(false);
  }

  // Real-time subscription
  useEffect(() => {
    let channel: any;
    channel = supabase
      .channel('jobs-dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        fetchJobs();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_tasks' }, () => {
        fetchJobs();
      })
      .subscribe();
    
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  // Filtered jobs
  const filteredJobs = statusFilter === 'all' ? jobs : jobs.filter(job => job.status === statusFilter);

  // Dashboard stats
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.status === 'in_progress').length;
  const completedJobs = jobs.filter(j => j.status === 'complete').length;
  const scheduledJobs = jobs.filter(j => j.status === 'scheduled').length;
  
  // Task stats across all jobs
  const totalTasks = jobs.reduce((sum, job) => sum + (job._task_stats?.total || 0), 0);
  const completedTasks = jobs.reduce((sum, job) => sum + (job._task_stats?.completed || 0), 0);
  const blockedTasks = jobs.filter(job => (job._task_stats?.blocked || 0) > 0).length;

  function getJobProgress(job: Job): number {
    if (!job._task_stats || job._task_stats.total === 0) return 0;
    return Math.round((job._task_stats.completed / job._task_stats.total) * 100);
  }

  function formatDuration(startTime: string, endTime?: string): string {
    if (!startTime) return 'Not started';
    if (!endTime) return 'In progress';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Jobs Dashboard</h1>
        <Button>Create New Job</Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{totalJobs}</div>
              <div className="text-sm text-gray-600">Total Jobs</div>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{activeJobs}</div>
              <div className="text-sm text-gray-600">Active Jobs</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{completedJobs}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{scheduledJobs}</div>
              <div className="text-sm text-gray-600">Scheduled</div>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Task Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Task Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalTasks}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
            <div className="text-sm text-gray-600">Completed Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{blockedTasks}</div>
            <div className="text-sm text-gray-600">Jobs with Blocked Tasks</div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <span className="font-medium">Filter by status:</span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Jobs" />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map(filter => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading jobs...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Error: {error}</div>
      ) : filteredJobs.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <div className="mb-2">No jobs found</div>
          <div className="text-sm">Create your first job to get started</div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map(job => (
            <Card key={job.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <Badge className={statusColors[job.status]}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-gray-600 mb-2">
                    Client: {job.leads.full_name} ({job.leads.company})
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Scheduled: {new Date(job.scheduled_date).toLocaleDateString()}</span>
                    </div>
                                         {job.start_time && (
                       <div className="flex items-center gap-1">
                         <Clock className="w-4 h-4" />
                         <span>Duration: {formatDuration(job.start_time, job.end_time || undefined)}</span>
                       </div>
                     )}
                  </div>
                </div>
                <Link href={`/jobs/${job.id}`}>
                  <Button variant="outline">View Details</Button>
                </Link>
              </div>

              {/* Task Progress */}
              {job._task_stats && job._task_stats.total > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Task Progress</span>
                    <span>{getJobProgress(job)}% complete</span>
                  </div>
                  <Progress value={getJobProgress(job)} className="h-2" />
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{job._task_stats.completed} completed</span>
                    <span>{job._task_stats.in_progress} in progress</span>
                    {job._task_stats.blocked > 0 && (
                      <span className="text-red-600">{job._task_stats.blocked} blocked</span>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                {job.status === 'scheduled' && (
                  <Button size="sm">Start Job</Button>
                )}
                {job.status === 'in_progress' && (
                  <>
                    <Button size="sm" variant="outline">Update Progress</Button>
                    <Button size="sm">Complete Job</Button>
                  </>
                )}
                <Button size="sm" variant="outline">Manage Tasks</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 