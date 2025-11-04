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

export interface FlightSearchFormProps {
  variant?: "default" | "heroRed";
}


export type TypeDropOffLocationType = "roundTrip" | "oneWay" | "";

const FlightSearchForm: FC<FlightSearchFormProps> = ({ variant = "default" }) => {
  const router = useRouter();
  const { searchData, updateDepartureAirport, updateArrivalAirport, updateTripType, updatePassengers } = useSearch();

  const [dropOffLocationType, setDropOffLocationType] =
    useState<TypeDropOffLocationType>("roundTrip");

  const [guestAdultsInputValue, setGuestAdultsInputValue] = useState(1);
  const [guestChildrenInputValue, setGuestChildrenInputValue] = useState(0);
  const [guestInfantsInputValue, setGuestInfantsInputValue] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [findCheapest, setFindCheapest] = useState(true);
  const isHeroRed = variant === "heroRed";



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

  // Đồng bộ passenger data với context khi component mount
  useEffect(() => {
    // Cập nhật context với giá trị hiện tại của form
    updatePassengers({
      adults: guestAdultsInputValue,
      children: guestChildrenInputValue,
      infants: guestInfantsInputValue,
    });
  }, []); // Chỉ chạy một lần khi component mount

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
    // Validate dữ liệu trước khi tìm kiếm
    if (!searchData.departureAirport) {
      alert("Vui lòng chọn điểm khởi hành");
      return;
    }

    if (!searchData.arrivalAirport) {
      alert("Vui lòng chọn điểm đến");
      return;
    }

    if (!searchData.departureDate) {
      alert("Vui lòng chọn ngày đi");
      return;
    }

    if (dropOffLocationType === "roundTrip" && !searchData.returnDate) {
      alert("Vui lòng chọn ngày về cho chuyến khứ hồi");
      return;
    }

    // Log để debug
    console.log("🔍 Searching flights with data:", {
      departureAirport: searchData.departureAirport,
      arrivalAirport: searchData.arrivalAirport,
      departureDate: searchData.departureDate,
      returnDate: searchData.returnDate,
      tripType: dropOffLocationType,
      passengers: searchData.passengers,
    });

    // Cập nhật loại chuyến bay vào context
    updateTripType(dropOffLocationType as 'roundTrip' | 'oneWay');

    // Điều hướng dựa trên loại chuyến bay được chọn
    if (dropOffLocationType === "roundTrip") {
      router.push("/book-plane/select-flight-recovery");
    } else if (dropOffLocationType === "oneWay") {
      router.push("/book-plane/select-flight");
    }
  };

  const renderGuest = (appearance: "default" | "hero" = isHeroRed ? "hero" : "default") => {
    if (appearance === "hero") {
      return (
        <Popover className="relative w-full">
          {({ open }) => (
            <>
              <Popover.Button
                as="button"
                className={`flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-[0_20px_45px_-32px_rgba(0,0,0,0.35)] transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ffbc00] ${open ? "ring-2 ring-[#ffbc00]/70" : "ring-1 ring-white/60"
                  }`}
              >
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
                    Hành khách
                  </span>
                  <span className="mt-1 text-base font-semibold text-neutral-900">
                    {totalGuests} khách
                  </span>
                </div>
                <ChevronDownIcon
                  className={`${open ? "-rotate-180 text-[#d70018]" : "text-neutral-400"} h-5 w-5 transition duration-200`}
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
                <Popover.Panel className="absolute z-[9999] w-full sm:min-w-[380px] max-w-sm bg-white dark:bg-neutral-800 top-full mt-3 left-1/2 -translate-x-1/2 py-6 px-6 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 border border-neutral-100 dark:border-neutral-700">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Chọn số lượng khách</h3>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Tối đa 9 khách</p>
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

                    <div className="border-t border-neutral-200 pt-4 dark:border-neutral-600">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">Tổng cộng:</span>
                        <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{totalGuests} khách</span>
                      </div>
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      );
    }

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
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">Tổng cộng:</span>
                      <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{totalGuests} khách</span>
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

  const renderHeroHeader = () => {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full bg-white/15 p-1">
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-150 ${dropOffLocationType === "roundTrip"
              ? "bg-white text-[#d70018] shadow-lg"
              : "text-white/80 hover:bg-white/10"
              }`}
            onClick={() => setDropOffLocationType("roundTrip")}
          >
            Khứ hồi
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-150 ${dropOffLocationType === "oneWay"
              ? "bg-white text-[#d70018] shadow-lg"
              : "text-white/80 hover:bg-white/10"
              }`}
            onClick={() => setDropOffLocationType("oneWay")}
          >
            Một chiều
          </button>
        </div>

      </div>
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
    if (isHeroRed) {
      const heroFieldClass = "w-full rounded-2xl bg-white text-neutral-900 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.45)] ring-1 ring-white/60";

      return (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch();
          }}
          className="relative rounded-[32px] bg-gradient-to-br from-[#d70018] via-[#e31638] to-[#ff6d36] text-white shadow-[0_44px_88px_-48px_rgba(215,0,24,0.8)]"
          style={{ overflow: 'visible' }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_68%)] opacity-75 rounded-[32px]" style={{ overflow: 'hidden' }} />
          <div className="relative flex flex-col gap-6 p-6 sm:p-8 pointer-events-auto">


            {renderHeroHeader()}

            <div className="space-y-4">
              <LocationInput
                placeHolder="Điểm khởi hành"
                desc="Chọn thành phố xuất phát"
                className={heroFieldClass}
                divHideVerticalLineClass="hidden"
                airports={airports}
                onLocationSelect={handleDepartureSelect}
                selectedAirport={searchData.departureAirport}
              />
              <LocationInput
                placeHolder="Điểm đến"
                desc="Chọn thành phố bạn muốn tới"
                className={heroFieldClass}
                divHideVerticalLineClass="hidden"
                airports={airports}
                onLocationSelect={handleArrivalSelect}
                selectedAirport={searchData.arrivalAirport}
              />
              <FlightDateRangeInput
                selectsRange={dropOffLocationType !== "oneWay"}
                className={`${heroFieldClass} items-center`}
                hasButtonSubmit={false}
                onSubmit={handleSearch}
              />
              {renderGuest("hero")}
              <div className={`${heroFieldClass} flex flex-col gap-2 px-5 py-4`}>
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  Mã khuyến mại
                </span>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(event) => setPromoCode(event.target.value)}
                  placeholder="Nhập mã của bạn"
                  className="w-full border-none bg-transparent text-base font-semibold text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm font-medium text-white/90">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/40 bg-transparent text-[#ffbc00] focus:outline-none focus:ring-0 accent-[#ffbc00]"
                checked={findCheapest}
                onChange={(event) => setFindCheapest(event.target.checked)}
              />
              Tìm vé rẻ nhất
            </label>

            <button
              type="submit"
              className="mt-2 h-14 rounded-2xl bg-[#ffc400] text-lg font-semibold text-[#8a4800] shadow-[0_26px_52px_-32px_rgba(0,0,0,0.55)] transition duration-200 hover:bg-[#ffd23c] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ffc400]/70"
            >
              Tìm chuyến bay
            </button>
          </div>
        </form>
      );
    }

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
