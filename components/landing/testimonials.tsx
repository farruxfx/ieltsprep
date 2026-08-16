'use client';

import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Dilnoza K.',
    score: 'Band 7.5',
    university: 'University of Edinburgh',
    text: 'IELTS PRO\'ning AI writing evaluation\'i juda foydali bo\'ldi. Har bir essay\'im uchun batafsil feedback oldim va writing\'im 5.5\'dan 7.0\'ga ko\'tarildi.',
    initial: 'D',
  },
  {
    name: 'Jasur T.',
    score: 'Band 8.0',
    university: 'University of Melbourne',
    text: 'The mock exams felt exactly like the real test. The timer, the interface, everything was spot on. I scored 8.0 on my actual IELTS.',
    initial: 'J',
  },
  {
    name: 'Malika R.',
    score: 'Band 7.0',
    university: 'UCL',
    text: 'Speaking simulator is amazing. I practiced every day for a month and my fluency improved dramatically. Got 7.0 in speaking!',
    initial: 'M',
  },
];

export function Testimonials() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-mw container-px">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Students achieve their dreams
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Minglab talabalar IELTS PRO bilan o\'z target band score\'lariga yetdi.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-2xl border border-border bg-card p-6"
            >
              <Quote className="h-8 w-8 text-primary/20" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                {t.text}
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {t.initial}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.university}</div>
                </div>
                <div className="ml-auto rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                  {t.score}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
