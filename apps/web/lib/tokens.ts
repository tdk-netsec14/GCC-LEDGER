/**
 * GCC Ledger — Obsidian Ledger Design Tokens
 * Extracted directly from Stitch project: "GCC Ledger UI/UX System"
 */

export const tokens = {
  colors: {
    dark: {
      canvas: "#0B1118",
      subtle: "#0F1722",
      surfaceCard: "#151D28",
      surfaceCardElevated: "#1A2332",
      surfaceContainerLowest: "#070F19",
      surfaceContainerLow: "#141C27",
      surfaceContainer: "#18202B",
      surfaceContainerHigh: "#232A36",
      surfaceContainerHighest: "#2D3541",
      surfaceBright: "#323A46",
      borderSubtle: "#222F40",
      borderActive: "#33445C",
      borderOutline: "#928F9F",
      borderOutlineVariant: "#474554",
      primary: "#7C71F5",
      primaryHover: "#8B80F9",
      primarySubtle: "rgba(124, 113, 245, 0.15)",
      primaryContainer: "#8A80FF",
      onPrimaryContainer: "#FFFFFF",
      secondary: "#10B981", // Emerald
      secondaryHover: "#059669",
      secondarySubtle: "rgba(16, 185, 129, 0.14)",
      secondaryContainer: "#00A572",
      onSecondaryContainer: "#00311F",
      tertiary: "#F59E0B", // Amber
      tertiarySubtle: "rgba(245, 158, 11, 0.14)",
      tertiaryContainer: "#CA8100",
      onTertiaryContainer: "#3E2400",
      danger: "#EF4444", // Coral Red
      dangerSubtle: "rgba(239, 68, 68, 0.14)",
      dangerContainer: "#93000A",
      onDangerContainer: "#FFDAD6",
      textPrimary: "#F8FAFC",
      textSecondary: "#94A3B8",
      textMuted: "#64748B",
    },
    light: {
      canvas: "#F8FAFC",
      subtle: "#F1F5F9",
      surfaceCard: "#FFFFFF",
      surfaceCardElevated: "#FFFFFF",
      surfaceContainerLowest: "#FFFFFF",
      surfaceContainerLow: "#F8FAFC",
      surfaceContainer: "#F1F5F9",
      surfaceContainerHigh: "#E2E8F0",
      surfaceContainerHighest: "#CBD5E1",
      surfaceBright: "#FFFFFF",
      borderSubtle: "#E2E8F0",
      borderActive: "#CBD5E1",
      borderOutline: "#94A3B8",
      borderOutlineVariant: "#CBD5E1",
      primary: "#6366F1",
      primaryHover: "#4F46E5",
      primarySubtle: "rgba(99, 102, 241, 0.10)",
      primaryContainer: "#4F46E5",
      onPrimaryContainer: "#FFFFFF",
      secondary: "#059669",
      secondaryHover: "#047857",
      secondarySubtle: "rgba(5, 150, 105, 0.10)",
      secondaryContainer: "#D1FAE5",
      onSecondaryContainer: "#065F46",
      tertiary: "#D97706",
      tertiarySubtle: "rgba(217, 119, 6, 0.10)",
      tertiaryContainer: "#FEF3C7",
      onTertiaryContainer: "#92400E",
      danger: "#DC2626",
      dangerSubtle: "rgba(220, 38, 38, 0.10)",
      dangerContainer: "#FEE2E2",
      onDangerContainer: "#991B1B",
      textPrimary: "#0F172A",
      textSecondary: "#475569",
      textMuted: "#94A3B8",
    },
  },
  typography: {
    fontFamilies: {
      primary: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      secondary: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace",
      mono: "Geist, 'SF Mono', Menlo, Consolas, Courier, monospace",
    },
    scale: {
      "display-lg": { size: "3rem", lineHeight: "1.15", weight: "700", tracking: "-0.03em" },
      "headline-xl": { size: "2rem", lineHeight: "1.25", weight: "600", tracking: "-0.025em" },
      "headline-xl-mobile": { size: "1.5rem", lineHeight: "1.30", weight: "600", tracking: "-0.02em" },
      "headline-lg": { size: "1.25rem", lineHeight: "1.35", weight: "600", tracking: "-0.015em" },
      "headline-md": { size: "1.125rem", lineHeight: "1.40", weight: "500", tracking: "-0.01em" },
      "body-lg": { size: "1rem", lineHeight: "1.50", weight: "400", tracking: "0" },
      "body-md": { size: "0.875rem", lineHeight: "1.50", weight: "400", tracking: "0" },
      "body-sm": { size: "0.75rem", lineHeight: "1.50", weight: "400", tracking: "0.01em" },
      "label-lg": { size: "0.875rem", lineHeight: "1.25", weight: "500", tracking: "0" },
      "label-md": { size: "0.75rem", lineHeight: "1.20", weight: "500", tracking: "0.02em" },
      "label-caps": { size: "0.6875rem", lineHeight: "1.15", weight: "600", tracking: "0.06em", transform: "uppercase" },
    },
  },
  spacing: {
    xs: "0.25rem",     // 4px
    sm: "0.5rem",      // 8px
    md: "0.875rem",    // 14px
    lg: "1.25rem",     // 20px
    xl: "1.75rem",     // 28px
    "2xl": "2.5rem",   // 40px
    gutter: "1.25rem",
    gutterMobile: "0.75rem",
    margin: "1.75rem",
    marginMobile: "1rem",
  },
  radii: {
    sm: "0.25rem",     // 4px
    default: "0.5rem", // 8px
    md: "0.75rem",     // 12px
    lg: "1rem",        // 16px
    xl: "1.5rem",      // 24px
    full: "9999px",
  },
  motion: {
    durationFast: "150ms",
    durationNormal: "200ms",
    durationSlow: "300ms",
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
} as const;

export type ThemeMode = "light" | "dark" | "system";
