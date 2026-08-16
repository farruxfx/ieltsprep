'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { pricingPlans, formatUZS } from '@/lib/data';

const billingPeriods = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: '3 months', discount: 'Save 16%' },
  { id: 'halfYearly', label: '6 months', discount: 'Save 25%' },
  { id: 'yearly', label: 'Yearly', discount: 'Save 33%' },
];

interface BillingPeriod {
  id: string;
  label: string;
  discount?: string;
}

type BillingPeriodId = 'monthly' | 'quarterly' | 'halfYearly' | 'yearly';

export default function PricingPage() {
  const [period, setPeriod] = useState<BillingPeriodId>('monthly');

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="py-20 sm:py-28">
          <div className="container-mw container-px">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Simple, transparent pricing
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Choose the plan that fits your IELTS journey. Upgrade or cancel anytime.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {billingPeriods.map((bp) => (
                <button
                  key={bp.id}
                  onClick={() => setPeriod(bp.id as BillingPeriodId)}
                  className={cn(
                    'flex flex-col items-center rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
                    period === bp.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-foreground/20'
                  )}
                >
                  <span>{bp.label}</span>
                  {bp.discount && (
                    <span className="mt-0.5 text-xs text-success">{bp.discount}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-16 grid gap-6 lg:grid-cols-3">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    'relative flex flex-col rounded-2xl border bg-card p-8',
                    plan.highlighted
                      ? 'border-primary shadow-xl shadow-primary/10 lg:scale-105'
                      : 'border-border'
                  )}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Most popular
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="mt-6">
                    <span className="text-4xl font-bold tracking-tight">
                      {formatUZS(plan.price[period])}
                    </span>
                    {plan.price[period] > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {' '}
                        / {billingPeriods.find((b) => b.id === period)?.label.toLowerCase()}
                      </span>
                    )}
                  </div>

                  <Link href="/signup" className="mt-6">
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? 'default' : 'outline'}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                        <span className="text-foreground/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-border bg-muted/30 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">No dark patterns.</span>{' '}
                Cancel anytime. No hidden fees. Full refund within 7 days if you&apos;re not
                satisfied.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
