import * as React from "react";

interface ProgressProps {
  value?: number;
  className?: string;
}

export function Progress({ value = 0, className = "" }: ProgressProps) {
  return (
    <div className={`w-full bg-gray-200 rounded ${className}`}>
      <div
        className="h-2 bg-blue-600 rounded transition-all"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
} 