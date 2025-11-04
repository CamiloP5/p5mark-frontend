import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Header from './site/header'; // 👈 nuevo
import Footer from './site/footer'; // 👈 nuevo
import './globals.css';

// Fuentes
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Metadatos globales (puedes actualizar título/descripción)
export const metadata: Metadata = {
  title: 'P5 Marketing Courses',
  description: 'Headless WordPress + Next.js frontend for courses',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white text-neutral-900`}
      >
        {/* Header global */}
        <Header />

        {/* Contenido de cada página */}
        <main className="mx-auto max-w-5xl p-6">{children}</main>
      </body>
    </html>
  );
}
