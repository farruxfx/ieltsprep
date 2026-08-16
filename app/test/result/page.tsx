'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Circle,
  Clock,
  Target,
  TrendingUp,
  ArrowRight,
  RotateCcw,
  Home,
} from 'lucide-react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from 'recharts';
import { calculateBandScore, cefrFromBand, questions, passages } from '@/lib/data';
import { Button } from '@/components/ui/button';

export default function ResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const correct = parseInt(searchParams.get('correct') || '0');
  const total = parseInt(searchParams.get('total') || '13');
  const accuracy = parseInt(searchParams.get('accuracy') || '0');
  const timeSpent = parseInt(searchParams.get('time') || '0');
  const band = calculateBandScore(correct, total);
  const cefr = cefrFromBand(band);

  const allQuestions = questions['t1'] || [];
  const passage = passages.p1;

  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  const chartData = [{ name: 'Band', value: band, fill: 'hsl(var(--primary))' }];

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container-mw container-px">
        {/* Top result card */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent p-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">Your estimated band</p>
            <div className="mt-4 flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="relative h-40 w-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      data={chartData}
                      innerRadius="70%"
                      outerRadius="100%"
                      startAngle={90}
                      endAngle={90 - (band / 9) * 360}
                    >
                      <PolarAngleAxis type="number" domain={[0, 9]} tick={false} />
                      <RadialBar dataKey="value" cornerRadius={20} fill="hsl(var(--primary))" background={{ fill: 'hsl(var(--muted))' }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">{band.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">out of 9.0</span>
                  </div>
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  CEFR Level: {cefr}
                </div>
              </div>
            </div>
            <p className="mt-6 max-w-md text-sm text-muted-foreground">
              This is an estimated band score based on your practice performance. It is not an
              official IELTS result.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
            <div className="bg-card p-5 text-center">
              <CheckCircle2 className="mx-auto h-5 w-5 text-success" />
              <div className="mt-2 text-2xl font-bold">{correct}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="bg-card p-5 text-center">
              <XCircle className="mx-auto h-5 w-5 text-destructive" />
              <div className="mt-2 text-2xl font-bold">{total - correct}</div>
              <div className="text-xs text-muted-foreground">Incorrect</div>
            </div>
            <div className="bg-card p-5 text-center">
              <Target className="mx-auto h-5 w-5 text-primary" />
              <div className="mt-2 text-2xl font-bold">{accuracy}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="bg-card p-5 text-center">
              <Clock className="mx-auto h-5 w-5 text-warning" />
              <div className="mt-2 text-2xl font-bold">
                {minutes}:{String(seconds).padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground">Time spent</div>
            </div>
          </div>
        </div>

        {/* Question analysis */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Question Analysis</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review each question with the correct answer and explanation.
          </p>

          <div className="mt-6 space-y-4">
            {allQuestions.map((q, i) => {
              const userAnswer = searchParams.get(`q${i}`) || '';
              const correctAnswer = Array.isArray(q.correctAnswer)
                ? q.correctAnswer[0]
                : q.correctAnswer;
              const isCorrect = userAnswer.toLowerCase().trim() === String(correctAnswer).toLowerCase().trim();
              const isUnanswered = !userAnswer;

              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-4 ${
                    isCorrect
                      ? 'border-success/30 bg-success/5'
                      : isUnanswered
                      ? 'border-border bg-muted/30'
                      : 'border-destructive/30 bg-destructive/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                    ) : isUnanswered ? (
                      <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">Q{i + 1}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {q.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium">{q.prompt}</p>

                      <div className="mt-3 space-y-1.5 text-sm">
                        {!isUnanswered && (
                          <div className="flex gap-2">
                            <span className="text-muted-foreground">Your answer:</span>
                            <span className={isCorrect ? 'text-success font-medium' : 'text-destructive font-medium'}>
                              {userAnswer}
                            </span>
                          </div>
                        )}
                        {!isCorrect && (
                          <div className="flex gap-2">
                            <span className="text-muted-foreground">Correct answer:</span>
                            <span className="text-success font-medium">{String(correctAnswer)}</span>
                          </div>
                        )}
                        <div className="mt-2 rounded-lg bg-background/50 p-2.5 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">Explanation: </span>
                          {q.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={() => router.push('/practice')}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Try another test
          </Button>
          <Button onClick={() => router.push('/dashboard')}>
            <Home className="mr-2 h-4 w-4" />
            Back to dashboard
          </Button>
          <Link href="/mistakes">
            <Button variant="outline">
              Review mistakes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
