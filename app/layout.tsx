import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/auth/auth-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'IELTS PRO — Prepare smarter. Score higher.',
    template: '%s | IELTS PRO',
  },
  description:
    'Professional IELTS preparation platform with real exam interface, AI-powered writing and speaking evaluation, detailed analytics, and full mock exams.',
  keywords: [
    'IELTS preparation',
    'IELTS practice',
    'IELTS mock exam',
    'IELTS writing evaluation',
    'IELTS speaking practice',
    'IELTS reading',
    'IELTS listening',
    'band score calculator',
  ],
  authors: [{ name: 'IELTS PRO' }],
  openGraph: {
    title: 'IELTS PRO — Prepare smarter. Score higher.',
    description:
      'Professional IELTS preparation platform with real exam interface, AI-powered evaluation, and detailed analytics.',
    type: 'website',
    locale: 'en_US',
    siteName: 'IELTS PRO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IELTS PRO — Prepare smarter. Score higher.',
    description:
      'Professional IELTS preparation platform with real exam interface, AI-powered evaluation, and detailed analytics.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
