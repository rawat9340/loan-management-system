'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { getRoleDashboardPath } from '@/lib/utils';
import Link from 'next/link';

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(getRoleDashboardPath(user.role));
    }
  }, [isAuthenticated, user, router]);

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-3xl px-6 animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg glow-blue">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          <span className="gradient-text">LoanFlow</span>
        </h1>
        <p className="text-xl text-gray-400 mb-4 font-medium">
          Modern Loan Management System
        </p>
        <p className="text-gray-500 mb-12 max-w-lg mx-auto leading-relaxed">
          A complete end-to-end loan lifecycle platform — from application to disbursement to collection.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl glass border border-white/10 text-gray-300 font-semibold hover:bg-white/5 transition-all duration-200 hover:-translate-y-0.5"
          >
            Create Account
          </Link>
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          {['BRE Validation', 'Multi-Role Dashboard', 'Live SI Calculation', 'Cloudinary Upload', 'JWT Auth'].map((f) => (
            <span key={f} className="px-4 py-1.5 rounded-full glass text-sm text-gray-400 border border-white/5">
              {f}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
