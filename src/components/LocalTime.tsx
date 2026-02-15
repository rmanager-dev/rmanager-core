"use client";
import { useEffect, useState } from "react";

const formatter = Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const relativeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

const units: { unit: Intl.RelativeTimeFormatUnit; amount: number }[] = [
  { unit: "year", amount: 365 * 24 * 60 * 60 },
  { unit: "month", amount: 30 * 24 * 60 * 60 },
  { unit: "day", amount: 24 * 60 * 60 },
  { unit: "hour", amount: 60 * 60 },
  { unit: "minute", amount: 60 },
  { unit: "second", amount: 1 },
];

export default function LocalTime({
  time,
  mode = "relative",
}: {
  time: Date;
  mode?: "absolute" | "relative";
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <span>Loading...</span>;
  }

  if (mode === "relative") {
    const diffInSec = Math.floor((time.getTime() - Date.now()) / 1000);
    for (const { unit, amount } of units) {
      if (Math.abs(diffInSec) >= amount) {
        const timeString = relativeFormatter.format(Math.floor(diffInSec / amount), unit);
        return <span>{timeString.charAt(0).toUpperCase() + timeString.slice(1)}</span>;
      }
    }
  }

  return <span>{formatter.format(time)}</span>;
}
