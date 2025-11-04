import React, { FC } from "react";
import Logo from "@/shared/Logo";
import MenuBar from "@/shared/MenuBar";
import LangDropdown from "./LangDropdown";
import NotifyDropdown from "./NotifyDropdown";
import AvatarDropdown from "./AvatarDropdown";
// import HeroSearchForm2MobileFactory from "../(HeroSearchForm2Mobile)/HeroSearchForm2MobileFactory";
import Link from "next/link";
import { Route } from "@/routers/types";
import Navigation from "@/shared/Navigation/Navigation";
import SwitchDarkMode from "@/shared/SwitchDarkMode";
import SearchDropdown from "@/app/(client-components)/(Header)/SearchDropdown";

export interface MainNav2Props {
  className?: string;
}

const MainNav2: FC<MainNav2Props> = ({ className = "" }) => {
  return (
    <div className={`MainNav2 relative z-10 ${className}`}>
      <div className="px-4 h-20 lg:container flex justify-between">
        <div className="hidden md:flex justify-start flex-1 space-x-3 sm:space-x-8 lg:space-x-10">
          <Logo className="w-24 self-center" />
         <Navigation />
     
        </div>
        

        {/* Mobile Search - Ẩn theo yêu cầu */}
        {/* <div className="self-center lg:hidden flex-[3] max-w-lg !mx-auto md:px-3">
          <HeroSearchForm2MobileFactory />
        </div> */}


        <div className="hidden md:flex flex-shrink-0 justify-end flex-1 lg:flex-none text-neutral-700 dark:text-neutral-100">
          <div className="hidden lg:flex space-x-1">
             <SwitchDarkMode />
            <SearchDropdown className="flex items-center" />
            <LangDropdown />

            <NotifyDropdown />
            <AvatarDropdown />
          </div>
          <div className="flex space-x-2 lg:hidden">
            <NotifyDropdown />
            <AvatarDropdown />
            <MenuBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainNav2;
