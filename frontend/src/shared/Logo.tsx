import React from "react";
import logoImg from "@/images/logo.png";
import logoLightImg from "@/images/logo-light.png";
import LogoSvgLight from "./LogoSvgLight";
import LogoSvg from "./LogoSvg";
import Link from "next/link";
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
        <img
          className={`block max-h-30 ${imgLight ? "dark:hidden" : ""}`}
          src="/image/flygo_3.png"
          alt="Logo"
          // width={500}
          // height={500}
        />
      ) : (
        "logo here"
      )}
      {imgLight && (
        <img
          className="hidden max-h-30 dark:block"
          src="/image/flygo_3.png"
          alt="Logo"
        />
      )}
    </Link>
  );
};

export default Logo;
