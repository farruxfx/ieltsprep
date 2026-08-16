import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Practice', href: '/practice' },
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Mock Exams', href: '/practice' },
  ],
  Skills: [
    { label: 'Reading', href: '/practice?skill=reading' },
    { label: 'Listening', href: '/practice?skill=listening' },
    { label: 'Writing', href: '/practice?skill=writing' },
    { label: 'Speaking', href: '/practice?skill=speaking' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Resources', href: '/#resources' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund' },
    { label: 'AI Disclaimer', href: '/ai-disclaimer' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="container-mw container-px py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">IELTS PRO</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Professional IELTS preparation platform with AI-powered evaluation, real exam
              interface, and detailed analytics.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              IELTS PRO is not affiliated with, endorsed by, or connected to the official IELTS
              organization, Cambridge University Press, or the British Council.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold">{category}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} IELTS PRO. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for students, by educators.
          </p>
        </div>
      </div>
    </footer>
  );
}
