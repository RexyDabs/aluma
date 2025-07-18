'use client';

import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';

interface Lead {
  id: string;
  full_name: string;
  company: string;
  phone: string;
  email: string;
  current_status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  'new': 'bg-blue-100 text-blue-800',
  'contacted': 'bg-yellow-100 text-yellow-800',
  'qualified': 'bg-green-100 text-green-800',
  'lost': 'bg-red-100 text-red-800',
  'won': 'bg-emerald-100 text-emerald-800',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('leads')
        .select('id, full_name, company, phone, email, current_status, created_at');
      if (error) {
        setError(error.message);
        setLeads([]);
      } else {
        setLeads(data || []);
      }
      setLoading(false);
    }
    fetchLeads();
  }, []);

  // Count by status
  const statusCounts = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.current_status] = (acc[lead.current_status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Leads</h1>
      <div className="mb-4 flex gap-4 flex-wrap">
        <span className="font-medium">Total: {leads.length}</span>
        {Object.entries(statusCounts).map(([status, count]) => (
          <span key={status} className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>{status}: {count}</span>
        ))}
      </div>
      <div className="bg-white rounded shadow p-0 overflow-x-auto">
        {loading ? (
          <div className="p-6 text-gray-500">Loading leads...</div>
        ) : error ? (
          <div className="p-6 text-red-500">Error: {error}</div>
        ) : leads.length === 0 ? (
          <div className="p-6 text-gray-500">No leads found.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Company</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-2 font-medium text-blue-700">
                    <Link href={`/leads/${lead.id}`}>{lead.full_name}</Link>
                  </td>
                  <td className="px-4 py-2">{lead.company}</td>
                  <td className="px-4 py-2">{lead.phone}</td>
                  <td className="px-4 py-2">{lead.email}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[lead.current_status] || 'bg-gray-100 text-gray-800'}`}>{lead.current_status}</span>
                  </td>
                  <td className="px-4 py-2">{new Date(lead.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 