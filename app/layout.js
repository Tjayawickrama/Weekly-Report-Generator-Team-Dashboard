import './globals.css';

export const metadata = {
  title: 'ProgressHub — Weekly Report Generator',
  description: 'Submit structured weekly work reports and analyze team performance with AI-powered insights.',
  keywords: ['weekly reports', 'team management', 'productivity', 'AI assistant'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
