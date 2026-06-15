import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata = {
  title: 'HMH Tools',
  description: 'HMH Holdings internal operating system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
