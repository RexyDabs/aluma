'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '../../components/ui/popover';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'critical';
  lead_id: string;
  proposal_id: string;
  site_address: string;
  suburb: string;
  state: string;
  postcode: string;
  start_date: string;
  end_date: string;
  leads: { id: string; full_name: string };
  proposals: { id: string; title: string };
}

const statusColors: Record<Project['status'], string> = {
  planning: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};
const priorityColors: Record<Project['priority'], string> = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};
const statusOptions = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];
const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('projects')
        .select('*, leads(id, full_name), proposals(id, title)')
        .order('start_date', { ascending: false });
      if (error) {
        setError(error.message);
        setProjects([]);
      } else {
        setProjects(data || []);
      }
      setLoading(false);
    }
    fetchProjects();
  }, []);

  // Filtered projects
  const filtered = projects.filter(p => {
    const statusOk = statusFilter.length === 0 || statusFilter.includes(p.status);
    const priorityOk = !priorityFilter || priorityFilter === 'all' || p.priority === priorityFilter;
    const dateOk = (!dateRange.start || new Date(p.start_date) >= new Date(dateRange.start)) && (!dateRange.end || new Date(p.end_date) <= new Date(dateRange.end));
    return statusOk && priorityOk && dateOk;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={() => setNewProjectOpen(true)}>New Project</Button>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">Status</Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="flex flex-col gap-2">
              {statusOptions.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statusFilter.includes(opt.value)}
                    onChange={e => setStatusFilter(f => e.target.checked ? [...f, opt.value] : f.filter(v => v !== opt.value))}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {priorityOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Date Range Picker (simple) */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={dateRange.start || ''}
            onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
          />
          <span>to</span>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={dateRange.end || ''}
            onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
          />
        </div>
      </div>
      {/* Projects List */}
      {loading ? (
        <div className="p-6 text-gray-500">Loading projects...</div>
      ) : error ? (
        <div className="p-6 text-red-500">Error: {error}</div>
      ) : filtered.length === 0 ? (
        <div className="p-6 text-gray-500">No projects found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(project => (
            <Card key={project.id} className="p-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[project.status]}`}>{project.status}</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${priorityColors[project.priority]}`}>{project.priority}</span>
              </div>
              <div className="font-bold text-lg mb-1">{project.title}</div>
              <div className="text-sm text-gray-600 mb-1">
                Lead: <Link href={`/leads/${project.leads?.id}`} className="text-blue-600 underline">{project.leads?.full_name}</Link>
              </div>
              <div className="text-sm text-gray-600 mb-1">
                Proposal: <Link href={`/proposals/${project.proposals?.id}`} className="text-blue-600 underline">{project.proposals?.title}</Link>
              </div>
              <div className="text-xs text-gray-500 mb-1">
                {project.site_address}, {project.suburb}, {project.state} {project.postcode}
              </div>
              <div className="text-xs text-gray-500 mb-1">
                {project.start_date && <>Start: {new Date(project.start_date).toLocaleDateString()}</>} {project.end_date && <>• End: {new Date(project.end_date).toLocaleDateString()}</>}
              </div>
              <div className="flex gap-2 mt-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/projects/${project.id}`}>View Details</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* New Project Modal Placeholder */}
      {newProjectOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Project</h2>
            <div className="text-gray-500 mb-4">[Project creation coming soon]</div>
            <Button onClick={() => setNewProjectOpen(false)} className="w-full">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
} 