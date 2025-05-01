/**
 * @copyright 2025 Muhamad Marsa Nur Jaman - Lyramor
 * @license Apache-2.0
 */

import "./globals.css";
import Script from 'next/script';

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
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}