import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/vireon/theme-provider";
import { SessionProvider } from "@/components/vireon/session-provider";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Vireon — CSE Student Productivity Hub",
  description: "A lightweight, browser-based productivity system designed for Computer Science & Engineering students to manage study, coding practice, fitness, and daily goals.",
  keywords: ["Vireon", "CSE", "Productivity", "Study Planner", "Code Compiler", "Student Dashboard"],
  authors: [{ name: "Arefin Siddiqui" }],
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <SessionProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
