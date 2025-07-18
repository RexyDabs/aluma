'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import Link from 'next/link';

interface Proposal {
  id: string;
  lead_id: string;
  title: string;
  status: string;
  version: number;
  is_latest: boolean;
  created_at: string;
}

interface Lead {
  id: string;
  full_name: string;
  company: string;
}

type ProposalGroup = {
  lead: Lead;
  proposals: Proposal[];
};

export default function ProposalsDashboard() {
  const [groups, setGroups] = useState<ProposalGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRevisionLoading, setNewRevisionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProposals() {
      setLoading(true);
      setError(null);
      // Fetch all proposals with their leads
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('proposals')
        .select('id, lead_id, title, status, version, is_latest, created_at, leads(id, full_name, company)')
        .order('created_at', { ascending: false });
      if (proposalsError) {
        setError(proposalsError.message);
        setGroups([]);
        setLoading(false);
        return;
      }
      // Group by lead
      const byLead: Record<string, ProposalGroup> = {};
      (proposalsData || []).forEach((p: any) => {
        const lead: Lead = p.leads;
        if (!byLead[lead.id]) {
          byLead[lead.id] = { lead, proposals: [] };
        }
        byLead[lead.id].proposals.push({
          id: p.id,
          lead_id: p.lead_id,
          title: p.title,
          status: p.status,
          version: p.version,
          is_latest: p.is_latest,
          created_at: p.created_at,
        });
      });
      // Sort proposals by version descending
      Object.values(byLead).forEach(group => {
        group.proposals.sort((a, b) => b.version - a.version);
      });
      setGroups(Object.values(byLead));
      setLoading(false);
    }
    fetchProposals();
  }, []);

  async function handleNewRevision(latest: Proposal) {
    setNewRevisionLoading(latest.id);
    // Copy latest proposal, increment version, set is_latest
    const { data, error } = await supabase.from('proposals').insert({
      lead_id: latest.lead_id,
      title: latest.title,
      status: 'draft',
      version: latest.version + 1,
      is_latest: true,
      created_at: new Date().toISOString(),
    });
    if (!error) {
      // Set previous latest to is_latest = false
      await supabase.from('proposals').update({ is_latest: false }).eq('id', latest.id);
      // Refresh proposals
      const { data: proposalsData } = await supabase
        .from('proposals')
        .select('id, lead_id, title, status, version, is_latest, created_at, leads(id, full_name, company)')
        .order('created_at', { ascending: false });
      // Group by lead
      const byLead: Record<string, ProposalGroup> = {};
      (proposalsData || []).forEach((p: any) => {
        const lead: Lead = p.leads;
        if (!byLead[lead.id]) {
          byLead[lead.id] = { lead, proposals: [] };
        }
        byLead[lead.id].proposals.push({
          id: p.id,
          lead_id: p.lead_id,
          title: p.title,
          status: p.status,
          version: p.version,
          is_latest: p.is_latest,
          created_at: p.created_at,
        });
      });
      Object.values(byLead).forEach(group => {
        group.proposals.sort((a, b) => b.version - a.version);
      });
      setGroups(Object.values(byLead));
    }
    setNewRevisionLoading(null);
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Proposals Dashboard</h1>
      {loading ? (
        <div className="p-6 text-gray-500">Loading proposals...</div>
      ) : error ? (
        <div className="p-6 text-red-500">Error: {error}</div>
      ) : groups.length === 0 ? (
        <div className="p-6 text-gray-500">No proposals found.</div>
      ) : (
        groups.map(group => (
          <Card key={group.lead.id} className="mb-6 p-4">
            <div className="font-semibold text-lg mb-2">{group.lead.full_name} <span className="text-gray-500">({group.lead.company})</span></div>
            <div className="space-y-2">
              {group.proposals.map((proposal, idx) => (
                <div key={proposal.id} className={`rounded border p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 ${proposal.is_latest ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}> 
                  <div>
                    <div className="font-medium text-base flex items-center gap-2">
                      {proposal.title || 'Untitled Proposal'}
                      {proposal.is_latest && <span className="text-xs px-2 py-1 rounded bg-blue-500 text-white">Latest</span>}
                    </div>
                    <div className="text-xs text-gray-500">Version {proposal.version} • {new Date(proposal.created_at).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-600">Status: {proposal.status}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Link href={`/proposals/${proposal.id}`} className="text-blue-600 underline text-sm">View Details</Link>
                    {proposal.is_latest && (
                      <Button size="sm" variant="outline" disabled={newRevisionLoading === proposal.id} onClick={() => handleNewRevision(proposal)}>
                        {newRevisionLoading === proposal.id ? 'Creating...' : 'New Revision'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
