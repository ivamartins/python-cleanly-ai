import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cleanly — Intelligent Watermark Removal with AI',
  description: 'Remove watermarks, logos, and text from images using local AI (LaMa). Fast, secure, and 100% offline.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
