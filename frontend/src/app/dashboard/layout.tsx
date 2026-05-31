'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, FileText, LogOut, Menu, X, Users, CreditCard,
  Shield, Truck, BarChart3, ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { getRoleLabel } from '@/lib/utils';

const roleNavItems: Record<string, { label: string; href: string; icon: React.ReactNode }[]> = {
  ADMIN: [
    { label: 'Dashboard', href: '/dashboard/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'All Borrowers', href: '/dashboard/admin#borrowers', icon: <Users className="w-5 h-5" /> },
    { label: 'All Loans', href: '/dashboard/admin#loans', icon: <CreditCard className="w-5 h-5" /> },
  ],
  BORROWER: [
    { label: 'Dashboard', href: '/dashboard/borrower', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Apply for Loan', href: '/apply', icon: <FileText className="w-5 h-5" /> },
  ],
  SALES: [
    { label: 'Dashboard', href: '/dashboard/sales', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Registered Borrowers', href: '/dashboard/sales', icon: <Users className="w-5 h-5" /> },
  ],
  SANCTION: [
    { label: 'Dashboard', href: '/dashboard/sanction', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Pending Applications', href: '/dashboard/sanction', icon: <Shield className="w-5 h-5" /> },
  ],
  DISBURSEMENT: [
    { label: 'Dashboard', href: '/dashboard/disbursement', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Sanctioned Loans', href: '/dashboard/disbursement', icon: <Truck className="w-5 h-5" /> },
  ],
  COLLECTION: [
    { label: 'Dashboard', href: '/dashboard/collection', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Active Loans', href: '/dashboard/collection', icon: <BarChart3 className="w-5 h-5" /> },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = user ? (roleNavItems[user.role] || []) : [];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 glass border-r border-white/5 z-50 transform transition-transform duration-300 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold gradient-text">LoanFlow</span>
          </Link>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{getRoleLabel(user.role)}</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-gray-500 group-hover:text-blue-400 transition-colors">
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex-1 lg:flex-none">
            <h2 className="text-sm font-medium text-gray-400 hidden lg:block">
              {getRoleLabel(user.role)} Portal
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {user.role}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
