'use client';

import { useEffect, useState } from 'react';
import {
  CreditCard,
  Crown,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SubRow {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  billing_period: string | null;
  amount: number;
  started_at: string;
  expires_at: string | null;
}

interface PayRow {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  created_at: string;
}

interface ProfileMap {
  [key: string]: { email: string; full_name: string };
}

const statusIcons: Record<string, typeof CheckCircle2> = {
  active: CheckCircle2,
  paid: CheckCircle2,
  expired: XCircle,
  cancelled: XCircle,
  failed: XCircle,
  pending: Clock,
};

const statusColors: Record<string, string> = {
  active: 'text-green-600',
  paid: 'text-green-600',
  expired: 'text-red-600',
  cancelled: 'text-red-600',
  failed: 'text-red-600',
  pending: 'text-amber-600',
};

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [payments, setPayments] = useState<PayRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubs: 0,
    plusCount: 0,
    proCount: 0,
  });

  useEffect(() => {
    (async () => {
      const [
        { data: subData },
        { data: payData },
        { data: profileData },
      ] = await Promise.all([
        supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, email, full_name'),
      ]);

      const profileMap: ProfileMap = {};
      (profileData || []).forEach((p) => {
        profileMap[p.id] = { email: p.email, full_name: p.full_name };
      });

      setSubs((subData || []) as SubRow[]);
      setPayments((payData || []) as PayRow[]);
      setProfiles(profileMap);

      const revenue = (payData || [])
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const active = (subData || []).filter((s) => s.status === 'active');
      const plus = active.filter((s) => s.tier === 'plus').length;
      const pro = active.filter((s) => s.tier === 'pro').length;

      setStats({
        totalRevenue: revenue,
        activeSubs: active.length,
        plusCount: plus,
        proCount: pro,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions & Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor revenue, active subscriptions, and payment history.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Revenue</span>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="mt-3 text-2xl font-bold">
            {new Intl.NumberFormat('en-US').format(stats.totalRevenue)} UZS
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active Subscriptions</span>
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-3 text-2xl font-bold">{stats.activeSubs}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Plus Tier</span>
            <Crown className="h-5 w-5 text-amber-600" />
          </div>
          <div className="mt-3 text-2xl font-bold">{stats.plusCount}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pro Tier</span>
            <Crown className="h-5 w-5 text-purple-600" />
          </div>
          <div className="mt-3 text-2xl font-bold">{stats.proCount}</div>
        </div>
      </div>

      {/* Subscriptions table */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h3 className="font-semibold">All Subscriptions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Started</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No subscriptions yet.
                  </td>
                </tr>
              ) : (
                subs.map((sub) => {
                  const StatusIcon = statusIcons[sub.status] || Clock;
                  const profile = profiles[sub.user_id];
                  return (
                    <tr key={sub.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">
                          {profile?.full_name || 'Unnamed'}
                        </div>
                        <div className="text-xs text-muted-foreground">{profile?.email || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'rounded-md px-2 py-0.5 text-xs font-semibold capitalize',
                            sub.tier === 'pro'
                              ? 'bg-purple-100 text-purple-700'
                              : sub.tier === 'plus'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-700'
                          )}
                        >
                          {sub.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('flex items-center gap-1.5 text-xs font-medium capitalize', statusColors[sub.status])}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {sub.amount ? new Intl.NumberFormat('en-US').format(sub.amount) + ' UZS' : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(sub.started_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payments table */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h3 className="font-semibold">Payment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No payments yet.
                  </td>
                </tr>
              ) : (
                payments.map((pay) => {
                  const StatusIcon = statusIcons[pay.status] || Clock;
                  const profile = profiles[pay.user_id];
                  return (
                    <tr key={pay.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">
                          {profile?.full_name || 'Unnamed'}
                        </div>
                        <div className="text-xs text-muted-foreground">{profile?.email || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {new Intl.NumberFormat('en-US').format(pay.amount)} {pay.currency}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm capitalize text-muted-foreground">{pay.provider}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('flex items-center gap-1.5 text-xs font-medium capitalize', statusColors[pay.status])}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {pay.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(pay.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
