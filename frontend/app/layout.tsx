import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"
import "./styles/datepicker.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ticketify - Decentralized Event Management",
  description: "Create, manage, and attend events on the blockchain. Secure, transparent, and decentralized event ticketing platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
        {children}
        </Providers>
      </body>
    </html>
  );
}
