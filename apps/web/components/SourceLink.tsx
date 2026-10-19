"use client";

import React from "react";
import { ExternalLink } from "lucide-react";

export interface SourceLinkProps {
  url?: string | null;
  label?: string;
  className?: string;
}

export function SourceLink({
  url,
  label = "Source",
  className = "",
}: SourceLinkProps) {
  if (!url) {
    return <span className="text-content-muted text-xs">—</span>;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 font-geist text-xs font-medium text-primary hover:text-primary-hover transition-colors ${className}`}
    >
      <span>{label}</span>
      <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
    </a>
  );
}

export default SourceLink;
