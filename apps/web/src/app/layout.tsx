import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '../contexts/AuthContext';
import { OrganizationJsonLd } from '../components/seo/JsonLd';
import { ToastHost } from '../components/ui/ToastHost';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://reunion.family'),
  title: {
    default: 'Reunion OS — Family Operations from Intake to Delivery',
    template: '%s | Reunion OS',
  },
  description:
    'White-glove multi-generational family reunion platform. Dynamic intake, multi-category responsibility matrix, personal punch-lists, deposits, and gamified task completion.',
  keywords: [
    'family reunion planner',
    'committee management',
    'punch list app',
    'event operations',
    'family organization software',
    'reunion OS',
  ],
  authors: [{ name: 'Reunion OS' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Reunion OS',
    title: 'Reunion OS — Intake to Delivery',
    description:
      'Enterprise-grade tools for complex family organizations: intake engine, responsibility matrix, and personal command centers.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reunion OS',
    description: 'Family operations from intake to delivery.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: '#0F0D0C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <OrganizationJsonLd />
        <AuthProvider>
          {children}
          <ToastHost />
        </AuthProvider>
      </body>
    </html>
  );
}
