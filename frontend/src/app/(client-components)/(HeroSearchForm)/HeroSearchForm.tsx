"use client";

import React, { FC, useState } from "react";
import FlightSearchForm from "./(flight-search-form)/FlightSearchForm";

export type SearchTab = "Flights";

export interface HeroSearchFormProps {
  className?: string;
  currentTab?: SearchTab;
  currentPage?: "Flights";
}

const HeroSearchForm: FC<HeroSearchFormProps> = ({
  className = "",
  currentTab = "Flights",
  currentPage,
}) => {
  const tabs: SearchTab[] = [ "Flights"];
  const [tabActive, setTabActive] = useState<SearchTab>(currentTab);



  const renderForm = () => {
    switch (tabActive) {
      case "Flights":
        return <FlightSearchForm />;

      default:
        return null;
    }
  };

  return (
    <div
      className={`nc-HeroSearchForm w-full max-w-6xl py-5 lg:py-0 ${className}`}
    >
    
      {renderForm()}
    </div>
  );
};

export default HeroSearchForm;
