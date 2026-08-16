'use client';

import Link from 'next/link';
import { ArrowRight, Play, Clock, CheckCircle2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="absolute inset-0 bg-grid mask-fade-b opacity-50" />
      <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="container-mw container-px">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
              <span className="flex h-2 w-2 rounded-full bg-success" />
              AI-powered IELTS preparation
            </Badge>
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Prepare smarter.
            <br />
            <span className="text-primary">Score higher.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
            IELTS imtihoniga real test muhiti, batafsil analytics va professional feedback bilan
            tayyorlaning.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="group w-full sm:w-auto">
                Start practicing free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/practice">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Play className="mr-2 h-4 w-4" />
                Explore tests
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-warning" />
              4.9/5 from 2,000+ students
            </span>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="rounded-2xl border border-border/60 bg-card p-2 shadow-2xl shadow-primary/5">
            <div className="rounded-xl bg-gradient-to-b from-muted/40 to-background p-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-warning/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>00:42:18</span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Reading Passage
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-5/6 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-4/6 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-3/4 rounded bg-muted" />
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Question 7 of 40
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="space-y-2">
                      {['A', 'B', 'C', 'D'].map((opt, i) => (
                        <div
                          key={opt}
                          className={`flex items-center gap-2 rounded-lg border p-2 text-sm ${
                            i === 1
                              ? 'border-primary bg-primary/5'
                              : 'border-border'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded text-xs font-medium ${
                              i === 1
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {opt}
                          </span>
                          <div className="h-3 flex-1 rounded bg-muted/60" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <div className="flex gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-6 rounded-full ${
                        i < 6 ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  Question 7 / 40
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
