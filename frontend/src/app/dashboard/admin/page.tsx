'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { DashboardStats, Loan, BorrowerProfile } from '@/types';
import { formatCurrency, formatDate, getLoanStatusColor } from '@/lib/utils';
import { Users, CreditCard, TrendingUp, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useRequireAuth('ADMIN');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [borrowers, setBorrowers] = useState<BorrowerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, loansRes, borrowersRes] = await Promise.all([
          api.get('/loans/admin/stats'),
          api.get('/loans?limit=20'),
          api.get('/borrower/all?limit=20'),
        ]);
        setStats(statsRes.data.data.stats);
        setLoans(loansRes.data.data.loans);
        setBorrowers(borrowersRes.data.data.borrowers);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Complete overview of the loan management system</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Borrowers"
            value={stats.totalBorrowers}
            icon={<Users className="w-6 h-6 text-blue-400" />}
            color="bg-blue-500/10"
          />
          <StatCard
            label="Total Loans"
            value={stats.loans.total}
            icon={<CreditCard className="w-6 h-6 text-purple-400" />}
            color="bg-purple-500/10"
          />
          <StatCard
            label="Amount Disbursed"
            value={formatCurrency(stats.totalDisbursedAmount)}
            icon={<TrendingUp className="w-6 h-6 text-green-400" />}
            color="bg-green-500/10"
          />
          <StatCard
            label="Closed Loans"
            value={stats.loans.closed}
            icon={<CheckCircle className="w-6 h-6 text-emerald-400" />}
            color="bg-emerald-500/10"
          />
        </div>
      )}

      {/* Loan Status Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Applied', value: stats.loans.applied, color: 'text-blue-400' },
            { label: 'Sanctioned', value: stats.loans.sanctioned, color: 'text-yellow-400' },
            { label: 'Disbursed', value: stats.loans.disbursed, color: 'text-purple-400' },
            { label: 'Rejected', value: stats.loans.rejected, color: 'text-red-400' },
          ].map((item) => (
            <div key={item.label} className="glass-card rounded-xl p-4 text-center border border-white/5">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-400 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Loans Table */}
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            Recent Loans
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Borrower</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tenure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Repayment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loans.map((loan) => {
                const borrower = loan.borrowerId as BorrowerProfile;
                return (
                  <tr key={loan._id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {borrower?.firstName ? `${borrower.firstName} ${borrower.lastName}` : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">{borrower?.pan}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-medium">{formatCurrency(loan.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{loan.tenure} days</td>
                    <td className="px-6 py-4 text-sm text-green-400 font-medium">{formatCurrency(loan.totalRepayment)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getLoanStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{formatDate(loan.appliedAt)}</td>
                  </tr>
                );
              })}
              {loans.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No loans found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Borrowers Table */}
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Recent Borrowers
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">PAN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">BRE Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Application</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {borrowers.map((b) => (
                <tr key={b._id} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-white">{b.firstName} {b.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-300 font-mono">{b.pan}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{formatCurrency(b.salary)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      b.breStatus === 'PASS' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      b.breStatus === 'FAIL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {b.breStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      b.status === 'APPLIED'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{formatDate(b.createdAt)}</td>
                </tr>
              ))}
              {borrowers.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No borrowers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
