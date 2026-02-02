"use client";
import { useEffect, useState } from "react";

const formatter = Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function LocalTime({ time }: { time: Date }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <span>Loading...</span>;
  }

  return <span>{formatter.format(time)}</span>;
}
