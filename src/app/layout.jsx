/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */

import "./globals.css";

export const metadata = {
  title: 'Cylia Tech',
  description: 'Selamat datang di Cylia Tech',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}