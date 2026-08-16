'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Clock, ChevronRight, Star, Filter } from 'lucide-react';
import { tests } from '@/lib/data';
import type { TestType, Difficulty } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const skillFilters: { label: string; value: TestType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Reading', value: 'reading' },
  { label: 'Listening', value: 'listening' },
  { label: 'Writing', value: 'writing' },
  { label: 'Speaking', value: 'speaking' },
  { label: 'Mock Exam', value: 'mock' },
];

const difficultyFilters: { label: string; value: Difficulty | 'all' }[] = [
  { label: 'All levels', value: 'all' },
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
];

const statusFilters = [
  { label: 'All', value: 'all' as const },
  { label: 'Completed', value: 'completed' as const },
  { label: 'Not started', value: 'not_started' as const },
];

const skillColors: Record<string, string> = {
  reading: 'bg-blue-100 text-blue-700',
  listening: 'bg-green-100 text-green-700',
  writing: 'bg-orange-100 text-orange-700',
  speaking: 'bg-purple-100 text-purple-700',
  mock: 'bg-red-100 text-red-700',
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

export default function PracticePage() {
  const searchParams = useSearchParams();
  const initialSkill = (searchParams.get('skill') as TestType) || 'all';

  const [skillFilter, setSkillFilter] = useState<TestType | 'all'>(initialSkill);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'not_started'>('all');
  const [search, setSearch] = useState('');

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      if (skillFilter !== 'all' && test.skill !== skillFilter) return false;
      if (difficultyFilter !== 'all' && test.difficulty !== difficultyFilter) return false;
      if (statusFilter !== 'all' && test.status !== statusFilter) return false;
      if (search && !test.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [skillFilter, difficultyFilter, statusFilter, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Test Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse and start practice tests across all IELTS skills.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Skill</span>
          <div className="flex flex-wrap gap-2">
            {skillFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSkillFilter(filter.value)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  skillFilter === filter.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4" />
          <span className="text-sm font-medium">Difficulty</span>
          <div className="flex flex-wrap gap-2">
            {difficultyFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setDifficultyFilter(filter.value)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  difficultyFilter === filter.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4" />
          <span className="text-sm font-medium">Status</span>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  statusFilter === filter.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Test cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTests.map((test) => (
          <Link
            key={test.id}
            href={`/test/${test.id}`}
            className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'rounded-md px-2 py-0.5 text-xs font-semibold capitalize',
                    skillColors[test.skill]
                  )}
                >
                  {test.skill}
                </span>
                <span
                  className={cn(
                    'rounded-md px-2 py-0.5 text-xs font-semibold capitalize',
                    difficultyColors[test.difficulty]
                  )}
                >
                  {test.difficulty}
                </span>
              </div>
              {test.bestScore !== undefined && (
                <div className="flex items-center gap-1 text-xs font-medium text-warning">
                  <Star className="h-3.5 w-3.5 fill-warning" />
                  {test.bestScore.toFixed(1)}
                </div>
              )}
            </div>

            <h3 className="mt-3 font-semibold leading-snug">{test.title}</h3>
            <p className="mt-1.5 flex-1 text-sm text-muted-foreground line-clamp-2">
              {test.description}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {test.estimatedMinutes} min
                </span>
                <span>{test.questionCount} questions</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                {test.status === 'completed' ? 'Review' : 'Start'}
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No tests found matching your filters.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSkillFilter('all');
              setDifficultyFilter('all');
              setStatusFilter('all');
              setSearch('');
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
