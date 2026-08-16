'use client';

import Link from 'next/link';
import {
  TrendingUp,
  Target,
  Calendar,
  Clock,
  Flame,
  BookOpen,
  Headphones,
  PenLine,
  Mic,
  ArrowRight,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import { dashboardData, achievements } from '@/lib/data';
import { cn } from '@/lib/utils';

const skillIcons: Record<string, typeof BookOpen> = {
  reading: BookOpen,
  listening: Headphones,
  writing: PenLine,
  speaking: Mic,
};

export default function DashboardPage() {
  const data = dashboardData;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {data.userName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s your IELTS preparation progress.
          </p>
        </div>
        <Link
          href="/practice"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Start practicing
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current band</span>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{data.currentBand.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">/ {data.targetBand.toFixed(1)}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(data.currentBand / 9) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Target band</span>
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{data.targetBand.toFixed(1)}</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {(data.targetBand - data.currentBand).toFixed(1)} bands to go
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Exam countdown</span>
            <Calendar className="h-4 w-4 text-warning" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{data.examCountdownDays}</span>
            <span className="text-sm text-muted-foreground">days</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Keep practicing daily</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current streak</span>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{data.streak}</span>
            <span className="text-sm text-muted-foreground">days</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Don&apos;t break the chain</p>
        </div>
      </div>

      {/* Skill bands */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.skillBands.map((skill) => {
          const Icon = skillIcons[skill.skill] || BookOpen;
          const progress = (skill.band / skill.target) * 100;
          return (
            <div key={skill.skill} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium capitalize">{skill.skill}</div>
                  <div className="text-xs text-muted-foreground">
                    Target: {skill.target.toFixed(1)}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold">{skill.band.toFixed(1)}</span>
                <span
                  className={cn(
                    'text-xs font-medium',
                    skill.band >= skill.target ? 'text-success' : 'text-warning'
                  )}
                >
                  {skill.band >= skill.target ? 'On target' : `${(skill.target - skill.band).toFixed(1)} to go`}
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    skill.band >= skill.target ? 'bg-success' : 'bg-primary'
                  )}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress chart + Weekly activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Progress over time</h3>
              <p className="text-sm text-muted-foreground">Overall band score progression</p>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.progressHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[4, 9]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  ticks={[4, 5, 6, 7, 8, 9]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <ReferenceLine y={data.targetBand} stroke="hsl(var(--primary))" strokeDasharray="5 5" />
                <Line
                  type="monotone"
                  dataKey="overall"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Weekly activity</h3>
              <p className="text-sm text-muted-foreground">Minutes practiced</p>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <Bar
                  dataKey="minutes"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total tests', value: data.totalTests, icon: BookOpen },
          { label: 'Average band', value: data.averageBand.toFixed(1), icon: TrendingUp },
          { label: 'Best band', value: data.bestBand.toFixed(1), icon: Trophy },
          { label: 'Time spent', value: `${data.timeSpentHours}h`, icon: Clock },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Achievements</h3>
            <p className="text-sm text-muted-foreground">
              {achievements.filter((a) => a.unlocked).length} of {achievements.length} unlocked
            </p>
          </div>
          <Trophy className="h-5 w-5 text-warning" />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3',
                achievement.unlocked
                  ? 'border-warning/30 bg-warning/5'
                  : 'border-border bg-muted/30 opacity-60'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  achievement.unlocked ? 'bg-warning/15' : 'bg-muted'
                )}
              >
                {achievement.unlocked ? (
                  <CheckCircle2 className="h-5 w-5 text-warning" />
                ) : (
                  <Trophy className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{achievement.title}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {achievement.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
