"use client";

import React from "react";
import logoImg from "@/images/logo.png";
import logoLightImg from "@/images/logo-light.png";
import LogoSvgLight from "./LogoSvgLight";
import LogoSvg from "./LogoSvg";
import Link from "next/link";
import Image from "next/image";
import { StaticImageData } from "next/image";

export interface LogoProps {
  img?: StaticImageData;
  imgLight?: StaticImageData;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  img = logoImg,
  imgLight = logoLightImg,
  className = "w-24",
}) => {
  return (
    <Link
      href="/"
      className={`ttnc-logo inline-block text-primary-6000 focus:outline-none focus:ring-0 ${className}`}
    >
      {/* <LogoSvgLight />
      <LogoSvg /> */}

      {/* THIS USE FOR MY CLIENT */}
      {/* PLEASE UN COMMENT BELLOW CODE AND USE IT */}
      {img ? (
        <Image
          className={`block max-h-30 ${imgLight ? "dark:hidden" : ""}`}
          src="/image/flygo_3.png"
          alt="Logo"
          width={96}
          height={48}
          priority
          unoptimized
          suppressHydrationWarning
        />
      ) : (
        "logo here"
      )}
      {imgLight && (
        <Image
          className="hidden max-h-30 dark:block"
          src="/image/flygo_3.png"
          alt="Logo"
          width={96}
          height={48}
          priority
          unoptimized
          suppressHydrationWarning
        />
      )}
    </Link>
  );
};

export default Logo;
