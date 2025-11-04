"use client";

import React, { Fragment, useState, useEffect } from "react";
import { FC } from "react";
import DatePicker from "react-datepicker";
import { Popover, Transition } from "@headlessui/react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import DatePickerCustomHeaderTwoMonth from "@/components/DatePickerCustomHeaderTwoMonth";
import DatePickerCustomDay from "@/components/DatePickerCustomDay";
import ClearDataButton from "../ClearDataButton";
import ButtonSubmit from "../ButtonSubmit";
import { vi } from "date-fns/locale";
import { useSearch } from "../../../book-plane/SearchContext";

export interface FlightDateRangeInputProps {
  className?: string;
  fieldClassName?: string;
  hasButtonSubmit?: boolean;
  selectsRange?: boolean;
  onSubmit?: () => void;
}

const FlightDateRangeInput: FC<FlightDateRangeInputProps> = ({
  className = "",
  fieldClassName = "[ nc-hero-field-padding ]",
  hasButtonSubmit = true,
  selectsRange = true,
  onSubmit,
}) => {
  const { searchData, updateDepartureDate, updateReturnDate } = useSearch();
  const today = new Date();
  const [startDate, setStartDate] = useState<Date | null>(
    searchData.departureDate || today
  );
  const [endDate, setEndDate] = useState<Date | null>(
    searchData.returnDate || new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
  );

  // Đồng bộ state với context khi searchData thay đổi
  useEffect(() => {
    if (searchData.departureDate) {
      setStartDate(searchData.departureDate);
    }
    if (searchData.returnDate) {
      setEndDate(searchData.returnDate);
    }
  }, [searchData.departureDate, searchData.returnDate]);

  // Cập nhật context với giá trị mặc định khi component mount
  useEffect(() => {
    if (!searchData.departureDate) {
      updateDepartureDate(startDate);
    }
    if (!searchData.returnDate) {
      updateReturnDate(endDate);
    }
  }, []); // Chỉ chạy một lần khi component mount

  const onChangeRangeDate = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    // Debug: Log dates để kiểm tra
    console.log('FlightDateRangeInput - onChangeRangeDate:', { start, end });

    // Cập nhật context với ngày đi và ngày về
    updateDepartureDate(start);
    updateReturnDate(end);
  };

  const renderInput = () => {
    // Kiểm tra nếu là hero style
    const isHeroStyle = className.includes("rounded-2xl") && className.includes("shadow-");

    return (
      <>
        <div className={isHeroStyle ? "text-neutral-400" : "text-neutral-300 dark:text-neutral-400"}>
          <CalendarIcon className={isHeroStyle ? "w-5 h-5" : "w-5 h-5 lg:w-7 lg:h-7"} />
        </div>
        <div className="flex-grow text-left">
          <span className={`block ${isHeroStyle ? "text-base" : "xl:text-lg"} font-semibold ${isHeroStyle ? "text-neutral-900" : ""}`}>
            {startDate?.toLocaleDateString("vi-VN", {
              month: "short",
              day: "2-digit",
            }) || "Chọn ngày"}
            {selectsRange && endDate
              ? " - " +
              endDate?.toLocaleDateString("vi-VN", {
                month: "short",
                day: "2-digit",
              })
              : ""}
          </span>
          <span className={`block mt-1 leading-none font-${isHeroStyle ? "semibold" : "light"} ${isHeroStyle ? "text-xs uppercase tracking-wide text-neutral-600" : "text-sm text-neutral-400"}`}>
            {selectsRange ? "Ngày đi - Ngày về" : "Ngày đi"}
          </span>
        </div>
      </>
    );
  };

  return (
    <>
      <Popover className={`FlightDateRangeInput relative flex ${className}`}>
        {({ open }) => {
          const isHeroStyle = className.includes("rounded-2xl") && className.includes("shadow-");

          return (
            <>
              <div
                className={`flex-1 z-10 flex items-center focus:outline-none ${open ? "nc-hero-field-focused" : ""
                  }`}
              >
                <Popover.Button
                  className={`flex-1 z-10 flex relative ${isHeroStyle ? "px-4 py-4" : fieldClassName} items-center space-x-3 focus:outline-none `}
                >
                  {renderInput()}

                  {startDate && open && (
                    <ClearDataButton
                      onClick={() => onChangeRangeDate([null, null])}
                    />
                  )}
                </Popover.Button>

                {/* BUTTON SUBMIT OF FORM */}
                {hasButtonSubmit && (
                  <div className="pr-2 xl:pr-4">
                    {onSubmit ? (
                      <button
                        onClick={onSubmit}
                        type="button"
                        className="h-14 md:h-16 w-full md:w-16 rounded-full bg-primary-6000 hover:bg-primary-700 flex items-center justify-center text-neutral-50 focus:outline-none"
                      >
                        <span className="mr-3 md:hidden">Search</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </button>
                    ) : (
                      <ButtonSubmit href={"/book-plane/select-flight" as any} />
                    )}
                  </div>
                )}
              </div>

              {open && !isHeroStyle && (
                <div className="h-8 absolute self-center top-1/2 -translate-y-1/2 z-0 -left-0.5 right-10 bg-white dark:bg-neutral-800"></div>
              )}

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute left-1/2 z-[9999] mt-3 top-full w-screen max-w-sm -translate-x-1/2 transform px-4 sm:px-0 lg:max-w-3xl">
                  <div className="overflow-visible rounded-3xl shadow-2xl ring-1 ring-black ring-opacity-5 bg-white dark:bg-neutral-800 p-8">
                    {selectsRange ? (
                      <DatePicker
                        selected={startDate}
                        onChange={onChangeRangeDate}
                        startDate={startDate}
                        endDate={endDate}
                        selectsRange
                        monthsShown={2}
                        showPopperArrow={false}
                        inline
                        locale={vi}
                        renderCustomHeader={(p) => (
                          <DatePickerCustomHeaderTwoMonth {...p} />
                        )}
                        renderDayContents={(day, date) => (
                          <DatePickerCustomDay dayOfMonth={day} date={date} />
                        )}
                      />
                    ) : (
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => {
                          setStartDate(date);
                          updateDepartureDate(date);
                        }}
                        monthsShown={2}
                        showPopperArrow={false}
                        inline
                        locale={vi}
                        renderCustomHeader={(p) => (
                          <DatePickerCustomHeaderTwoMonth {...p} />
                        )}
                        renderDayContents={(day, date) => (
                          <DatePickerCustomDay dayOfMonth={day} date={date} />
                        )}
                      />
                    )}
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          );
        }}
      </Popover>
    </>
  );
};

export default FlightDateRangeInput;
