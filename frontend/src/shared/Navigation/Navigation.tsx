import React from "react";
import NavigationItem from "./NavigationItem";
import { NAVIGATION_DEMO } from "@/data/navigation";

function Navigation() {
  return (
    <ul className="nc-Navigation hidden xl:flex xl:flex-wrap xl:space-x-1 relative">
      {NAVIGATION_DEMO.map((item) => (
        <NavigationItem key={item.id} menuItem={item} />
      ))}
    </ul>
  );
}

export default Navigation;
