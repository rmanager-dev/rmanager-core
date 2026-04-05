import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type InferDrizzleSelect<T> = {
  [K in keyof T]: T[K] extends {
    _: { data: infer TData; notNull: infer TNotNull };
  }
    ? TNotNull extends true
      ? TData
      : TData | null
    : never;
};

export function nameToSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove special characters
    .trim()
    .split(/\s+/) // Remove white spaces
    .join("-"); // Join the words with a dash
}
