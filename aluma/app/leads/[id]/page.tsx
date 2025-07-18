'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  suburb: string;
  state: string;
  notes: string;
  current_status: string;
  created_at: string;
  source?: string;
}

interface LeadContact {
  id: string;
  lead_id: string;
  contact_type: string;
  contact_notes: string;
  created_at: string;
}

interface LeadStatusLog {
  id: string;
  lead_id: string;
  status: string;
  changed_at: string;
}

interface Proposal {
  id: string;
  lead_id: string;
  status: string;
  sent_at: string | null;
  details: any;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  'new': 'bg-blue-100 text-blue-800',
  'engaged': 'bg-yellow-100 text-yellow-800',
  'proposal_sent': 'bg-purple-100 text-purple-800',
  'awaiting_response': 'bg-orange-100 text-orange-800',
  'won': 'bg-emerald-100 text-emerald-800',
  'lost': 'bg-red-100 text-red-800',
};

export default function LeadDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [lead, setLead] = useState<Lead | null>(null);
  const [contacts, setContacts] = useState<LeadContact[]>([]);
  const [statusLog, setStatusLog] = useState<LeadStatusLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [proposalsError, setProposalsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      setProposalsLoading(true);
      setProposalsError(null);
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();
      const { data: contactsData, error: contactsError } = await supabase
        .from('lead_contacts')
        .select('*')
        .eq('lead_id', id)
        .order('created_at', { ascending: true });
      const { data: statusLogData, error: statusLogError } = await supabase
        .from('lead_status_log')
        .select('*')
        .eq('lead_id', id)
        .order('changed_at', { ascending: true });
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('proposals')
        .select('*')
        .eq('lead_id', id)
        .order('created_at', { ascending: false });
      if (leadError || contactsError || statusLogError) {
        setError(leadError?.message || contactsError?.message || statusLogError?.message || 'Unknown error');
        setLead(null);
        setContacts([]);
        setStatusLog([]);
      } else {
        setLead(leadData || null);
        setContacts(contactsData || []);
        setStatusLog(statusLogData || []);
      }
      if (proposalsError) {
        setProposalsError(proposalsError.message);
        setProposals([]);
      } else {
        setProposals(proposalsData || []);
      }
      setLoading(false);
      setProposalsLoading(false);
    }
    if (id) fetchAll();
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      {loading ? (
        <div className="p-6 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="p-6 text-red-500">Error: {error}</div>
      ) : !lead ? (
        <div className="p-6 text-gray-500">Lead not found.</div>
      ) : (
        <>
          {/* Lead Info */}
          <Card className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{lead.full_name}</h2>
              <div className="text-gray-600 mb-1">{lead.company}</div>
              <div className="text-gray-500 text-sm mb-1">{lead.email} | {lead.phone}</div>
              <div className="text-gray-500 text-sm mb-1">{lead.suburb}, {lead.state}</div>
              <div className="text-gray-700 mt-2">{lead.notes}</div>
              <div className="text-xs text-gray-400 mt-2">Created: {new Date(lead.created_at).toLocaleDateString()}</div>
            </div>
            <div className="flex flex-col gap-2 min-w-[180px]">
              <div className="font-semibold text-sm mb-1">Status</div>
              <Badge className={`${statusColors[lead.current_status] || 'bg-gray-100 text-gray-800'} text-xs py-1 px-2 w-fit`}>{lead.current_status}</Badge>
            </div>
          </Card>

          {/* Timeline of Engagements */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Engagement Timeline</h3>
            {contacts.length === 0 ? (
              <div className="text-gray-500">No engagements yet.</div>
            ) : (
              <ul className="space-y-2">
                {contacts.map(contact => (
                  <li key={contact.id} className="border-b pb-2 last:border-b-0">
                    <div className="font-medium">{contact.contact_type}</div>
                    <div className="text-gray-700 text-sm mb-1">{contact.contact_notes}</div>
                    <div className="text-xs text-gray-400">{new Date(contact.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Status Changes */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Status Changes</h3>
            {statusLog.length === 0 ? (
              <div className="text-gray-500">No status changes yet.</div>
            ) : (
              <ul className="space-y-2">
                {statusLog.map(log => (
                  <li key={log.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                    <span className="font-medium">{log.status}</span>
                    <span className="text-xs text-gray-400">{new Date(log.changed_at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Proposals Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Proposals</h3>
              <Button variant="default">Generate Proposal</Button>
            </div>
            {proposalsLoading ? (
              <div className="text-gray-400">Loading proposals...</div>
            ) : proposalsError ? (
              <div className="text-red-500">Error: {proposalsError}</div>
            ) : proposals.length === 0 ? (
              <div className="text-gray-500">No proposals yet.</div>
            ) : (
              <ul className="space-y-2">
                {proposals.map(proposal => (
                  <li key={proposal.id} className="border-b pb-2 last:border-b-0 flex items-center justify-between">
                    <div>
                      <span className="font-medium">Status: {proposal.status}</span>
                      {proposal.sent_at && (
                        <span className="ml-4 text-xs text-gray-400">Sent: {new Date(proposal.sent_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">Created: {new Date(proposal.created_at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          {/* Jobs Placeholder */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Jobs</h3>
            <div className="text-gray-400">[Jobs integration coming soon]</div>
          </Card>
        </>
      )}
    </div>
  );
}
