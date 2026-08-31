import type { Metadata } from 'next';
import { Zen } from '@hanzo/font/sans';
import { ZenMono } from '@hanzo/font/mono';
import './globals.css';
import { config } from '@/lib/config';


export const metadata: Metadata = {
  metadataBase: new URL('https://zoolabs.io'),
  title: config.meta.title,
  description: config.meta.description,
  openGraph: {
    title: config.meta.title,
    description: config.meta.description,
    url: 'https://zoolabs.io',
    siteName: config.org.name,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: config.meta.title,
    description: config.meta.description,
    creator: '@zoolabs',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The Zen variables ride on <html> so they resolve on the same element as the
  // --font-sans/--font-mono in globals.css that reference them.
  return (
    <html lang="en" className={`dark ${Zen.variable} ${ZenMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
