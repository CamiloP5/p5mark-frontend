// app/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Header from './site/header'; 
import Footer from './site/footer';
import './globals.css';

// Fuentes (esto queda igual)
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Metadatos (esto queda igual)
export const metadata: Metadata = {
  title: 'P5 Marketing Courses',
  description: 'Headless WordPress + Next.js frontend for courses',
};

// 👇 ¡AQUÍ ESTÁ EL CAMBIO!
export default async function RootLayout({
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
        {/* Ahora el Layout "esperará" (await) a que Header resuelva sus datos */}
        <Header />

        {/* Contenido de cada página */}
        <main className="mx-auto max-w-5xl p-6">{children}</main>

        {/* Y también "esperará" (await) a que Footer resuelva sus datos */}
        <Footer />
      </body>
    </html>
  );
}