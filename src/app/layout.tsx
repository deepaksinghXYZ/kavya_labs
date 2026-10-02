import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kavya Labs | AI Infrastructure',
  description: 'AI Infrastructure and automation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}