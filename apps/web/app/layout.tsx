import type { Metadata } from "next";
import "./globals.css";
import { EvidenceProvider } from "@/lib/evidence-context";
import { ThemeProvider } from "@/lib/theme-context";
import { AppShell } from "@/components/AppShell";
import { DataStatusBanner } from "@/components/DataStatusBanner";

export const metadata: Metadata = {
  title: "GCC Ledger — Evidence-Graded Intelligence Platform for Indian GCCs",
  description:
    "Neutral, sourced and evidence-graded intelligence reference for Global Capability Centres in India.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-canvas text-content-primary font-sans antialiased">
        <ThemeProvider>
          <EvidenceProvider>
            <DataStatusBanner />
            <AppShell>{children}</AppShell>
          </EvidenceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
