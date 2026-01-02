import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

export const metadata: Metadata = {
  title: "CGG - Am I Cooked?",
  description: "Share your moments of failure and get roasted by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="min-h-screen bg-[#050505] text-gray-100 font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
