import React from "react";
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import AuthProvider from "@/context/AuthContext";

// 1. Initialize fonts
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

// 2. Metadata (No ": Metadata" type needed in JSX)
export const metadata = {
  title: 'StitchFlow - Tailoring Management Dashboard',
  description: 'Professional Online Tailoring Management System for streamlining shop operations',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

// 3. RootLayout (Standard JavaScript function props)
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* 4. Apply font variables to the body */}
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
        {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}