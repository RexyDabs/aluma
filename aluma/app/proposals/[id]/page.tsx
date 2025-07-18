'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';

interface Proposal {
  id: string;
  lead_id: string;
  title: string;
  summary?: string;
  status: string;
  version: number;
  created_at: string;
  parent_proposal_id?: string | null;
  project_brief_id?: string | null;
}

interface PriorVersion {
  id: string;
  version: number;
  status: string;
  created_at: string;
}

interface ProjectBrief {
  id: string;
  title: string;
  summary: string;
}

// Proposal Score type
interface ProposalScore {
  id: string;
  proposal_id: string;
  estimated_value: number;
  estimated_labor_hours: number;
  estimated_material_cost: number;
  estimated_gross_margin: number;
  score: number;
  created_at: string;
}

export default function ProposalDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [priorVersions, setPriorVersions] = useState<PriorVersion[]>([]);
  const [projectBrief, setProjectBrief] = useState<ProjectBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [briefDialogOpen, setBriefDialogOpen] = useState(false);
  const [allBriefs, setAllBriefs] = useState<ProjectBrief[]>([]);
  const [briefsLoading, setBriefsLoading] = useState(false);
  const [briefsError, setBriefsError] = useState<string | null>(null);
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [creatingBrief, setCreatingBrief] = useState(false);
  const [newBriefTitle, setNewBriefTitle] = useState('');
  const [newBriefSummary, setNewBriefSummary] = useState('');
  const [editingBrief, setEditingBrief] = useState(false);
  const [editBriefTitle, setEditBriefTitle] = useState('');
  const [editBriefSummary, setEditBriefSummary] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [score, setScore] = useState<ProposalScore | null>(null);
  const [scoreLoading, setScoreLoading] = useState(true);
  const [scoreError, setScoreError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProposal() {
      setLoading(true);
      setError(null);
      // Fetch proposal
      const { data: proposalData, error: proposalError } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', id)
        .single();
      if (proposalError || !proposalData) {
        setError(proposalError?.message || 'Proposal not found');
        setProposal(null);
        setLoading(false);
        return;
      }
      setProposal(proposalData);
      // Fetch prior versions
      const { data: priorData } = await supabase
        .from('proposals')
        .select('id, version, status, created_at')
        .eq('lead_id', proposalData.lead_id)
        .lt('version', proposalData.version)
        .order('version', { ascending: false });
      setPriorVersions(priorData || []);
      // Fetch project brief if linked
      if (proposalData.project_brief_id) {
        const { data: briefData } = await supabase
          .from('project_briefs')
          .select('id, title, summary')
          .eq('id', proposalData.project_brief_id)
          .single();
        setProjectBrief(briefData || null);
      } else {
        setProjectBrief(null);
      }
      setLoading(false);
    }
    async function fetchScore() {
      setScoreLoading(true);
      setScoreError(null);
      const { data, error } = await supabase
        .from('proposal_scores')
        .select('*')
        .eq('proposal_id', id)
        .single();
      if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
        setScoreError(error.message);
        setScore(null);
      } else {
        setScore(data || null);
      }
      setScoreLoading(false);
    }
    if (id) {
      fetchProposal();
      fetchScore();
    }
  }, [id]);

  async function openBriefDialog() {
    setBriefDialogOpen(true);
    setBriefsLoading(true);
    setBriefsError(null);
    const { data, error } = await supabase.from('project_briefs').select('id, title, summary');
    if (error) {
      setBriefsError(error.message);
      setAllBriefs([]);
    } else {
      setAllBriefs(data || []);
    }
    setBriefsLoading(false);
  }

  async function handleLinkBrief() {
    if (!proposal || !selectedBriefId) return;
    setLinking(true);
    const { error } = await supabase
      .from('proposals')
      .update({ project_brief_id: selectedBriefId })
      .eq('id', proposal.id);
    if (!error) {
      // Refetch proposal and brief
      const { data: updatedProposal } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposal.id)
        .single();
      setProposal(updatedProposal || proposal);
      const { data: briefData } = await supabase
        .from('project_briefs')
        .select('id, title, summary')
        .eq('id', selectedBriefId)
        .single();
      setProjectBrief(briefData || null);
      setBriefDialogOpen(false);
    }
    setLinking(false);
  }

  async function handleCreateBrief() {
    if (!newBriefTitle) return;
    setLinking(true);
    const { data, error } = await supabase.from('project_briefs').insert({
      title: newBriefTitle,
      summary: newBriefSummary,
    }).select().single();
    if (!error && data) {
      setAllBriefs([data, ...allBriefs]);
      setSelectedBriefId(data.id);
      setNewBriefTitle('');
      setNewBriefSummary('');
      setCreatingBrief(false);
    }
    setLinking(false);
  }

  async function handleEditBrief() {
    if (!projectBrief) return;
    setEditLoading(true);
    const { error } = await supabase.from('project_briefs').update({
      title: editBriefTitle,
      summary: editBriefSummary,
    }).eq('id', projectBrief.id);
    if (!error) {
      setProjectBrief({ ...projectBrief, title: editBriefTitle, summary: editBriefSummary });
      setEditingBrief(false);
    }
    setEditLoading(false);
  }

  async function handleUnlinkBrief() {
    if (!proposal) return;
    setLinking(true);
    const { error } = await supabase.from('proposals').update({ project_brief_id: null }).eq('id', proposal.id);
    if (!error) {
      setProjectBrief(null);
      setProposal({ ...proposal, project_brief_id: null });
    }
    setLinking(false);
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      {loading ? (
        <div className="p-6 text-gray-500">Loading proposal...</div>
      ) : error ? (
        <div className="p-6 text-red-500">Error: {error}</div>
      ) : !proposal ? (
        <div className="p-6 text-gray-500">Proposal not found.</div>
      ) : (
        <>
          <Card className="p-6 mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{proposal.title || 'Untitled Proposal'}</h2>
                <div className="text-gray-600 mb-1">Status: {proposal.status}</div>
                <div className="text-xs text-gray-500 mb-1">Version {proposal.version} • Created {new Date(proposal.created_at).toLocaleDateString()}</div>
                {proposal.summary && <div className="text-gray-700 mt-2">{proposal.summary}</div>}
              </div>
              <div className="flex flex-col gap-2 min-w-[180px]">
                <Button variant="outline">Edit Proposal</Button>
                <Button variant="outline">Generate PDF</Button>
                <Button variant="default">New Revision</Button>
              </div>
            </div>
          </Card>
          {/* Project Brief */}
          <Card className="p-6 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Project Brief</h3>
              <div className="flex gap-2">
                {projectBrief && (
                  <Button variant="outline" size="sm" onClick={() => {
                    setEditingBrief(true);
                    setEditBriefTitle(projectBrief.title);
                    setEditBriefSummary(projectBrief.summary);
                  }}>Edit</Button>
                )}
                {projectBrief && (
                  <Button variant="destructive" size="sm" onClick={handleUnlinkBrief} disabled={linking}>Unlink</Button>
                )}
                <Button variant="outline" size="sm" onClick={openBriefDialog}>Link Project Brief</Button>
              </div>
            </div>
            {editingBrief ? (
              <form className="space-y-2" onSubmit={e => { e.preventDefault(); handleEditBrief(); }}>
                <Input value={editBriefTitle} onChange={e => setEditBriefTitle(e.target.value)} placeholder="Title" />
                <Textarea value={editBriefSummary} onChange={e => setEditBriefSummary(e.target.value)} placeholder="Summary" rows={3} />
                <div className="flex gap-2">
                  <Button type="submit" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</Button>
                  <Button type="button" variant="outline" onClick={() => setEditingBrief(false)}>Cancel</Button>
                </div>
              </form>
            ) : projectBrief ? (
              <>
                <div className="font-medium">{projectBrief.title}</div>
                <div className="text-gray-700 mt-1">{projectBrief.summary}</div>
              </>
            ) : (
              <div className="text-gray-400">No project brief linked.</div>
            )}
          </Card>
          {/* Link Project Brief Dialog */}
          <Dialog open={briefDialogOpen} onOpenChange={setBriefDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Link Project Brief</DialogTitle>
              </DialogHeader>
              <div className="mb-4">
                <Button variant="outline" size="sm" onClick={() => setCreatingBrief(v => !v)}>{creatingBrief ? 'Cancel' : 'Create New Brief'}</Button>
              </div>
              {creatingBrief && (
                <form className="space-y-2 mb-4" onSubmit={e => { e.preventDefault(); handleCreateBrief(); }}>
                  <Input value={newBriefTitle} onChange={e => setNewBriefTitle(e.target.value)} placeholder="Title" />
                  <Textarea value={newBriefSummary} onChange={e => setNewBriefSummary(e.target.value)} placeholder="Summary" rows={3} />
                  <Button type="submit" disabled={linking}>{linking ? 'Creating...' : 'Create Brief'}</Button>
                </form>
              )}
              {briefsLoading ? (
                <div className="text-gray-500">Loading briefs...</div>
              ) : briefsError ? (
                <div className="text-red-500">Error: {briefsError}</div>
              ) : allBriefs.length === 0 ? (
                <div className="text-gray-400">No project briefs available.</div>
              ) : (
                <div className="space-y-2">
                  {allBriefs.map(brief => (
                    <label key={brief.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="brief"
                        value={brief.id}
                        checked={selectedBriefId === brief.id}
                        onChange={() => setSelectedBriefId(brief.id)}
                        className="accent-blue-500"
                      />
                      <span className="font-medium">{brief.title}</span>
                      <span className="text-xs text-gray-500">{brief.summary}</span>
                    </label>
                  ))}
                </div>
              )}
              <DialogFooter>
                <Button onClick={handleLinkBrief} disabled={!selectedBriefId || linking}>
                  {linking ? 'Linking...' : 'Link Brief'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Prior Versions */}
          {priorVersions.length > 0 && (
            <Card className="p-6 mb-4">
              <h3 className="text-lg font-semibold mb-2">Prior Versions</h3>
              <ul className="space-y-2">
                {priorVersions.map(v => (
                  <li key={v.id} className="border-b pb-2 last:border-b-0 flex items-center justify-between">
                    <span>Version {v.version} ({v.status})</span>
                    <span className="text-xs text-gray-400">{new Date(v.created_at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {/* Proposal Scoring Section */}
          <Card className="p-6 mb-4">
            <h3 className="text-lg font-semibold mb-4">Proposal Scoring</h3>
            {scoreLoading ? (
              <div className="text-gray-500">Loading score...</div>
            ) : scoreError ? (
              <div className="text-red-500">Error: {scoreError}</div>
            ) : !score ? (
              <div className="flex flex-col gap-2 items-start">
                <div className="text-gray-400">No score available for this proposal.</div>
                <Button variant="outline">Add Score</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Estimated Value</div>
                  <div className="font-semibold">${score.estimated_value.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Estimated Labor Hours</div>
                  <div className="font-semibold">{score.estimated_labor_hours}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Estimated Material Cost</div>
                  <div className="font-semibold">${score.estimated_material_cost.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Estimated Gross Margin</div>
                  <div className="font-semibold">${score.estimated_gross_margin.toLocaleString()}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs text-gray-500">Score</div>
                  <div className="font-bold text-2xl">{score.score} / 100</div>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
