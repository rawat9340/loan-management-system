'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { Loan, BorrowerProfile } from '@/types';
import { formatCurrency, formatDate, getLoanStatusColor } from '@/lib/utils';
import Link from 'next/link';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function BorrowerDashboard() {
  const { user } = useRequireAuth('BORROWER');
  const { borrowerProfile } = useAuthStore();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await api.get('/loans/my-loans');
        setLoans(res.data.data.loans);
      } catch {
        toast.error('Failed to load your loans');
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const latestLoan = loans[0];
  const hasProfile = !!borrowerProfile;
  const hasApplied = borrowerProfile?.status === 'APPLIED';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome, {user.name} 👋</h1>
        <p className="text-gray-400 mt-1">Manage your loan application and track its status</p>
      </div>

      {/* BRE Result Banner */}
      {borrowerProfile && borrowerProfile.breStatus === 'FAIL' && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">Eligibility Check Failed</p>
            <ul className="mt-1 text-xs text-red-300/80 list-disc list-inside space-y-0.5">
              {borrowerProfile.breReasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </div>
      )}

      {borrowerProfile && borrowerProfile.breStatus === 'PASS' && !hasApplied && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-400">You are eligible for a loan!</p>
            <p className="text-xs text-green-300/80 mt-0.5">Complete your loan application to proceed.</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {!hasApplied ? (
          <Link
            href="/apply"
            className="glass-card rounded-2xl p-6 border border-white/5 hover:border-blue-500/30 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Apply for Loan</h3>
            <p className="text-sm text-gray-400 mt-1">Start your loan application today</p>
            <div className="flex items-center gap-1 mt-3 text-blue-400 text-sm font-medium">
              Get Started <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        ) : (
          <div className="glass-card rounded-2xl p-6 border border-blue-500/20">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Application Submitted</h3>
            <p className="text-sm text-gray-400 mt-1">Your loan is under review</p>
            {latestLoan && (
              <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${getLoanStatusColor(latestLoan.status)}`}>
                {latestLoan.status}
              </span>
            )}
          </div>
        )}

        {/* Profile Status */}
        <div className="glass-card rounded-2xl p-6 border border-white/5">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-base font-semibold text-white">Profile Status</h3>
          <p className="text-sm text-gray-400 mt-1">
            {hasProfile ? 'Profile complete' : 'Complete your profile'}
          </p>
          {hasProfile && (
            <div className="mt-3 flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                borrowerProfile?.breStatus === 'PASS'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : borrowerProfile?.breStatus === 'FAIL'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}>
                BRE: {borrowerProfile?.breStatus}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Loan History */}
      {loans.length > 0 && (
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-semibold text-white">Loan History</h2>
          </div>
          <div className="divide-y divide-white/5">
            {loans.map((loan) => (
              <div key={loan._id} className="p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">{formatCurrency(loan.amount)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{loan.tenure} days · {loan.interestRate}% p.a.</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-400">{formatCurrency(loan.totalRepayment)}</p>
                  <p className="text-xs text-gray-500">Total Repayment</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLoanStatusColor(loan.status)}`}>
                    {loan.status}
                  </span>
                  {loan.rejectionReason && (
                    <p className="text-xs text-red-400 mt-1 max-w-xs">{loan.rejectionReason}</p>
                  )}
                </div>
                <div className="text-right text-xs text-gray-500">
                  <div>Applied: {formatDate(loan.appliedAt)}</div>
                  {loan.disbursedAt && <div className="text-purple-400">Disbursed: {formatDate(loan.disbursedAt)}</div>}
                </div>
                <div className="w-full">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Repaid: {formatCurrency(loan.totalPaid)}</span>
                    <span>Remaining: {formatCurrency(Math.max(0, loan.totalRepayment - loan.totalPaid))}</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (loan.totalPaid / loan.totalRepayment) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loans.length === 0 && !loading && (
        <div className="glass-card rounded-2xl p-12 border border-white/5 text-center">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400">No loans yet</h3>
          <p className="text-sm text-gray-500 mt-1">Apply for your first loan to get started</p>
        </div>
      )}
    </div>
  );
}
