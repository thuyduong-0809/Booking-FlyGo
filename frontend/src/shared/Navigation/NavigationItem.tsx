"use client";

import { PathName } from "@/routers/types";
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { FC, Fragment, useEffect, useState } from "react";

// <--- NavItemType --->
export interface MegamenuItem {
  id: string;
  image: string;
  title: string;
  items: NavItemType[];
}
export interface NavItemType {
  id: string;
  name: string;
  isNew?: boolean;
  href: PathName;
  targetBlank?: boolean;
  children?: NavItemType[];
  megaMenu?: MegamenuItem[];
  type?: "dropdown" | "megaMenu" | "none";
  description?: string;
}

export interface NavigationItemProps {
  menuItem: NavItemType;
}

type NavigationItemWithRouterProps = NavigationItemProps;

const NavigationItem: FC<NavigationItemWithRouterProps> = ({ menuItem }) => {
  const [menuCurrentHovers, setMenuCurrentHovers] = useState<string[]>([]);

  // CLOSE ALL MENU OPENING WHEN CHANGE HISTORY
  const locationPathName = usePathname();
  useEffect(() => {
    setMenuCurrentHovers([]);
  }, [locationPathName]);

  const onMouseEnterMenu = (id: string) => {
    setMenuCurrentHovers((state) => [...state, id]);
  };

  const onMouseLeaveMenu = (id: string) => {
    setMenuCurrentHovers((state) => {
      return state.filter((item, index) => {
        return item !== id && index < state.indexOf(id);
      });
    });
  };

  // ===================== MENU MEGAMENU =====================
  const renderMegaMenu = (menu: NavItemType) => {
    const isHover = menuCurrentHovers.includes(menu.id);

    const isFull = menu.megaMenu && menu.megaMenu?.length > 3;
    const classPopover = isFull
      ? "menu-megamenu--large"
      : "menu-megamenu--small relative";
    const classPanel = isFull ? "left-0" : "-translate-x-1/2 left-1/2";

    return (
      <Popover
        as="li"
        className={`menu-item flex items-center menu-megamenu ${classPopover}`}
        onMouseEnter={() => onMouseEnterMenu(menu.id)}
        onMouseLeave={() => onMouseLeaveMenu(menu.id)}
      >
        {() => (
          <>
            <div>{renderMainItem(menu)}</div>
            <Transition
              as={Fragment}
              show={isHover}
              enter="transition ease-out duration-150"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel
                static
                className={`will-change-transform sub-menu absolute top-full transform z-10 w-screen max-w-sm px-4 sm:px-0 lg:max-w-max ${classPanel}`}
              >
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black dark:ring-white ring-opacity-5 dark:ring-opacity-10 text-sm">
                  <div className="relative bg-white dark:bg-neutral-900 py-6 grid gap-0" style={{ gridTemplateColumns: `repeat(${menu.megaMenu?.length}, minmax(280px, 1fr))` }}>
                    {menu.megaMenu?.map((item) => (
                      <div key={item.id} className="px-6 border-r border-neutral-200 dark:border-neutral-700 last:border-r-0">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-200 text-base mb-4">
                          {item.title}
                        </p>
                        <ul className="grid space-y-0">
                          {item.items.map(renderMegaMenuNavlink)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };

  const renderMegaMenuNavlink = (item: NavItemType) => {
    return (
      <li key={item.id} className="border-b border-neutral-200 dark:border-neutral-700 last:border-b-0 py-3 last:pb-0">
        <Link
          rel="noopener noreferrer"
          className="block rounded px-2 -mx-2 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          href={item.href || ""}
        >
          <div className="flex items-start gap-2 mb-1.5">
            <span className="font-semibold text-neutral-900 dark:text-neutral-200 text-sm leading-tight">
              {item.name}
            </span>
            {item.isNew && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-red-600 whitespace-nowrap flex-shrink-0">
                🔥 HOT
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {item.description}
            </p>
          )}
        </Link>
      </li>
    );
  };

  // ===================== MENU DROPDOW =====================
  const renderDropdownMenu = (menuDropdown: NavItemType) => {
    const isHover = menuCurrentHovers.includes(menuDropdown.id);
    return (
      <Popover
        as="li"
        className={`menu-item flex items-center menu-dropdown relative ${
          menuDropdown.isNew ? "menuIsNew_lv1" : ""
        }`}
        onMouseEnter={() => onMouseEnterMenu(menuDropdown.id)}
        onMouseLeave={() => onMouseLeaveMenu(menuDropdown.id)}
      >
        {() => (
          <>
            <div>{renderMainItem(menuDropdown)}</div>
            <Transition
              as={Fragment}
              show={isHover}
              enter="transition ease-out duration-150 "
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel
                static
                className="sub-menu will-change-transform absolute transform z-10 w-56 top-full left-0"
              >
                <ul className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 text-sm relative bg-white dark:bg-neutral-900 py-4 grid space-y-1">
                  {menuDropdown.children?.map((i) => {
                    if (i.type) {
                      return renderDropdownMenuNavlinkHasChild(i);
                    } else {
                      return (
                        <li
                          key={i.id}
                          className={`px-2 ${i.isNew ? "menuIsNew" : ""}`}
                        >
                          {renderDropdownMenuNavlink(i)}
                        </li>
                      );
                    }
                  })}
                </ul>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };

  const renderDropdownMenuNavlinkHasChild = (item: NavItemType) => {
    const isHover = menuCurrentHovers.includes(item.id);
    return (
      <Popover
        as="li"
        key={item.id}
        className="menu-item flex items-center menu-dropdown relative px-2"
        onMouseEnter={() => onMouseEnterMenu(item.id)}
        onMouseLeave={() => onMouseLeaveMenu(item.id)}
      >
        {() => (
          <>
            <div>{renderDropdownMenuNavlink(item)}</div>
            <Transition
              as={Fragment}
              show={isHover}
              enter="transition ease-out duration-150"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel
                static
                className="sub-menu absolute z-10 w-56 left-full pl-2 top-0"
              >
                <ul className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 text-sm relative bg-white dark:bg-neutral-900 py-4 grid space-y-1">
                  {item.children?.map((i) => {
                    if (i.type) {
                      return renderDropdownMenuNavlinkHasChild(i);
                    } else {
                      return (
                        <li key={i.id} className="px-2">
                          {renderDropdownMenuNavlink(i)}
                        </li>
                      );
                    }
                  })}
                </ul>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };

  const renderDropdownMenuNavlink = (item: NavItemType) => {
    return (
      <Link
        target={item.targetBlank ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="flex items-center font-normal text-neutral-6000 dark:text-neutral-300 py-2 px-4 rounded-md hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 "
        href={item.href || ""}
      >
        {item.name}
        {item.type && (
          <ChevronDownIcon
            className="ml-2 h-4 w-4 text-neutral-500"
            aria-hidden="true"
          />
        )}
      </Link>
    );
  };

  // ===================== MENU MAIN MENU =====================
  const renderMainItem = (item: NavItemType) => {
    return (
      <Link
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm xl:text-base font-normal text-neutral-700 dark:text-neutral-300 py-2 px-4 xl:px-5 rounded-full hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        href={item.href || "/"}
      >
        {item.name}
        {item.type && (
          <ChevronDownIcon
            className="ml-1 -mr-1 h-4 w-4 text-neutral-400"
            aria-hidden="true"
          />
        )}
      </Link>
    );
  };

  switch (menuItem.type) {
    case "megaMenu":
      return renderMegaMenu(menuItem);
    case "dropdown":
      return renderDropdownMenu(menuItem);
    default:
      return (
        <li className="menu-item flex items-center">
          {renderMainItem(menuItem)}
        </li>
      );
  }
};
// Your component own properties

export default NavigationItem;
