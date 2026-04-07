import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Save Note - Your Smart Note Manager",
  description: "A modern, beautiful note-taking app with folders, rich text editing, and auto-save. Built with love.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📝</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-white overflow-hidden`}
      >
        {children}
        <Toaster
          toastOptions={{
            style: {
              background: '#1e293b',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0',
            },
          }}
        />
      </body>
    </html>
  );
}
