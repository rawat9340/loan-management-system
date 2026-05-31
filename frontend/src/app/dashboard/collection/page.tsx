'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRequireAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Loan, BorrowerProfile, Payment } from '@/types';
import { formatCurrency, formatDate, getLoanStatusColor } from '@/lib/utils';
import { paymentSchema, PaymentFormData } from '@/lib/validations/borrower.schema';
import { BarChart3, Loader2, PlusCircle, X, Receipt } from 'lucide-react';
import { toast } from 'sonner';

function PaymentModal({
  loan,
  onSuccess,
  onClose,
}: {
  loan: Loan;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const remaining = Math.max(0, loan.totalRepayment - loan.totalPaid);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: remaining, paymentDate: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/payments', { ...data, loanId: loan._id });
      toast.success(res.data.message);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Record Payment</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Total Repayment</span>
            <span className="text-white font-medium">{formatCurrency(loan.totalRepayment)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Paid So Far</span>
            <span className="text-green-400 font-medium">{formatCurrency(loan.totalPaid)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Remaining</span>
            <span className="text-blue-400 font-semibold">{formatCurrency(remaining)}</span>
          </div>
          <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
              style={{ width: `${Math.min(100, (loan.totalPaid / loan.totalRepayment) * 100)}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Amount (₹)</label>
            <input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              max={remaining}
              className="w-full px-4 py-3 bg-gray-900/60 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
            {errors.amount && <p className="mt-1 text-sm text-red-400">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">UTR Number</label>
            <input
              {...register('utr')}
              type="text"
              placeholder="Unique Transaction Reference"
              className="w-full px-4 py-3 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 uppercase focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
            {errors.utr && <p className="mt-1 text-sm text-red-400">{errors.utr.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Payment Date</label>
            <input
              {...register('paymentDate')}
              type="date"
              className="w-full px-4 py-3 bg-gray-900/60 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Note (optional)</label>
            <input
              {...register('note')}
              type="text"
              placeholder="Any additional notes..."
              className="w-full px-4 py-3 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Receipt className="w-5 h-5" />}
            Record Payment
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CollectionDashboard() {
  const { user } = useRequireAuth('COLLECTION');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

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

  if (!user || loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>;
  }

  const activeLoans = loans.filter((l) => l.status === 'DISBURSED');
  const closedLoans = loans.filter((l) => l.status === 'CLOSED');

  return (
    <>
      {selectedLoan && (
        <PaymentModal
          loan={selectedLoan}
          onSuccess={fetchLoans}
          onClose={() => setSelectedLoan(null)}
        />
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Collection Dashboard</h1>
          <p className="text-gray-400 mt-1">Record payments and manage disbursed loans</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-5 border border-white/5">
            <p className="text-2xl font-bold text-purple-400">{activeLoans.length}</p>
            <p className="text-sm text-gray-400 mt-1">Active Disbursed</p>
          </div>
          <div className="glass-card rounded-xl p-5 border border-white/5">
            <p className="text-2xl font-bold text-green-400">{closedLoans.length}</p>
            <p className="text-sm text-gray-400 mt-1">Closed / Repaid</p>
          </div>
        </div>

        {/* Active Loans */}
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Active Disbursed Loans
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {activeLoans.map((loan) => {
              const borrower = loan.borrowerId as BorrowerProfile;
              const pct = Math.min(100, (loan.totalPaid / loan.totalRepayment) * 100);
              return (
                <div key={loan._id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{borrower?.firstName} {borrower?.lastName}</p>
                      <p className="text-xs text-gray-500 font-mono">{borrower?.pan}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white font-medium">{formatCurrency(loan.amount)}</p>
                      <p className="text-xs text-gray-500">{loan.tenure} days</p>
                    </div>
                    <button
                      onClick={() => setSelectedLoan(loan)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 text-sm font-medium transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Record Payment
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                    <span>Paid: <span className="text-green-400">{formatCurrency(loan.totalPaid)}</span></span>
                    <span>Remaining: <span className="text-blue-400">{formatCurrency(Math.max(0, loan.totalRepayment - loan.totalPaid))}</span></span>
                    <span className="text-gray-500">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {activeLoans.length === 0 && (
              <div className="p-10 text-center text-gray-500">No active disbursed loans</div>
            )}
          </div>
        </div>

        {/* Closed Loans */}
        {closedLoans.length > 0 && (
          <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-green-400">✓</span> Closed Loans
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Borrower</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Total Repaid</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Closed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {closedLoans.map((loan) => {
                    const b = loan.borrowerId as BorrowerProfile;
                    return (
                      <tr key={loan._id} className="hover:bg-white/2">
                        <td className="px-5 py-4 text-sm text-white">{b?.firstName} {b?.lastName}</td>
                        <td className="px-5 py-4 text-sm text-gray-300">{formatCurrency(loan.amount)}</td>
                        <td className="px-5 py-4 text-sm text-green-400 font-medium">{formatCurrency(loan.totalRepayment)}</td>
                        <td className="px-5 py-4 text-sm text-gray-400">{loan.closedAt ? formatDate(loan.closedAt) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
