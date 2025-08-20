"use client";

import React from "react";
import Badge from "./Badge";
import { BadgePair } from "@/lib/themes";

interface FreeBadgeProps {
  pair?: BadgePair;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "ghost";
  className?: string;
}

export default function FreeBadge({
  pair = "red-gold",
  size = "md",
  variant = "solid",
  className = "",
}: FreeBadgeProps) {
  return (
    <Badge
      type="free"
      pair={pair}
      size={size}
      variant={variant}
      className={className}
    >
      Free
    </Badge>
  );
}
