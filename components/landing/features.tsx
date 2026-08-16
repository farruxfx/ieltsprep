'use client';

import { BookOpen, Headphones, PenLine, Mic, FileCheck, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Reading',
    description: 'IELTS Reading savollarini real exam interface\'da ishlash. 13+ question type bilan to\'liq tayyorgarlik.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Headphones,
    title: 'Listening',
    description: 'Audio, timer va avtomatik scoring. 4 section, real exam formatida tinglash va javob berish.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: PenLine,
    title: 'Writing',
    description: 'Task 1 va Task 2. AI evaluation orqali har bir criterion bo\'yicha batafsil feedback oling.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    icon: Mic,
    title: 'Speaking',
    description: 'Part 1, Part 2, Part 3 simulation. Yozib olish va AI pronunciation tahlili.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: FileCheck,
    title: 'Mock Exam',
    description: 'To\'liq IELTS simulation. Real exam timer, auto-save va avtomatik band score hisoblash.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Natijalar va progress. Skill comparison, target monitoring va weak area identification.',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="container-mw container-px">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to ace IELTS
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            To\'liq IELTS preparation ecosystem — har bir skill uchun maxsus tools, AI evaluation va
            professional analytics.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor}`}
              >
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
