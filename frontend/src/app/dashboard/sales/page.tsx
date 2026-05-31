'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { BorrowerProfile } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Users, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function SalesDashboard() {
  const { user } = useRequireAuth('SALES');
  const [borrowers, setBorrowers] = useState<BorrowerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchBorrowers = async () => {
      try {
        const res = await api.get('/borrower/list?limit=50');
        setBorrowers(res.data.data.borrowers);
      } catch {
        toast.error('Failed to load borrowers');
      } finally {
        setLoading(false);
      }
    };
    fetchBorrowers();
  }, []);

  const filtered = borrowers.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.firstName?.toLowerCase().includes(q) ||
      b.lastName?.toLowerCase().includes(q) ||
      b.pan?.toLowerCase().includes(q) ||
      b.phone?.includes(q)
    );
  });

  if (!user || loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Dashboard</h1>
          <p className="text-gray-400 mt-1">Registered borrowers who have not yet applied</p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20">
          {filtered.length} borrowers
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, PAN, or phone..."
          className="w-full pl-11 pr-4 py-3 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
        />
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">PAN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Employment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">BRE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((b) => (
                <tr key={b._id} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-white">{b.firstName} {b.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-300 font-mono">{b.pan}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{b.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{formatCurrency(b.salary)}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{b.employmentType}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      b.breStatus === 'PASS' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      b.breStatus === 'FAIL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>{b.breStatus}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{formatDate(b.createdAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                  No registered borrowers found
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
