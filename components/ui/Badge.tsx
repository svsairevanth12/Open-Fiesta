"use client";

import React from "react";
import { BadgeType, BadgePair } from "@/lib/themes";
import { getBadgeStyle } from "@/lib/badgeSystem";

interface BadgeProps {
  type: BadgeType;
  pair?: BadgePair;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "ghost";
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  type,
  pair = "red-gold",
  size = "md",
  variant = "solid",
  children,
  className = "",
}: BadgeProps) {
  const badgeStyle = getBadgeStyle(pair, type);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  const variantClasses = {
    solid: "",
    outline: "bg-transparent border-2",
    ghost: "bg-transparent border-transparent hover:border-current",
  };

  const baseClasses = `
    inline-flex items-center rounded-full font-medium border 
    transition-all duration-200
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim();

  const style =
    variant === "solid"
      ? {
          background: badgeStyle.background,
          color: badgeStyle.text,
          borderColor: badgeStyle.border,
        }
      : {
          borderColor: badgeStyle.border,
          color: badgeStyle.text,
        };

  return (
    <span
      className={baseClasses}
      style={style}
      onMouseEnter={(e) => {
        if (badgeStyle.glow && variant === "solid") {
          e.currentTarget.style.boxShadow = `0 0 0 1px ${badgeStyle.glow}`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {children}
    </span>
  );
}
