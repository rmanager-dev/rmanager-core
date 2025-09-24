"use client";

import { useTheme } from "next-themes";
import { Toaster, ToasterProps } from "sonner";

export default function ThemedToaster({ ...args }: ToasterProps) {
  const { theme } = useTheme();
  return <Toaster theme={theme as "light" | "dark" | "system"} {...args} />;
}
