"use client";

import {
  HeartIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useRef } from "react";
import { PathName } from "@/routers/types";
import MenuBar from "@/shared/MenuBar";
import isInViewport from "@/utils/isInViewport";
import Link from "next/link";
import { usePathname } from "next/navigation";

let WIN_PREV_POSITION = 0;
if (typeof window !== "undefined") {
  WIN_PREV_POSITION = window.pageYOffset;
}

interface NavItem {
  name: string;
  link?: PathName;
  icon: any;
}

const NAV: NavItem[] = [
  {
    name: "Khám phá",
    link: "/",
    icon: MagnifyingGlassIcon,
  },
  {
    name: "Đăng nhập",
    link: "/login",
    icon: UserCircleIcon,
  },
  {
    name: "Menu",
    icon: MenuBar,
  },
];

const FooterNav = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleEvent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEvent = () => {
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(showHideHeaderMenu);
    }
  };

  const showHideHeaderMenu = () => {
    // if (typeof window === "undefined" || window?.innerWidth >= 768) {
    //   return null;
    // }

    let currentScrollPos = window.pageYOffset;
    if (!containerRef.current) return;

    // SHOW _ HIDE MAIN MENU
    if (currentScrollPos > WIN_PREV_POSITION) {
      if (
        isInViewport(containerRef.current) &&
        currentScrollPos - WIN_PREV_POSITION < 80
      ) {
        return;
      }

      containerRef.current.classList.add("FooterNav--hide");
    } else {
      if (
        !isInViewport(containerRef.current) &&
        WIN_PREV_POSITION - currentScrollPos < 80
      ) {
        return;
      }
      containerRef.current.classList.remove("FooterNav--hide");
    }

    WIN_PREV_POSITION = currentScrollPos;
  };

  const renderItem = (item: NavItem, index: number) => {
    const isActive = pathname === item.link;

    return item.link ? (
      <Link
        key={index}
        href={item.link}
        className={`flex flex-col items-center justify-center gap-1.5 py-2 px-4 rounded-lg transition-colors ${
          isActive 
            ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" 
            : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
        }`}
      >
        <item.icon className={`w-6 h-6 ${isActive ? "text-red-600 dark:text-red-400" : ""}`} />
        <span className={`text-xs font-medium leading-tight ${isActive ? "text-red-600 dark:text-red-400" : ""}`}>
          {item.name}
        </span>
      </Link>
    ) : (
      <div
        key={index}
        className={`flex flex-col items-center justify-center gap-1.5 py-2 px-4 rounded-lg transition-colors cursor-pointer ${
          isActive 
            ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" 
            : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
        }`}
      >
        <item.icon iconClassName="w-6 h-6" className={isActive ? "text-red-600 dark:text-red-400" : ""} />
        <span className={`text-xs font-medium leading-tight ${isActive ? "text-red-600 dark:text-red-400" : ""}`}>
          {item.name}
        </span>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="FooterNav block md:!hidden bg-white dark:bg-neutral-900 fixed top-auto bottom-0 inset-x-0 z-30 border-t border-neutral-200 dark:border-neutral-700 shadow-lg transition-transform duration-300 ease-in-out safe-area-inset-bottom"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="w-full max-w-lg flex justify-around items-center mx-auto py-2 px-2">
        {/* MENU */}
        {NAV.map(renderItem)}
      </div>
    </div>
  );
};

export default FooterNav;
