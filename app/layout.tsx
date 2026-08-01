import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DRAGONITE.DEV — Học Lập trình Thi đấu',
  description: 'Nền tảng học tập và luyện thi lập trình dành cho Câu lạc bộ Tin học',
  openGraph: { images: [{ url: 'https://bolt.new/static/og_default.png' }] },
  twitter: { card: 'summary_large_image', images: [{ url: 'https://bolt.new/static/og_default.png' }] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const t = localStorage.getItem('dragonite-theme');
            if (t === 'light') document.documentElement.classList.remove('dark');
          } catch(e) {}
        `}} />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <div className="min-h-screen bg-slate-950">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
