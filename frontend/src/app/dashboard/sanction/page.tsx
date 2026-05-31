'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRequireAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Loan, BorrowerProfile } from '@/types';
import { formatCurrency, formatDate, getLoanStatusColor } from '@/lib/utils';
import { rejectLoanSchema, RejectLoanFormData } from '@/lib/validations/borrower.schema';
import { Shield, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

function RejectModal({
  loanId,
  onConfirm,
  onCancel,
}: {
  loanId: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<RejectLoanFormData>({
    resolver: zodResolver(rejectLoanSchema),
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Reject Loan Application</h3>
        </div>
        <form onSubmit={handleSubmit((d) => onConfirm(d.reason))}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Rejection Reason</label>
            <textarea
              {...register('reason')}
              rows={4}
              placeholder="Provide a detailed reason for rejection..."
              className="w-full px-4 py-3 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all resize-none"
            />
            {errors.reason && <p className="mt-1 text-sm text-red-400">{errors.reason.message}</p>}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-white/5 transition-all text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-all"
            >
              Reject Loan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SanctionDashboard() {
  const { user } = useRequireAuth('SANCTION');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModalLoanId, setRejectModalLoanId] = useState<string | null>(null);

  const fetchLoans = async () => {
    try {
      const res = await api.get('/loans?limit=50');
      setLoans(res.data.data.loans);
    } catch {
      toast.error('Failed to load loan applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleApprove = async (loanId: string) => {
    setActionLoading(loanId + '-approve');
    try {
      await api.put(`/loans/${loanId}/approve`);
      toast.success('✅ Loan approved and sanctioned!');
      fetchLoans();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to approve loan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (loanId: string, reason: string) => {
    setActionLoading(loanId + '-reject');
    try {
      await api.put(`/loans/${loanId}/reject`, { reason });
      toast.success('Loan rejected.');
      setRejectModalLoanId(null);
      fetchLoans();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to reject loan');
    } finally {
      setActionLoading(null);
    }
  };

  if (!user || loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>;
  }

  return (
    <>
      {rejectModalLoanId && (
        <RejectModal
          loanId={rejectModalLoanId}
          onConfirm={(reason) => handleReject(rejectModalLoanId, reason)}
          onCancel={() => setRejectModalLoanId(null)}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Sanction Dashboard</h1>
            <p className="text-gray-400 mt-1">Review and action pending loan applications</p>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20">
            {loans.length} pending
          </span>
        </div>

        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Borrower</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tenure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">SI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">BRE</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Applied</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loans.map((loan) => {
                  const borrower = loan.borrowerId as BorrowerProfile;
                  const isActing = actionLoading?.startsWith(loan._id);
                  return (
                    <tr key={loan._id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-white">{borrower?.firstName} {borrower?.lastName}</p>
                        <p className="text-xs text-gray-500 font-mono">{borrower?.pan}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(borrower?.salary || 0)}/mo</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-white">{formatCurrency(loan.amount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{loan.tenure}d</td>
                      <td className="px-6 py-4 text-sm text-yellow-400">{formatCurrency(loan.simpleInterest)}</td>
                      <td className="px-6 py-4 text-sm text-green-400 font-medium">{formatCurrency(loan.totalRepayment)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          borrower?.breStatus === 'PASS' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>{borrower?.breStatus}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">{formatDate(loan.appliedAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(loan._id)}
                            disabled={!!isActing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30 text-xs font-medium transition-all disabled:opacity-50"
                          >
                            {isActing && actionLoading?.endsWith('approve') ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectModalLoanId(loan._id)}
                            disabled={!!isActing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 text-xs font-medium transition-all disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {loans.length === 0 && (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                    No pending applications
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
