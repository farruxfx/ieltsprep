'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Crown,
  TrendingUp,
  FileText,
  CreditCard,
  Activity,
  BookOpen,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  totalTests: number;
  totalAttempts: number;
  totalRevenue: number;
  activeSubscriptions: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    premiumUsers: 0,
    totalTests: 0,
    totalAttempts: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<{ id: string; email: string; full_name: string; created_at: string }[]>([]);

  useEffect(() => {
    (async () => {
      const [
        { count: totalUsers },
        { count: totalTests },
        { count: totalAttempts },
        { data: subs },
        { data: payments },
        { data: profiles },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('tests').select('*', { count: 'exact', head: true }),
        supabase.from('attempts').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('tier, status'),
        supabase.from('payments').select('amount, status'),
        supabase.from('profiles').select('id, email, full_name, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      const premiumCount = (subs || []).filter(
        (s) => (s.tier === 'plus' || s.tier === 'pro') && s.status === 'active'
      ).length;
      const activeSubs = (subs || []).filter((s) => s.status === 'active').length;
      const revenue = (payments || [])
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      setStats({
        totalUsers: totalUsers || 0,
        premiumUsers: premiumCount,
        totalTests: totalTests || 0,
        totalAttempts: totalAttempts || 0,
        totalRevenue: revenue,
        activeSubscriptions: activeSubs,
      });
      setRecentUsers((profiles || []) as typeof recentUsers);
      setLoading(false);
    })();
  }, []);

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Premium Subscribers',
      value: stats.premiumUsers,
      icon: Crown,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Total Revenue',
      value: new Intl.NumberFormat('en-US').format(stats.totalRevenue) + ' UZS',
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Total Tests',
      value: stats.totalTests,
      icon: FileText,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Test Attempts',
      value: stats.totalAttempts,
      icon: Activity,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      label: 'Active Subscriptions',
      value: stats.activeSubscriptions,
      icon: CreditCard,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform statistics and quick actions.
          </p>
        </div>
        <Link href="/admin/exam-library">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Test
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', stat.bg)}>
                <stat.icon className={cn('h-5 w-5', stat.color)} />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/exam-library"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Exam Library</h3>
            <p className="text-sm text-muted-foreground">Manage all tests and questions</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href="/admin/users"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">User Management</h3>
            <p className="text-sm text-muted-foreground">View and manage all users</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href="/admin/subscriptions"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
            <CreditCard className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Subscriptions</h3>
            <p className="text-sm text-muted-foreground">View payments and subscriptions</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Recent users */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Recent Users</h3>
          <Link href="/admin/users" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {recentUsers.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No users yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-bold">
                  {(u.full_name || u.email || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium">
                    {u.full_name || 'Unnamed'}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
