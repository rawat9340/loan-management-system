'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Loan, BorrowerProfile } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Truck, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DisbursementDashboard() {
  const { user } = useRequireAuth('DISBURSEMENT');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [disbursingId, setDisbursingId] = useState<string | null>(null);

  const fetchLoans = async () => {
    try {
      const res = await api.get('/loans?limit=50');
      setLoans(res.data.data.loans);
    } catch {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleDisburse = async (loanId: string) => {
    setDisbursingId(loanId);
    try {
      await api.put(`/loans/${loanId}/disburse`);
      toast.success('✅ Loan marked as disbursed!');
      fetchLoans();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to disburse loan');
    } finally {
      setDisbursingId(null);
    }
  };

  if (!user || loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Disbursement Dashboard</h1>
          <p className="text-gray-400 mt-1">Sanctioned loans ready for disbursement</p>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-400 text-sm font-medium border border-yellow-500/20">
          {loans.length} ready
        </span>
      </div>

      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Borrower</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Loan Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tenure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Total Repayment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Sanctioned</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loans.map((loan) => {
                const borrower = loan.borrowerId as BorrowerProfile;
                return (
                  <tr key={loan._id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-white">{borrower?.firstName} {borrower?.lastName}</p>
                      <p className="text-xs text-gray-500 font-mono">{borrower?.pan}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">{formatCurrency(loan.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{loan.tenure} days</td>
                    <td className="px-6 py-4 text-sm text-green-400 font-medium">{formatCurrency(loan.totalRepayment)}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{loan.sanctionedAt ? formatDate(loan.sanctionedAt) : '—'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDisburse(loan._id)}
                        disabled={disbursingId === loan._id}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30 text-sm font-medium transition-all disabled:opacity-50"
                      >
                        {disbursingId === loan._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Truck className="w-4 h-4" />
                        )}
                        Disburse
                      </button>
                    </td>
                  </tr>
                );
              })}
              {loans.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                  No sanctioned loans pending disbursement
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
