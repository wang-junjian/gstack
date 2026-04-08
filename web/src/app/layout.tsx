import type { Metadata } from 'next';
import { LanguageProvider } from '@/context/LanguageContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'gstack - AI Engineering Expert Team',
  description: 'Discover the expert team of gstack - AI-powered engineering workflow from idea to ship',
  keywords: ['gstack', 'AI', 'engineering', 'workflow', 'experts'],
  authors: [{ name: 'gstack' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
