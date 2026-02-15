import React from "react";
import { RobloxCredentialStatus } from "../lib/types/roblox-credentials-types";
import { Badge } from "./ui/badge";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./ui/popover";
import LocalTime from "./LocalTime";

type StatusConfigType = {
  label: string;
  className: string;
  Icon?: React.ReactNode;
  popoverTitle: string;
  popoverDescription?: string;
};

interface StatusBadgeProps {
  kind: RobloxCredentialStatus;
  errorMessage?: string;
  lastRefreshed: Date;
}
export default function StatusBadge({ kind, errorMessage, lastRefreshed }: StatusBadgeProps) {
  const statusConfig: Record<RobloxCredentialStatus, StatusConfigType> = {
    healthy: {
      label: "Healthy",
      className: `bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 cursor-pointer`,
      popoverTitle: "System Operational",
    },
    warning: {
      label: "Warning",
      className: `bg-yellow-700 text-orange-200 cursor-pointer`,
      Icon: <Info />,
      popoverTitle: "Attention Required",
      popoverDescription:
        errorMessage ?? "A non-critical issue was detected. No further details available.",
    },
    error: {
      label: "Error",
      className: `bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 cursor-pointer`,
      popoverTitle: "Action Required",
      popoverDescription:
        errorMessage ??
        "A critical connection issue occured. Please check your key in the Roblox Creator Dashboard",
    },
  };

  const config = statusConfig[kind] ?? statusConfig.healthy;
  const BadgeElement = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, onClick, ...props }, ref) => {
      return (
        <div
          ref={ref}
          {...props}
          className={className}
          onClick={(e) => {
            onClick?.(e);
          }}
        >
          <Badge className={config.className}>
            <span>{config.label}</span>
            {config.Icon}
          </Badge>
        </div>
      );
    },
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <BadgeElement />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>{config.popoverTitle}</PopoverTitle>
          {config.popoverDescription && (
            <PopoverDescription>{config.popoverDescription}</PopoverDescription>
          )}
          {lastRefreshed && (
            <PopoverDescription>
              <span>Last checked: </span>
              <LocalTime time={lastRefreshed} mode="relative" />
            </PopoverDescription>
          )}
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}
