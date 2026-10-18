"use client";

import { ExternalLink } from "lucide-react";

interface SourceLinkProps {
  url?: string | null;
  label?: string;
  className?: string;
}

export default function SourceLink({
  url,
  label = "Source",
  className = "",
}: SourceLinkProps) {
  if (!url) {
    return <span className="text-slate-400 text-xs">—</span>;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors ${className}`}
    >
      <span>{label}</span>
      <ExternalLink className="w-3 h-3 flex-shrink-0" />
    </a>
  );
}
