"use client";

import React from "react";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = "%",
  onChange,
  className = "",
  disabled = false,
  ...props
}) => {
  const percentage = Math.round(((value - min) / (max - min)) * 100);

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-geist font-medium text-content-secondary">{label}</span>
        <span className="font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[11px]">
          {value}
          {unit}
        </span>
      </div>

      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          className="w-full h-1.5 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          {...props}
        />
      </div>
    </div>
  );
};
