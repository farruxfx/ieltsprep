'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, FileText, Headphones, PenLine, Mic, ArrowRight, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MockExam {
  id: string;
  title: string;
  exam_type: string;
  total_minutes: number;
  description: string;
}

export default function MockExamPage() {
  const [exams, setExams] = useState<MockExam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('mock_exams')
        .select('id, title, exam_type, total_minutes, description')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      setExams(data || []);
      setLoading(false);
    })();
  }, []);

  const sections = [
    { icon: Headphones, label: 'Listening', minutes: 40, color: 'text-green-600' },
    { icon: BookOpen, label: 'Reading', minutes: 60, color: 'text-blue-600' },
    { icon: PenLine, label: 'Writing', minutes: 60, color: 'text-orange-600' },
    { icon: Mic, label: 'Speaking', minutes: 15, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Full IELTS Mock Exam</h1>
        <p className="mt-2 text-muted-foreground">
          Simulate the complete IELTS exam experience with all four sections under real timed conditions.
        </p>
      </div>

      {/* Exam overview card */}
      <div className="rounded-3xl border border-border bg-gradient-to-br from-card to-muted/30 p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">What to expect</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The full mock exam follows the real IELTS format. You will complete all four sections
              in sequence with strict timing. Once you begin, you cannot return to the dashboard until
              the exam is submitted.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Estimated duration: ~2h 45m</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {sections.map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <s.icon className={`h-6 w-6 ${s.color}`} />
                <div>
                  <div className="text-sm font-medium">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.minutes} min</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Available exams */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Available Mock Exams</h3>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl border border-border bg-muted/30" />
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">No mock exams published yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {exams.map((exam) => (
              <div key={exam.id} className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-start justify-between">
                  <Badge variant={exam.exam_type === 'academic' ? 'default' : 'secondary'} className="capitalize">
                    {exam.exam_type}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {exam.total_minutes} min
                  </div>
                </div>
                <h4 className="mt-3 text-lg font-semibold">{exam.title}</h4>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{exam.description}</p>
                <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
                  <div className="flex items-center gap-3">
                    {sections.map((s) => (
                      <s.icon key={s.label} className={`h-4 w-4 ${s.color}`} />
                    ))}
                  </div>
                  <Link href={`/mock-exam/${exam.id}`} className="ml-auto">
                    <Button>
                      Begin Exam
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
