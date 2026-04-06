import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '泰乐施 AI Writing Assistant',
  description: 'SEO博客自动写作、AI配图、WordPress批量发布平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
