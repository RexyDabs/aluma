'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../../components/ui/accordion';
import { Button } from '../../../components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '../../../components/ui/popover';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import TaskManager from '../../../components/TaskManager';
import TaskCreator from '../../../components/TaskCreator';

interface Job {
  id: string;
  title: string;
  lead_name: string;
  scheduled_date: string;
  scope_of_works: string;
  materials: { name: string; quantity: number; unit?: string }[];
  staff: { name: string; role: string }[];
  site_address: string;
  access_notes: string;
  hazards: string;
  status: 'scheduled' | 'in_progress' | 'complete';
  start_time?: string | null;
  end_time?: string | null;
}

interface StaffTime {
  id: string;
  job_id: string;
  staff_name: string;
  check_in: string | null;
  check_out: string | null;
}
interface WrapupItem {
  id: string;
  job_id: string;
  item: string;
  checked: boolean;
}
const defaultWrapupItems = [
  'Site cleaned',
  'Tools packed',
  'Client signature',
  'Photos taken',
  'Materials returned',
];

const statusColors: Record<Job['status'], string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  complete: 'bg-green-100 text-green-800',
};

export default function JobDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLoading, setTimeLoading] = useState(false);
  const [editPopoverOpen, setEditPopoverOpen] = useState(false);
  const [editStart, setEditStart] = useState<string | null>(null);
  const [editEnd, setEditEnd] = useState<string | null>(null);
  const [editIncrement, setEditIncrement] = useState<number>(15);
  const [timer, setTimer] = useState<number>(0);
  const [staffTimes, setStaffTimes] = useState<StaffTime[]>([]);
  const [wrapup, setWrapup] = useState<WrapupItem[]>([]);
  const [wrapupLoading, setWrapupLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState<string | null>(null);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [showTaskCreator, setShowTaskCreator] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) {
        setError(error?.message || 'Job not found');
        setJob(null);
      } else {
        setJob(data);
      }
      setLoading(false);
    }
    if (id) fetchJob();
  }, [id]);

  // Real-time subscription for job updates
  useEffect(() => {
    let channel: any;
    if (id) {
      channel = supabase
        .channel('jobs-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs', filter: `id=eq.${id}` }, payload => {
          if (payload.new) setJob(payload.new as Job);
        })
        .subscribe();
    }
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [id]);

  // Live timer for on-site time
  useEffect(() => {
    let interval: any;
    if (job?.status === 'in_progress' && job.start_time && !job.end_time) {
      const start = new Date(job.start_time).getTime();
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [job]);

  // Fetch staffTimes and wrapup on mount
  useEffect(() => {
    async function fetchStaffAndWrapup() {
      if (!id) return;
      const { data: staffData } = await supabase
        .from('staff_times')
        .select('*')
        .eq('job_id', id);
      setStaffTimes(staffData || []);
      const { data: wrapupData } = await supabase
        .from('job_wrapup')
        .select('*')
        .eq('job_id', id);
      if (wrapupData && wrapupData.length > 0) {
        setWrapup(wrapupData);
      } else {
        setWrapup(defaultWrapupItems.map((item, i) => ({ id: `new-${i}`, job_id: id, item, checked: false })));
      }
    }
    fetchStaffAndWrapup();
  }, [id]);

  async function handleStartJob() {
    if (!job) return;
    setTimeLoading(true);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('jobs')
      .update({ status: 'in_progress', start_time: now })
      .eq('id', job.id);
    setTimeLoading(false);
  }

  async function handleEditTime() {
    if (!job) return;
    setTimeLoading(true);
    const updates: any = {};
    if (editStart) updates.start_time = editStart;
    if (editEnd) updates.end_time = editEnd;
    const { error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', job.id);
    setEditPopoverOpen(false);
    setTimeLoading(false);
  }

  async function handleCheckIn(staffName: string) {
    setStaffLoading(staffName);
    const now = new Date().toISOString();
    const existing = staffTimes.find(s => s.staff_name === staffName);
    if (existing && existing.check_in) {
      setStaffLoading(null);
      return;
    }
    if (existing) {
      await supabase.from('staff_times').update({ check_in: now }).eq('id', existing.id);
    } else {
      await supabase.from('staff_times').insert({ job_id: id, staff_name: staffName, check_in: now });
    }
    const { data: staffData } = await supabase.from('staff_times').select('*').eq('job_id', id);
    setStaffTimes(staffData || []);
    setStaffLoading(null);
  }
  async function handleCheckOut(staffName: string) {
    setStaffLoading(staffName);
    const now = new Date().toISOString();
    const existing = staffTimes.find(s => s.staff_name === staffName);
    if (existing && existing.check_out) {
      setStaffLoading(null);
      return;
    }
    if (existing) {
      await supabase.from('staff_times').update({ check_out: now }).eq('id', existing.id);
    }
    const { data: staffData } = await supabase.from('staff_times').select('*').eq('job_id', id);
    setStaffTimes(staffData || []);
    setStaffLoading(null);
  }
  async function handleWrapupCheck(idx: number, checked: boolean) {
    setWrapupLoading(true);
    const item = wrapup[idx];
    if (item.id.startsWith('new-')) {
      // Insert
      const { data, error } = await supabase.from('job_wrapup').insert({ job_id: id, item: item.item, checked }).select().single();
      if (!error && data) {
        const newWrapup = [...wrapup];
        newWrapup[idx] = data;
        setWrapup(newWrapup);
      }
    } else {
      // Update
      await supabase.from('job_wrapup').update({ checked }).eq('id', item.id);
      const newWrapup = [...wrapup];
      newWrapup[idx] = { ...item, checked };
      setWrapup(newWrapup);
    }
    setWrapupLoading(false);
  }
  async function handleCompleteJob() {
    if (!job) return;
    setCompleteLoading(true);
    const now = new Date().toISOString();
    await supabase.from('jobs').update({ status: 'complete', end_time: now }).eq('id', job.id);
    setCompleteLoading(false);
  }

  function formatDuration(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-2 space-y-6">
      {loading ? (
        <div className="p-6 text-gray-500">Loading job...</div>
      ) : error ? (
        <div className="p-6 text-red-500">Error: {error}</div>
      ) : !job ? (
        <div className="p-6 text-gray-500">Job not found.</div>
      ) : (
        <>
          {/* Header */}
          <Card className="p-6 flex flex-col gap-2 mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold mb-1">{job.title}</h1>
                <div className="text-gray-600 text-sm">Lead: {job.lead_name}</div>
                <div className="text-gray-500 text-xs">Scheduled: {new Date(job.scheduled_date).toLocaleString()}</div>
              </div>
              <div className="flex flex-col items-end gap-2 mt-2 md:mt-0">
                <Badge className={statusColors[job.status]}>{job.status.replace('_', ' ')}</Badge>
                {job.status === 'scheduled' && (
                  <Button variant="default" className="ml-2" onClick={handleStartJob} disabled={timeLoading}>
                    {timeLoading ? 'Starting...' : 'Start Job'}
                  </Button>
                )}
                {job.status === 'in_progress' && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">On-site: {formatDuration(timer)}</span>
                    <Popover open={editPopoverOpen} onOpenChange={setEditPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline">Edit Time</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="mb-2 font-semibold">Edit Time</div>
                        <div className="mb-2">
                          <label className="block text-xs mb-1">Start Time</label>
                          <input type="datetime-local" className="border rounded px-2 py-1 w-full" value={editStart || job.start_time?.slice(0, 16) || ''} onChange={e => setEditStart(e.target.value)} />
                        </div>
                        <div className="mb-2">
                          <label className="block text-xs mb-1">End Time</label>
                          <input type="datetime-local" className="border rounded px-2 py-1 w-full" value={editEnd || job.end_time?.slice(0, 16) || ''} onChange={e => setEditEnd(e.target.value)} />
                        </div>
                        <div className="mb-2">
                          <label className="block text-xs mb-1">Increment</label>
                          <Select value={editIncrement.toString()} onValueChange={v => setEditIncrement(Number(v))}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select increment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 min</SelectItem>
                              <SelectItem value="15">15 min</SelectItem>
                              <SelectItem value="30">30 min</SelectItem>
                              <SelectItem value="60">60 min</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleEditTime} disabled={timeLoading} className="w-full mt-2">
                          {timeLoading ? 'Saving...' : 'Save Time'}
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                {job.status === 'in_progress' && job.end_time && (
                  <span className="font-mono text-sm text-green-700">Completed: {job.end_time && new Date(job.end_time).toLocaleString()}</span>
                )}
              </div>
            </div>
          </Card>

          {/* Scope of Works */}
          <Accordion type="single" collapsible defaultValue="scope">
            <AccordionItem value="scope">
              <AccordionTrigger className="font-semibold text-lg">Scope of Works</AccordionTrigger>
              <AccordionContent>
                <div className="text-gray-700 whitespace-pre-line">{job.scope_of_works}</div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Materials & Equipment */}
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Materials & Equipment</h3>
            {job.materials && job.materials.length > 0 ? (
              <ul className="divide-y">
                {job.materials.map((mat, i) => (
                  <li key={i} className="py-2 flex justify-between items-center">
                    <span>{mat.name}</span>
                    <span className="text-sm text-gray-500">{mat.quantity} {mat.unit || ''}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400">No materials listed.</div>
            )}
          </Card>

          {/* Assigned Staff */}
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Assigned Staff</h3>
            {job.staff && job.staff.length > 0 ? (
              <ul className="divide-y">
                {job.staff.map((s, i) => {
                  const staffTime = staffTimes.find(st => st.staff_name === s.name);
                  return (
                    <li key={i} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span>{s.name}</span>
                        <span className="text-sm text-gray-500">{s.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={!!staffTime?.check_in} onCheckedChange={() => handleCheckIn(s.name)} disabled={!!staffTime?.check_in || staffLoading === s.name} />
                        <span className="text-xs">Check In</span>
                        <Checkbox checked={!!staffTime?.check_out} onCheckedChange={() => handleCheckOut(s.name)} disabled={!staffTime?.check_in || !!staffTime?.check_out || staffLoading === s.name} />
                        <span className="text-xs">Check Out</span>
                        {staffTime?.check_in && <span className="text-xs text-gray-400">In: {new Date(staffTime.check_in).toLocaleTimeString()}</span>}
                        {staffTime?.check_out && <span className="text-xs text-gray-400">Out: {new Date(staffTime.check_out).toLocaleTimeString()}</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-gray-400">No staff assigned.</div>
            )}
          </Card>

          {/* Job Site Details */}
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Job Site Details</h3>
            <div className="mb-2">
              <span className="font-medium">Address:</span> {job.site_address}
            </div>
            <div className="mb-2">
              <span className="font-medium">Access Notes:</span> {job.access_notes}
            </div>
            <div className="mb-2">
              <span className="font-medium">Hazards / Considerations:</span> {job.hazards}</div>
          </Card>

          {/* Prestart Checklist Placeholder */}
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Job Wrap-up Checklist</h3>
            <div className="space-y-2">
              {wrapup.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox checked={item.checked} onCheckedChange={checked => handleWrapupCheck(idx, !!checked)} disabled={wrapupLoading} />
                  <span className={item.checked ? 'line-through text-gray-400' : ''}>{item.item}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Job Completion */}
          {job.status !== 'complete' && (
            <Card className="p-6 flex flex-col items-center">
              <Button variant="default" size="lg" onClick={handleCompleteJob} disabled={completeLoading}>
                {completeLoading ? 'Completing...' : 'Complete Job'}
              </Button>
            </Card>
          )}

          {/* Task Management System */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Task Management</h2>
              <Button 
                variant="outline" 
                onClick={() => setShowTaskCreator(!showTaskCreator)}
              >
                {showTaskCreator ? 'Hide Task Creator' : 'Create Tasks'}
              </Button>
            </div>
            
            {showTaskCreator && (
              <TaskCreator
                jobId={job.id}
                scopeOfWorks={job.scope_of_works || ''}
                jobStaff={job.staff || []}
                onTasksCreated={() => {
                  setShowTaskCreator(false);
                  // Refresh tasks in TaskManager
                }}
              />
            )}
            
            <TaskManager 
              jobId={job.id} 
              jobStaff={job.staff || []} 
              scopeOfWorks={job.scope_of_works || ''} 
            />
          </div>
        </>
      )}
    </div>
  );
} 