"use client";

import { MapPinIcon } from "@heroicons/react/24/outline";
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

  // Reset search value when popover opens
  useEffect(() => {
    if (showPopover) {
      setValue("");
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
    setValue("");
    setShowPopover(false);
    onLocationSelect?.(airport);
  };

  const renderRecentSearches = () => {
    return (
      <>
        <div className="px-4 py-3">
          <h3 className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Tất cả sân bay ({airports.length})
          </h3>
        </div>
        <div className="px-4 pb-3 max-h-[320px] overflow-y-auto" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 transparent'
        }}>
          <div className="space-y-2">
            {airports.map((airport, index) => (
              <div
                onClick={() => handleSelectLocation(airport)}
                key={airport.airportId}
                className="group flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <MapPinIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    {airport.city}, {airport.country}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                    {airport.airportName} ({airport.airportCode})
                  </div>
                </div>
              </div>
            ))}
          </div>
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
        <div className="px-4 py-3">
          <h3 className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Kết quả tìm kiếm ({filteredAirports.length})
          </h3>
        </div>
        <div className="px-4 pb-3 max-h-[320px] overflow-y-auto" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 transparent'
        }}>
          <div className="space-y-2">
            {filteredAirports.map((airport, index) => (
              <div
                onClick={() => handleSelectLocation(airport)}
                key={airport.airportId}
                className="group flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <MapPinIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    {airport.city}, {airport.country}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                    {airport.airportName} ({airport.airportCode})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  // Kiểm tra nếu className có chứa styles của hero red
  const isHeroStyle = className.includes("rounded-2xl") && className.includes("shadow-");
  // Kiểm tra nếu đang ở trong SearchModal (không có padding riêng)
  const isSearchModal = className.includes("px-0");
  // Kiểm tra nếu là SearchModal popup (cần offset đặc biệt)
  const isSearchModalPopup = className.includes("search-modal-popup");

  return (
    <div className={`relative flex ${isHeroStyle ? className : ""}`} ref={containerRef}>
      <div
        onClick={() => setShowPopover(true)}
        className={`flex z-10 flex-1 relative ${isHeroStyle ? "px-5 py-4" : isSearchModal ? "" : "[ nc-hero-field-padding ]"} flex-shrink-0 items-center space-x-3 cursor-pointer focus:outline-none text-left ${!isHeroStyle ? className : ""} ${showPopover ? "nc-hero-field-focused" : ""
          }`}
      >
        <div className={isHeroStyle ? "text-neutral-500" : isSearchModal ? "text-neutral-400" : "text-neutral-300 dark:text-neutral-400"}>
          <MapPinIcon className={isHeroStyle || isSearchModal ? "w-5 h-5" : "w-5 h-5 lg:w-7 lg:h-7"} />
        </div>
        <div className="flex-grow flex flex-col pr-8">
          <input
            className={`block w-full bg-transparent border-none focus:ring-0 p-0 focus:outline-none ${isHeroStyle ? "text-base font-semibold text-neutral-900 placeholder:text-neutral-500" : isSearchModal ? "text-base font-semibold text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500" : "focus:placeholder-neutral-300 xl:text-lg font-semibold placeholder-neutral-800 dark:placeholder-neutral-200"} truncate`}
            placeholder={placeHolder}
            value={selectedAirport ? `${selectedAirport.city}, ${selectedAirport.country}` : ""}
            readOnly
            ref={inputRef}
          />
          {(isHeroStyle || isSearchModal) && desc && (
            <span className={`block mt-0.5 text-xs font-medium uppercase tracking-wide ${isHeroStyle ? "text-neutral-600" : "text-neutral-500 dark:text-neutral-400"}`}>
              <span className="line-clamp-1">{desc}</span>
            </span>
          )}
          {!isHeroStyle && !isSearchModal && (
            <span className="block mt-0.5 text-sm text-neutral-400 font-light ">
              <span className="line-clamp-1">{!!selectedAirport ? placeHolder : desc}</span>
            </span>
          )}
        </div>
        {selectedAirport && (
          <ClearDataButton
            onClick={() => {
              setValue("");
              onLocationSelect?.(null as any);
            }}
            variant={isHeroStyle ? "hero" : "default"}
          />
        )}
      </div>

      {showPopover && !isHeroStyle && !isSearchModal && (
        <div
          className={`h-8 absolute self-center top-1/2 -translate-y-1/2 z-0 bg-white dark:bg-neutral-800 ${divHideVerticalLineClass}`}
        ></div>
      )}

      {showPopover && (
        <div
          className={`absolute ${isHeroStyle || isSearchModal ? "left-1/2 w-[calc(100%+2rem)] min-w-[400px]" : "left-0 min-w-[400px] sm:min-w-[560px]"} z-[9999] bg-white dark:bg-neutral-800 top-full mt-3 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700`}
          style={{
            ...(isHeroStyle || isSearchModal ? {
              transform: isSearchModalPopup ? 'translateX(calc(-50% + 10px))' : 'translateX(calc(-50% + 5px))'
            } : {})
          }}
        >
          {/* Search Input - Fixed at top */}
          <div className="sticky top-0 bg-white dark:bg-neutral-800 px-4 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-700 z-10">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm thành phố, sân bay..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              {value && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setValue("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          {value ? renderSearchValue() : renderRecentSearches()}
        </div>
      )}
    </div>
  );
};

export default LocationInput;
