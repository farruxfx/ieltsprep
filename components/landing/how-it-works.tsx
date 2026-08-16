'use client';

import { Monitor, Brain, TrendingUp, Award } from 'lucide-react';

const steps = [
  {
    icon: Monitor,
    title: 'Practice in a real exam environment',
    description:
      'Our test interface mirrors the official computer-delivered IELTS exam. Timer, question navigation, highlight, notes — everything you need to feel confident on test day.',
  },
  {
    icon: Brain,
    title: 'Get AI-powered feedback',
    description:
      'Submit your Writing and Speaking responses and receive instant evaluation across all IELTS criteria — task achievement, coherence, lexical resource, grammar, and pronunciation.',
  },
  {
    icon: TrendingUp,
    title: 'Track your progress',
    description:
      'Monitor your band score progression over time. Identify weak areas, compare skills against your target, and get personalized recommendations.',
  },
  {
    icon: Award,
    title: 'Achieve your target band',
    description:
      'Follow your personalized study plan, practice consistently, and watch your scores improve. Join thousands of students who reached their target band.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border bg-muted/30 py-20 sm:py-28">
      <div className="container-mw container-px">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Four steps from your first practice test to your target band score.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm font-bold text-primary">0{i + 1}</span>
                <h3 className="text-base font-semibold">{step.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
              {i < steps.length - 1 && (
                <div className="absolute -right-4 top-6 hidden h-px w-8 bg-border lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
