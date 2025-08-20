"use client";

import React from "react";
import Badge from "./Badge";
import { BadgePair } from "@/lib/themes";

interface ProBadgeProps {
  pair?: BadgePair;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "ghost";
  className?: string;
}

export default function ProBadge({
  pair = "red-gold",
  size = "md",
  variant = "solid",
  className = "",
}: ProBadgeProps) {
  return (
    <Badge
      type="pro"
      pair={pair}
      size={size}
      variant={variant}
      className={className}
    >
      Pro
    </Badge>
  );
}
