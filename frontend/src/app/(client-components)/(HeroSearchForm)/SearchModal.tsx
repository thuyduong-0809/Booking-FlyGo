"use client";

import React, { FC, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LocationInput from "./LocationInput";
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { Fragment } from "react";
import NcInputNumber from "@/components/NcInputNumber";
import FlightDateRangeInput from "./(flight-search-form)/FlightDateRangeInput";
import { GuestsObject } from "../type";
import { airportsService, Airport } from "../../../services/airports.service";
import { useSearch } from "../../book-plane/SearchContext";
import { useNotification } from "@/components/Notification";
import { flightsService } from "../../../services/flights.service";

export interface SearchModalProps {
    className?: string;
}

export type TypeDropOffLocationType = "roundTrip" | "oneWay" | "";

const SearchModal: FC<SearchModalProps> = ({ className = "" }) => {
    const router = useRouter();
    const { searchData, updateDepartureAirport, updateArrivalAirport, updateTripType, updatePassengers } = useSearch();
    const { showNotification } = useNotification();

    const [isVisible, setIsVisible] = useState(false);
    const [dropOffLocationType, setDropOffLocationType] = useState<TypeDropOffLocationType>("roundTrip");
    const [airports, setAirports] = useState<Airport[]>([]);
    const [guestAdultsInputValue, setGuestAdultsInputValue] = useState(1);
    const [guestChildrenInputValue, setGuestChildrenInputValue] = useState(0);
    const [guestInfantsInputValue, setGuestInfantsInputValue] = useState(0);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Hiển thị thanh search khi scroll xuống quá 300px
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Fetch airports data
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

    // Đồng bộ passenger data với context
    useEffect(() => {
        updatePassengers({
            adults: guestAdultsInputValue,
            children: guestChildrenInputValue,
            infants: guestInfantsInputValue,
        });
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

        updatePassengers({
            adults: newValue.guestAdults,
            children: newValue.guestChildren,
            infants: newValue.guestInfants,
        });
    };

    const handleDepartureSelect = (airport: Airport) => {
        updateDepartureAirport(airport);
    };

    const handleArrivalSelect = (airport: Airport) => {
        updateArrivalAirport(airport);
    };

    const totalGuests = guestChildrenInputValue + guestAdultsInputValue + guestInfantsInputValue;

    const handleSearch = async () => {
        // Validation
        if (!searchData.departureAirport) {
            showNotification(
                'warning',
                'Vui lòng chọn điểm khởi hành',
                ['Bạn cần chọn sân bay khởi hành để tiếp tục']
            );
            return;
        }
        if (!searchData.arrivalAirport) {
            showNotification(
                'warning',
                'Vui lòng chọn điểm đến',
                ['Bạn cần chọn sân bay đến để tiếp tục']
            );
            return;
        }
        if (!searchData.departureDate) {
            showNotification(
                'warning',
                'Vui lòng chọn ngày đi',
                ['Bạn cần chọn ngày khởi hành để tiếp tục']
            );
            return;
        }

        // Validate ngày đi phải lớn hơn hoặc bằng ngày hiện tại
        const departureDate = new Date(searchData.departureDate);
        departureDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (departureDate < today) {
            showNotification(
                'error',
                'Ngày đi không hợp lệ',
                ['Ngày đi phải lớn hơn hoặc bằng ngày hiện tại']
            );
            return;
        }

        if (dropOffLocationType === "roundTrip") {
            if (!searchData.returnDate) {
                showNotification(
                    'warning',
                    'Vui lòng chọn ngày về',
                    ['Chuyến khứ hồi yêu cầu cả ngày đi và ngày về']
                );
                return;
            }

            // Validate ngày về phải lớn hơn hoặc bằng ngày hiện tại
            const returnDate = new Date(searchData.returnDate);
            returnDate.setHours(0, 0, 0, 0);

            if (returnDate < today) {
                showNotification(
                    'error',
                    'Ngày về không hợp lệ',
                    ['Ngày về phải lớn hơn hoặc bằng ngày hiện tại']
                );
                return;
            }
        }

        // Kiểm tra chuyến bay có tồn tại không trước khi điều hướng
        setIsSearching(true);
        try {
            const formatDate = (date: Date) => {
                // Sử dụng local date thay vì ISO để tránh timezone issue
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const formatted = `${year}-${month}-${day}`;

                console.log('📅 SearchModal formatDate:', {
                    input: date.toISOString(),
                    inputLocal: date.toLocaleDateString('vi-VN'),
                    output: formatted
                });

                return formatted;
            };

            // Tìm kiếm chuyến đi
            const searchParams = {
                departureAirportCode: searchData.departureAirport?.airportCode,
                arrivalAirportCode: searchData.arrivalAirport?.airportCode,
                departureDate: formatDate(searchData.departureDate)
            };

            console.log('🔍 DEBUG SearchModal - Params gửi lên:', {
                ...searchParams,
                departureAirport: searchData.departureAirport,
                arrivalAirport: searchData.arrivalAirport,
                rawDate: searchData.departureDate
            });

            const departureSearchResult = await flightsService.searchFlights(searchParams);

            console.log('📥 DEBUG SearchModal - Response nhận về:', {
                success: departureSearchResult.success,
                dataLength: departureSearchResult.data?.length || 0,
                firstFlight: departureSearchResult.data?.[0]
            });

            // Kiểm tra chuyến đi
            if (!departureSearchResult.success || !departureSearchResult.data || departureSearchResult.data.length === 0) {
                showNotification(
                    'error',
                    'Không tìm thấy chuyến bay',
                    [
                        `Không có chuyến bay từ ${searchData.departureAirport?.city} đến ${searchData.arrivalAirport?.city}`,
                        `Ngày: ${searchData.departureDate?.toLocaleDateString('vi-VN')}`,
                        'Vui lòng chọn điểm khác hoặc thử ngày khác'
                    ]
                );
                setIsSearching(false);
                return;
            }

            console.log(`✅ Tìm thấy ${departureSearchResult.data.length} chuyến bay đi`);

            // Nếu là khứ hồi, kiểm tra cả chuyến về
            if (dropOffLocationType === "roundTrip" && searchData.returnDate) {
                const returnSearchResult = await flightsService.searchFlights({
                    departureAirportCode: searchData.arrivalAirport?.airportCode,
                    arrivalAirportCode: searchData.departureAirport?.airportCode,
                    departureDate: formatDate(searchData.returnDate)
                });

                if (!returnSearchResult.success || !returnSearchResult.data || returnSearchResult.data.length === 0) {
                    showNotification(
                        'error',
                        'Không tìm thấy chuyến bay về',
                        [
                            `Không có chuyến bay từ ${searchData.arrivalAirport?.city} về ${searchData.departureAirport?.city}`,
                            `Ngày: ${searchData.returnDate?.toLocaleDateString('vi-VN')}`,
                            'Vui lòng chọn ngày khác hoặc chọn chuyến một chiều'
                        ]
                    );
                    setIsSearching(false);
                    return;
                }

                console.log(`✅ Tìm thấy ${returnSearchResult.data.length} chuyến bay về`);
            }

            // Nếu tất cả đều OK, cập nhật loại chuyến bay và điều hướng
            updateTripType(dropOffLocationType as 'roundTrip' | 'oneWay');

            console.log('🎉 Có chuyến bay! Đang chuyển hướng...');

            if (dropOffLocationType === "roundTrip") {
                router.push("/book-plane/select-flight-recovery");
            } else if (dropOffLocationType === "oneWay") {
                router.push("/book-plane/select-flight");
            }
        } catch (error: any) {
            showNotification(
                'error',
                'Lỗi khi tìm kiếm chuyến bay',
                [error.message || 'Không thể kết nối đến server. Vui lòng thử lại sau']
            );
        } finally {
            setIsSearching(false);
        }
    };

    const renderGuest = () => {
        return (
            <Popover className="relative w-full h-full">
                {({ open }) => (
                    <>
                        <Popover.Button
                            as="button"
                            className={`flex w-full h-full items-center justify-between bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all px-3.5 focus:outline-none ${open ? "ring-2 ring-red-500" : ""}`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-neutral-600 dark:text-neutral-400 flex-shrink-0">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                </svg>
                                <div className="flex flex-col items-start min-w-0">
                                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Hành khách</span>
                                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                                        {totalGuests} người
                                    </span>
                                </div>
                            </div>
                            <ChevronDownIcon
                                className={`${open ? "rotate-180" : ""} h-4 w-4 text-neutral-500 transition-transform flex-shrink-0`}
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
                            <Popover.Panel className="absolute z-[10000] w-full sm:min-w-[400px] max-w-md bg-white dark:bg-neutral-800 top-full mt-3 left-1/2 -translate-x-1/2 rounded-2xl shadow-2xl ring-1 ring-neutral-200 dark:ring-neutral-700 overflow-hidden">
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="text-center mb-6 pb-4 border-b border-neutral-100 dark:border-neutral-700">
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Chọn số lượng khách</h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
                                            Tối đa 9 hành khách
                                        </p>
                                    </div>

                                    {/* Guest inputs */}
                                    <div className="space-y-4">
                                        <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-4 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                                            <NcInputNumber
                                                className="w-full"
                                                defaultValue={guestAdultsInputValue}
                                                onChange={(value) => handleChangeData(value, "guestAdults")}
                                                max={9}
                                                min={1}
                                                label="Người lớn"
                                                desc="Từ 13 tuổi trở lên"
                                            />
                                        </div>
                                        <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-4 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                                            <NcInputNumber
                                                className="w-full"
                                                defaultValue={guestChildrenInputValue}
                                                onChange={(value) => handleChangeData(value, "guestChildren")}
                                                max={4}
                                                min={0}
                                                label="Trẻ em"
                                                desc="Từ 2 đến 12 tuổi"
                                            />
                                        </div>
                                        <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-4 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
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
                                    </div>

                                    {/* Total */}
                                    <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-700">
                                        <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600 dark:text-blue-400">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                                    </svg>
                                                </div>
                                                <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">Tổng cộng</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalGuests}</span>
                                                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">khách</span>
                                            </div>
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

    if (!isVisible) return null;

    return (
        <div
            className={`hidden lg:block fixed top-16 sm:top-20 left-0 right-0 z-[9990] bg-white dark:bg-neutral-900 shadow-lg border-b border-neutral-200 dark:border-neutral-700 animate-slideDown ${className}`}
        >
            <div className="container mx-auto px-4">
                <div className="py-2">
                    {/* Radio buttons row */}
                    <div className="flex items-center gap-3 mb-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="tripType"
                                checked={dropOffLocationType === "roundTrip"}
                                onChange={() => setDropOffLocationType("roundTrip")}
                                className="sr-only"
                            />
                            <div className="relative flex items-center justify-center w-5 h-5">
                                <div className={`w-5 h-5 rounded-full border-2 transition-all ${dropOffLocationType === "roundTrip"
                                    ? "border-red-600 bg-red-600"
                                    : "border-neutral-400 bg-transparent"
                                    }`}></div>
                                <svg
                                    className={`absolute w-3 h-3 text-white transition-opacity ${dropOffLocationType === "roundTrip" ? "opacity-100" : "opacity-0"
                                        }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <span className={`text-sm font-medium transition-colors ${dropOffLocationType === "roundTrip"
                                ? "text-red-600 dark:text-red-400"
                                : "text-neutral-700 dark:text-neutral-300"
                                } group-hover:text-neutral-900 dark:group-hover:text-neutral-100`}>
                                Khứ hồi
                            </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="tripType"
                                checked={dropOffLocationType === "oneWay"}
                                onChange={() => setDropOffLocationType("oneWay")}
                                className="sr-only"
                            />
                            <div className="relative flex items-center justify-center w-5 h-5">
                                <div className={`w-5 h-5 rounded-full border-2 transition-all ${dropOffLocationType === "oneWay"
                                    ? "border-red-600 bg-red-600"
                                    : "border-neutral-400 bg-transparent"
                                    }`}></div>
                                <svg
                                    className={`absolute w-3 h-3 text-white transition-opacity ${dropOffLocationType === "oneWay" ? "opacity-100" : "opacity-0"
                                        }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <span className={`text-sm font-medium transition-colors ${dropOffLocationType === "oneWay"
                                ? "text-red-600 dark:text-red-400"
                                : "text-neutral-700 dark:text-neutral-300"
                                } group-hover:text-neutral-900 dark:group-hover:text-neutral-100`}>
                                Một chiều
                            </span>
                        </label>
                    </div>

                    {/* Search fields - Responsive Layout */}
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-2.5">
                        {/* Location inputs group */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:flex-1">
                            {/* Departure input */}
                            <div className="flex-1 min-w-0 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all h-[60px] flex items-center px-4">
                                <LocationInput
                                    placeHolder="Điểm khởi hành"
                                    desc="CHỌN THÀNH PHỐ XUẤT PHÁT"
                                    className="bg-transparent px-0 py-0 h-full flex items-center w-full search-modal-popup"
                                    divHideVerticalLineClass="hidden"
                                    airports={airports}
                                    onLocationSelect={handleDepartureSelect}
                                    selectedAirport={searchData.departureAirport}
                                />
                            </div>

                            {/* Swap button */}
                            <button
                                type="button"
                                className="w-full sm:w-[44px] h-[44px] sm:h-[60px] flex-shrink-0 rounded-xl sm:rounded-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center justify-center group order-last sm:order-none"
                                onClick={() => {
                                    const temp = searchData.departureAirport;
                                    updateDepartureAirport(searchData.arrivalAirport);
                                    updateArrivalAirport(temp);
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2.5}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-red-600 sm:group-hover:rotate-180 transition-transform duration-300"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                                    />
                                </svg>
                                <span className="ml-2 text-sm font-medium text-red-600 sm:hidden">Đổi điểm</span>
                            </button>

                            {/* Arrival input */}
                            <div className="flex-1 min-w-0 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all h-[60px] flex items-center px-4">
                                <LocationInput
                                    placeHolder="Điểm đến"
                                    desc="CHỌN THÀNH PHỐ BẠN MUỐN TỚI"
                                    className="bg-transparent px-0 py-0 h-full flex items-center w-full search-modal-popup"
                                    divHideVerticalLineClass="hidden"
                                    airports={airports}
                                    onLocationSelect={handleArrivalSelect}
                                    selectedAirport={searchData.arrivalAirport}
                                />
                            </div>
                        </div>

                        {/* Date and Guest inputs group */}
                        <div className="flex flex-col sm:flex-row items-stretch gap-2 lg:flex-1">
                            {/* Date input */}
                            <div className="flex-1 min-w-0 h-[60px]">
                                <FlightDateRangeInput
                                    selectsRange={dropOffLocationType !== "oneWay"}
                                    className="bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all h-full"
                                    fieldClassName="px-4 py-0 h-full flex items-center"
                                    hasButtonSubmit={false}
                                    onSubmit={handleSearch}
                                />
                            </div>

                            {/* Guest selector */}
                            <div className="flex-1 min-w-0 h-[60px]">
                                {renderGuest()}
                            </div>
                        </div>

                        {/* Search button */}
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="w-full lg:w-auto px-8 h-[60px] bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-neutral-900 font-bold text-sm rounded-xl transition-all flex-shrink-0 whitespace-nowrap shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSearching && (
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isSearching ? 'Đang tìm...' : 'Tìm chuyến bay'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
