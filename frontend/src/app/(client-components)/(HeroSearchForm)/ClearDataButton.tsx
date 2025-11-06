"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import React from "react";
import { FC } from "react";

export interface ClearDataButtonProps {
  onClick: () => void;
  variant?: "default" | "hero";
}

const ClearDataButton: FC<ClearDataButtonProps> = ({ onClick, variant = "default" }) => {
  const isHero = variant === "hero";
  
  return (
    <span
      onClick={() => onClick && onClick()}
      className={`absolute z-10 w-5 h-5 lg:w-6 lg:h-6 text-sm rounded-full flex items-center justify-center right-1 lg:right-3 top-1/2 transform -translate-y-1/2 cursor-pointer transition-colors ${
        isHero 
          ? "bg-neutral-200 hover:bg-neutral-300 text-neutral-700" 
          : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
      }`}
    >
      <XMarkIcon className="w-4 h-4" />
    </span>
  );
};

export default ClearDataButton;
