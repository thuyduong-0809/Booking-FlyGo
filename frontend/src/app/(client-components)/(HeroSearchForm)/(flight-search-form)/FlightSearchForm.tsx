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

  const [guestAdultsInputValue, setGuestAdultsInputValue] = useState(2);
  const [guestChildrenInputValue, setGuestChildrenInputValue] = useState(1);
  const [guestInfantsInputValue, setGuestInfantsInputValue] = useState(1);

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
           ${open ? "" : ""}
            px-4 py-1.5 rounded-md inline-flex items-center font-medium hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 text-xs`}
            >
              <span>{`${totalGuests || ""} Khách`}</span>
              <ChevronDownIcon
                className={`${open ? "" : "text-opacity-70"
                  } ml-2 h-4 w-4 group-hover:text-opacity-80 transition ease-in-out duration-150`}
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
              <Popover.Panel className="absolute z-20 w-full sm:min-w-[340px] max-w-sm bg-white dark:bg-neutral-800 top-full mt-3 left-1/2 -translate-x-1/2  py-5 sm:py-6 px-4 sm:px-8 rounded-3xl shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                <NcInputNumber
                  className="w-full"
                  defaultValue={guestAdultsInputValue}
                  onChange={(value) => handleChangeData(value, "guestAdults")}
                  max={10}
                  min={1}
                  label="Người lớn"
                  desc="Từ 13 tuổi trở lên"
                />
                <NcInputNumber
                  className="w-full mt-6"
                  defaultValue={guestChildrenInputValue}
                  onChange={(value) => handleChangeData(value, "guestChildren")}
                  max={4}
                  label="Trẻ em"
                  desc="Từ 2 đến 12 tuổi"
                />

                <NcInputNumber
                  className="w-full mt-6"
                  defaultValue={guestInfantsInputValue}
                  onChange={(value) => handleChangeData(value, "guestInfants")}
                  max={4}
                  label="Em bé"
                  desc="Dưới 2 tuổi"
                />
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
          className={`py-1.5 px-4 flex items-center rounded-full font-medium text-xs cursor-pointer mr-2 my-1 sm:mr-3 ${dropOffLocationType === "roundTrip"
            ? "bg-black shadow-black/10 shadow-lg text-white"
            : "border border-neutral-300 dark:border-neutral-700"
            }`}
          onClick={(e) => setDropOffLocationType("roundTrip")}
        >
          Khứ hồi
        </div>
        <div
          className={`py-1.5 px-4 flex items-center rounded-full font-medium text-xs cursor-pointer mr-2 my-1 sm:mr-3 ${dropOffLocationType === "oneWay"
            ? "bg-black text-white shadow-black/10 shadow-lg"
            : "border border-neutral-300 dark:border-neutral-700"
            }`}
          onClick={(e) => setDropOffLocationType("oneWay")}
        >
          1 chiều
        </div>

        <div className="self-center border-r border-slate-200 dark:border-slate-700 h-8 mr-2 my-1 sm:mr-3"></div>

        <div className="my-1 border border-neutral-300 dark:border-neutral-700 rounded-full">
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
