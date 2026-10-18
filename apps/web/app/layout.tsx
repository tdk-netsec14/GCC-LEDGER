import type { Metadata } from "next";
import "./globals.css";
import { EvidenceProvider } from "@/lib/evidence-context";
import { Header } from "@/components/Header";
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
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50/50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
        <EvidenceProvider>
          <DataStatusBanner />
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {children}
          </main>
          <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-6 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
              <p>
                GCC Ledger · Sourced and evidence-graded intelligence platform for India.
              </p>
              <p className="text-[11px] text-slate-400">
                Figures are public claims read on the date stated. Not legal, tax, or investment advice.
              </p>
            </div>
          </footer>
        </EvidenceProvider>
      </body>
    </html>
  );
}
