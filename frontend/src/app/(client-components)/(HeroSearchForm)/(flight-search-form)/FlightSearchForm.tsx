"use client";

import React, { FC, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LocationInput from "../LocationInput";
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { Fragment } from "react";
import NcInputNumber from "@/components/NcInputNumber";
import FlightDateRangeInput from "./FlightDateRangeInput";
import { GuestsObject } from "../../type";
import { airportsService, Airport } from "../../../../services/airports.service";
import { useSearch } from "../../../book-plane/SearchContext";

export interface FlightSearchFormProps { }


export type TypeDropOffLocationType = "roundTrip" | "oneWay" | "";

const FlightSearchForm: FC<FlightSearchFormProps> = ({ }) => {
  const router = useRouter();
  const { searchData, updateDepartureAirport, updateArrivalAirport, updateTripType, updatePassengers } = useSearch();

  const [dropOffLocationType, setDropOffLocationType] =
    useState<TypeDropOffLocationType>("roundTrip");

  const [guestAdultsInputValue, setGuestAdultsInputValue] = useState(1);
  const [guestChildrenInputValue, setGuestChildrenInputValue] = useState(0);
  const [guestInfantsInputValue, setGuestInfantsInputValue] = useState(0);

  // State cho airports và location selection
  const [airports, setAirports] = useState<Airport[]>([]);

  // Fetch airports data khi component mount
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await airportsService.getAllAirports();
        if (response.success && response.data) {
          setAirports(response.data);
        }
      } catch (error) {
        console.error("Error fetching airports:", error);
      }
    };

    fetchAirports();
  }, []);

  const handleChangeData = (value: number, type: keyof GuestsObject) => {
    let newValue = {
      guestAdults: guestAdultsInputValue,
      guestChildren: guestChildrenInputValue,
      guestInfants: guestInfantsInputValue,
    };
    if (type === "guestAdults") {
      setGuestAdultsInputValue(value);
      newValue.guestAdults = value;
    }
    if (type === "guestChildren") {
      setGuestChildrenInputValue(value);
      newValue.guestChildren = value;
    }
    if (type === "guestInfants") {
      setGuestInfantsInputValue(value);
      newValue.guestInfants = value;
    }

    // Cập nhật context với thông tin hành khách
    updatePassengers({
      adults: newValue.guestAdults,
      children: newValue.guestChildren,
      infants: newValue.guestInfants,
    });
  };

  // Handler cho việc chọn departure airport
  const handleDepartureSelect = (airport: Airport) => {
    updateDepartureAirport(airport);
  };

  // Handler cho việc chọn arrival airport
  const handleArrivalSelect = (airport: Airport) => {
    updateArrivalAirport(airport);
  };

  const totalGuests =
    guestChildrenInputValue + guestAdultsInputValue + guestInfantsInputValue;

  const handleSearch = () => {
    // Cập nhật loại chuyến bay vào context
    updateTripType(dropOffLocationType as 'roundTrip' | 'oneWay');

    // Điều hướng dựa trên loại chuyến bay được chọn
    if (dropOffLocationType === "roundTrip") {
      router.push("/book-plane/select-flight-recovery");
    } else if (dropOffLocationType === "oneWay") {
      router.push("/book-plane/select-flight");
    }
  };

  const renderGuest = () => {
    return (
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button
              as="button"
              className={`
           ${open ? "bg-neutral-100 dark:bg-neutral-700" : ""}
            px-5 py-3 rounded-full inline-flex items-center font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-opacity-75 text-sm transition-all duration-200 border border-neutral-200 dark:border-neutral-600`}
            >
              <span className="text-neutral-700 dark:text-neutral-300">{`${totalGuests || ""} Khách`}</span>
              <ChevronDownIcon
                className={`${open ? "rotate-180" : "rotate-0"
                  } ml-2 h-4 w-4 text-neutral-500 dark:text-neutral-400 transition-all duration-200`}
                aria-hidden="true"
              />
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute z-20 w-full sm:min-w-[380px] max-w-sm bg-white dark:bg-neutral-800 top-full mt-3 left-1/2 -translate-x-1/2 py-6 px-6 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 border border-neutral-100 dark:border-neutral-700">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Chọn số lượng khách</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Tối đa 9 khách</p>
                  </div>

                  <div className="space-y-5">
                    <NcInputNumber
                      className="w-full"
                      defaultValue={guestAdultsInputValue}
                      onChange={(value) => handleChangeData(value, "guestAdults")}
                      max={9}
                      min={1}
                      label="Người lớn"
                      desc="Từ 13 tuổi trở lên"
                    />
                    <NcInputNumber
                      className="w-full"
                      defaultValue={guestChildrenInputValue}
                      onChange={(value) => handleChangeData(value, "guestChildren")}
                      max={4}
                      min={0}
                      label="Trẻ em"
                      desc="Từ 2 đến 12 tuổi"
                    />
                    <NcInputNumber
                      className="w-full"
                      defaultValue={guestInfantsInputValue}
                      onChange={(value) => handleChangeData(value, "guestInfants")}
                      max={4}
                      min={0}
                      label="Em bé"
                      desc="Dưới 2 tuổi"
                    />
                  </div>

                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-600">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Tổng cộng:</span>
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{totalGuests} khách</span>
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  };


  const renderRadioBtn = () => {
    return (
      <div className=" py-5 [ nc-hero-field-padding ] flex flex-row flex-wrap border-b border-neutral-100 dark:border-neutral-700">
        <div
          className={`py-3 px-5 flex items-center rounded-full font-medium text-xs cursor-pointer mr-2 my-1 sm:mr-3 ${dropOffLocationType === "roundTrip"
            ? "bg-black shadow-black/10 shadow-lg text-white"
            : "border border-neutral-300 dark:border-neutral-700"
            }`}
          onClick={(e) => setDropOffLocationType("roundTrip")}
        >
          Khứ hồi
        </div>
        <div
          className={`py-3 px-5 flex items-center rounded-full font-medium text-xs cursor-pointer mr-2 my-1 sm:mr-3 ${dropOffLocationType === "oneWay"
            ? "bg-black text-white shadow-black/10 shadow-lg"
            : "border border-neutral-300 dark:border-neutral-700"
            }`}
          onClick={(e) => setDropOffLocationType("oneWay")}
        >
          1 chiều
        </div>

        <div className="self-center border-r border-slate-200 dark:border-slate-700 h-8 mr-2 my-1 sm:mr-3"></div>

        <div className="my-1">
          {renderGuest()}
        </div>
      </div>
    );
  };

  const renderForm = () => {
    return (
      <form className="w-full relative mt-8 rounded-[40px] xl:rounded-[49px] rounded-t-2xl xl:rounded-t-3xl shadow-xl dark:shadow-2xl bg-white dark:bg-neutral-800">
        {renderRadioBtn()}
        <div className="flex flex-1 rounded-full">
          <LocationInput
            placeHolder="Nơi khởi hành"
            desc="Bạn muốn bay từ đâu?"
            className="flex-1"
            airports={airports}
            onLocationSelect={handleDepartureSelect}
            selectedAirport={searchData.departureAirport}
          />
          <div className="self-center border-r border-slate-200 dark:border-slate-700 h-8"></div>
          <LocationInput
            placeHolder="Nơi đến"
            desc="Bạn muốn bay đến đâu?"
            className="flex-1"
            divHideVerticalLineClass=" -inset-x-0.5"
            airports={airports}
            onLocationSelect={handleArrivalSelect}
            selectedAirport={searchData.arrivalAirport}
          />
          <div className="self-center border-r border-slate-200 dark:border-slate-700 h-8"></div>
          <FlightDateRangeInput
            selectsRange={dropOffLocationType !== "oneWay"}
            className="flex-1"
            hasButtonSubmit={true}
            onSubmit={handleSearch}
          />
        </div>
      </form>
    );
  };

  return renderForm();
};

export default FlightSearchForm;
