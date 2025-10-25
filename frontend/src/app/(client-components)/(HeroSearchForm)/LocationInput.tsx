"use client";

import { ClockIcon, MapPinIcon } from "@heroicons/react/24/outline";
import React, { useState, useRef, useEffect, FC } from "react";
import ClearDataButton from "./ClearDataButton";
import { Airport } from "../../../services/airports.service";

export interface LocationInputProps {
  placeHolder?: string;
  desc?: string;
  className?: string;
  divHideVerticalLineClass?: string;
  autoFocus?: boolean;
  airports?: Airport[];
  onLocationSelect?: (airport: Airport) => void;
  selectedAirport?: Airport | null;
}

const LocationInput: FC<LocationInputProps> = ({
  autoFocus = false,
  placeHolder = "Location",
  desc = "Where are you going?",
  className = "nc-flex-1.5",
  divHideVerticalLineClass = "left-10 -right-0.5",
  airports = [],
  onLocationSelect,
  selectedAirport,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState("");
  const [showPopover, setShowPopover] = useState(autoFocus);

  // Cập nhật value khi selectedAirport thay đổi
  useEffect(() => {
    if (selectedAirport) {
      const displayText = `${selectedAirport.city}, ${selectedAirport.country}`;
      setValue(displayText);
    } else {
      setValue("");
    }
  }, [selectedAirport]);

  useEffect(() => {
    setShowPopover(autoFocus);
  }, [autoFocus]);

  useEffect(() => {
    if (eventClickOutsideDiv) {
      document.removeEventListener("click", eventClickOutsideDiv);
    }
    showPopover && document.addEventListener("click", eventClickOutsideDiv);
    return () => {
      document.removeEventListener("click", eventClickOutsideDiv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPopover]);

  useEffect(() => {
    if (showPopover && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showPopover]);

  const eventClickOutsideDiv = (event: MouseEvent) => {
    if (!containerRef.current) return;
    // CLICK IN_SIDE
    if (!showPopover || containerRef.current.contains(event.target as Node)) {
      return;
    }
    // CLICK OUT_SIDE
    setShowPopover(false);
  };

  const handleSelectLocation = (airport: Airport) => {
    const displayText = `${airport.city}, ${airport.country}`;
    setValue(displayText);
    setShowPopover(false);
    onLocationSelect?.(airport);
  };

  const renderRecentSearches = () => {
    return (
      <>
        <h3 className="block mt-2 sm:mt-0 px-4 sm:px-8 font-semibold text-base sm:text-lg text-neutral-800 dark:text-neutral-100">
          Các thành phố phổ biến
        </h3>
        <div className="mt-2">
          {airports.slice(0, 4).map((airport) => (
            <span
              onClick={() => handleSelectLocation(airport)}
              key={airport.airportId}
              className="flex px-4 sm:px-8 items-center space-x-3 sm:space-x-4 py-4 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <span className="block text-neutral-400">
                <MapPinIcon className="h-4 sm:h-6 w-4 sm:w-6" />
              </span>
              <div className="flex flex-col">
                <span className="block font-medium text-neutral-700 dark:text-neutral-200">
                  {airport.city}, {airport.country}
                </span>
                <span className="block text-sm text-neutral-500 dark:text-neutral-400">
                  {airport.airportName} ({airport.airportCode})
                </span>
              </div>
            </span>
          ))}
        </div>
      </>
    );
  };

  const renderSearchValue = () => {
    const filteredAirports = airports.filter((airport) =>
      airport.city.toLowerCase().includes(value.toLowerCase()) ||
      airport.airportName.toLowerCase().includes(value.toLowerCase()) ||
      airport.airportCode.toLowerCase().includes(value.toLowerCase()) ||
      airport.country.toLowerCase().includes(value.toLowerCase())
    );

    if (filteredAirports.length === 0) {
      return (
        <div className="px-4 sm:px-8 py-4 text-center text-neutral-500 dark:text-neutral-400">
          Không tìm thấy thành phố nào phù hợp
        </div>
      );
    }

    return (
      <>
        <h3 className="block mt-2 sm:mt-0 px-4 sm:px-8 font-semibold text-base sm:text-lg text-neutral-800 dark:text-neutral-100">
          Kết quả tìm kiếm
        </h3>
        <div className="mt-2">
          {filteredAirports.map((airport) => (
            <span
              onClick={() => handleSelectLocation(airport)}
              key={airport.airportId}
              className="flex px-4 sm:px-8 items-center space-x-3 sm:space-x-4 py-4 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <span className="block text-neutral-400">
                <MapPinIcon className="h-4 w-4 sm:h-6 sm:w-6" />
              </span>
              <div className="flex flex-col">
                <span className="block font-medium text-neutral-700 dark:text-neutral-200">
                  {airport.city}, {airport.country}
                </span>
                <span className="block text-sm text-neutral-500 dark:text-neutral-400">
                  {airport.airportName} ({airport.airportCode})
                </span>
              </div>
            </span>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className={`relative flex ${className}`} ref={containerRef}>
      <div
        onClick={() => setShowPopover(true)}
        className={`flex z-10 flex-1 relative [ nc-hero-field-padding ] flex-shrink-0 items-center space-x-3 cursor-pointer focus:outline-none text-left  ${showPopover ? "nc-hero-field-focused" : ""
          }`}
      >
        <div className="text-neutral-300 dark:text-neutral-400">
          <MapPinIcon className="w-5 h-5 lg:w-7 lg:h-7" />
        </div>
        <div className="flex-grow">
          <input
            className={`block w-full bg-transparent border-none focus:ring-0 p-0 focus:outline-none focus:placeholder-neutral-300 xl:text-lg font-semibold placeholder-neutral-800 dark:placeholder-neutral-200 truncate`}
            placeholder={placeHolder}
            value={value}
            autoFocus={showPopover}
            onChange={(e) => {
              setValue(e.currentTarget.value);
            }}
            ref={inputRef}
          />
          <span className="block mt-0.5 text-sm text-neutral-400 font-light ">
            <span className="line-clamp-1">{!!value ? placeHolder : desc}</span>
          </span>
          {value && showPopover && (
            <ClearDataButton
              onClick={() => {
                setValue("");
              }}
            />
          )}
        </div>
      </div>

      {showPopover && (
        <div
          className={`h-8 absolute self-center top-1/2 -translate-y-1/2 z-0 bg-white dark:bg-neutral-800 ${divHideVerticalLineClass}`}
        ></div>
      )}

      {showPopover && (
        <div className="absolute left-0 z-40 w-full min-w-[300px] sm:min-w-[500px] bg-white dark:bg-neutral-800 top-full mt-3 py-3 sm:py-6 rounded-3xl shadow-xl max-h-96 overflow-y-auto">
          {value ? renderSearchValue() : renderRecentSearches()}
        </div>
      )}
    </div>
  );
};

export default LocationInput;
