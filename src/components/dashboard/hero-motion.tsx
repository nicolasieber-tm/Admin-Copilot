"use client";

import { useEffect, useState } from "react";
import { formatChf } from "@/lib/budget";

// Motion C (Werkstatt Runde 4): Die Verfügbar-Zahl zählt beim Öffnen einmal
// hoch, der Quote-Balken füllt sich fliessend. Bei «Bewegung reduzieren»
// stehen beide sofort still auf ihrem Endwert.

export function AnimatedChf({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    const duration = 800;
    let start: number | null = null;
    let raf = requestAnimationFrame(function step(ts) {
      if (start === null) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span className={className}>{formatChf(display)}</span>;
}

export function QuotaBar({ percent }: { percent: number }) {
  const target = Math.min(percent, 100);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setWidth(target);
      return;
    }
    // Ein Frame mit 0 rendern, dann Zielbreite setzen → CSS-Transition läuft
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setWidth(target))
    );
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
      <span
        className={`quota-anim block h-full rounded-full bg-gradient-to-r ${
          percent > 100 ? "from-red-300 to-red-200" : "from-teal-300 to-white"
        }`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
