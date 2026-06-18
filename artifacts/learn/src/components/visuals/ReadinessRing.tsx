/**
 * ReadinessRing
 *
 * Animated circular gauge for any 0–100 metric (default: "Exam Readiness").
 * Color band is derived from the mastery cutoffs used elsewhere in the app:
 *   ≥80 strong (emerald) · ≥60 proficient (amber) · ≥40 developing (sky) · <40 weak (rose)
 *
 * Adapted from the Option A reference.
 */

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ReadinessRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  showBand?: boolean;
  className?: string;
}

interface Band {
  label: string;
  color: string;
  bg: string;
  text: string;
}

function getBand(v: number): Band {
  if (v >= 80) {
    return {
      label: "Strong",
      color: "#34d399",
      bg: "bg-synapse-accent-emerald/10",
      text: "text-synapse-accent-emerald",
    };
  }
  if (v >= 60) {
    return {
      label: "Proficient",
      color: "#fbbf24",
      bg: "bg-synapse-accent-amber/10",
      text: "text-synapse-accent-amber",
    };
  }
  if (v >= 40) {
    return {
      label: "Developing",
      color: "#38bdf8",
      bg: "bg-sky-500/10",
      text: "text-sky-400",
    };
  }
  return {
    label: "Weak",
    color: "#fb7185",
    bg: "bg-synapse-accent-rose/10",
    text: "text-synapse-accent-rose",
  };
}

export function ReadinessRing({
  value,
  size = 180,
  strokeWidth = 12,
  label = "Exam Readiness",
  sublabel,
  showBand = true,
  className,
}: ReadinessRingProps) {
  const safeValue = Math.max(0, Math.min(100, value));
  const band = getBand(safeValue);
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (safeValue / 100) * c;
  const center = size / 2;
  const gradId = `ring-grad-${Math.round(safeValue)}-${size}`;

  // angle for the glow dot at the tip of the arc
  const tipRad = ((safeValue / 100) * 360 - 90) * (Math.PI / 180);
  const tipX = center + r * Math.cos(tipRad);
  const tipY = center + r * Math.sin(tipRad);

  return (
    <div
      className={cn("flex flex-col items-center gap-3", className)}
      role="img"
      aria-label={`${label} ${Math.round(safeValue)}%`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="rgba(30, 23, 64, 0.8)"
            strokeWidth={strokeWidth}
          />
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={band.color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={band.color} />
            </linearGradient>
          </defs>
          <motion.circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={c}
            strokeLinecap="round"
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          {safeValue > 0 && (
            <motion.circle
              cx={tipX}
              cy={tipY}
              r={strokeWidth / 2 + 2}
              fill={band.color}
              opacity={0.5}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.0 }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-black"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            style={{ color: band.color }}
          >
            {Math.round(safeValue)}%
          </motion.span>
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
        </div>
      </div>

      {showBand && (
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            band.bg,
            band.text,
          )}
        >
          {band.label}
        </span>
      )}
      {sublabel && (
        <p className="max-w-[220px] text-center text-[10px] text-muted-foreground">
          {sublabel}
        </p>
      )}
    </div>
  );
}
