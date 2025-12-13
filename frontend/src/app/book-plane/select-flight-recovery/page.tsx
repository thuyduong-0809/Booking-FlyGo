"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { useBooking } from "../BookingContext";
import { useSearch } from "../SearchContext";
import { flightsService, Flight } from "../../../services/flights.service";
import { requestApi } from "@/lib/api";
import { getCookie } from "@/utils/cookies";
import { useNotification } from "@/components/Notification";

type FareClassType = 'first' | 'business' | 'eco';

interface FareOption {
  name: string;
  price: number;
  soldOut?: boolean;
  tax: number;
  service: number;
  includes: string[];
  excludes: string[];
  classType?: FareClassType;
  isPlaceholder?: boolean;
}

interface FlightItem {
  id: string;
  code: string;
  departTime: string;
  arriveTime: string;
  aircraft: string;
  note?: string;
  fares: FareOption[];
  flightData?: Flight; // Thêm dữ liệu flight từ API
}

const FARE_CLASS_ORDER: Array<{ type: FareClassType; label: string }> = [
  { type: 'first', label: 'FIRST CLASS' },
  { type: 'business', label: 'BUSINESS' },
  { type: 'eco', label: 'ECO' }
];

const normalizeFareName = (name?: string): FareClassType | undefined => {
  if (!name) return undefined;
  const lower = name.toLowerCase();
  if (lower.includes('first') || lower.includes('fist')) return 'first';
  if (lower.includes('business') || lower.includes('bussiness')) return 'business';
  if (lower.includes('eco') || lower.includes('economy')) return 'eco';
  return undefined;
};

const ensureFareSlots = (fares: FareOption[]): FareOption[] => {
  return FARE_CLASS_ORDER.map(({ type, label }) => {
    const matchedFare = fares.find(
      (fare) => fare.classType === type || normalizeFareName(fare.name) === type
    );

    if (matchedFare) {
      return matchedFare.classType
        ? matchedFare
        : { ...matchedFare, classType: type };
    }

    return {
      name: label,
      price: 0,
      tax: 0,
      service: 0,
      includes: [],
      excludes: [],
      soldOut: true,
      classType: type,
      isPlaceholder: true
    };
  });
};

// Recovery flights data - both departure and return flights
const recoveryFlights: FlightItem[] = [];

// Return flights for recovery
const recoveryReturnFlights: FlightItem[] = [];

// Utility functions
const formatVnd = (n: number) => {
  // Làm tròn số về số nguyên để tránh hiển thị phần thập phân
  const roundedNumber = Math.round(n);
  return new Intl.NumberFormat("vi-VN").format(roundedNumber) + " VND";
};

// Component: Flight Route Display
const FlightRoute = ({ type, searchData }: { type: 'departure' | 'return', searchData: any }) => (
  <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-100">
    <div className="flex items-center justify-center">
      <div className="flex items-center space-x-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">
            {type === 'departure' ? searchData.departureAirport?.airportCode : searchData.arrivalAirport?.airportCode}
          </div>
          <div className="text-sm text-gray-600">
            {type === 'departure' ? searchData.departureAirport?.city : searchData.arrivalAirport?.city}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <span className="text-2xl text-gray-600">✈</span>
          <div className="w-12 h-0.5 bg-gray-300"></div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">
            {type === 'departure' ? searchData.arrivalAirport?.airportCode : searchData.departureAirport?.airportCode}
          </div>
          <div className="text-sm text-gray-600">
            {type === 'departure' ? searchData.arrivalAirport?.city : searchData.departureAirport?.city}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Component: Date Navigation
const DateNavigation = ({ selectedDate, setSelectedDate, searchData, type, onMonthYearChange }: {
  selectedDate: number,
  setSelectedDate: (date: number) => void,
  searchData: any,
  type: 'departure' | 'return',
  onMonthYearChange?: (month: number, year: number) => void
}) => {
  function getDateContext(dateObj: Date | undefined, fallbackMonth = 9, fallbackDate = 14) {
    const d = dateObj ? new Date(dateObj) : new Date(2025, fallbackMonth, fallbackDate);
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      date: d.getDate(),
    };
  }
  const getMaxDayOfMonth = (year: number, month: number) => (new Date(year, month + 1, 0).getDate());
  const getInitialDates = () => {
    const { year, month, date: baseDate } = type === 'departure'
      ? getDateContext(searchData.departureDate)
      : getDateContext(searchData.returnDate);
    const maxDay = getMaxDayOfMonth(year, month);
    const arr = [baseDate - 1, baseDate, baseDate + 1, baseDate + 2].filter(d => d >= 1 && d <= maxDay);
    return arr.length > 0 ? arr : [baseDate];
  };
  // State giữ tháng/năm hiện tại của thanh ngày
  const [currYear, setCurrYear] = useState(type === 'departure'
    ? getDateContext(searchData.departureDate).year
    : getDateContext(searchData.returnDate).year);
  const [currMonth, setCurrMonth] = useState(type === 'departure'
    ? getDateContext(searchData.departureDate).month
    : getDateContext(searchData.returnDate).month);
  const [visibleDates, setVisibleDates] = useState(getInitialDates());
  const currentIndex = visibleDates.indexOf(selectedDate);
  const maxDay = getMaxDayOfMonth(currYear, currMonth);

  // Helper function để tạo Date object từ ngày được chọn
  const getCurrentDate = () => {
    return new Date(currYear, currMonth, selectedDate);
  };

  // Helper function để build danh sách ngày hiển thị từ một ngày cụ thể
  const buildDateRange = (startDate: Date) => {
    const dates: number[] = [];
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    const maxDay = getMaxDayOfMonth(year, month);

    // Tạo 4 ngày bắt đầu từ startDate
    for (let i = 0; i < 4; i++) {
      const day = startDate.getDate() + i;
      // Chỉ thêm ngày nếu hợp lệ (từ 1 đến maxDay của tháng đó)
      if (day >= 1 && day <= maxDay) {
        dates.push(day);
      }
    }

    // Đảm bảo có ít nhất 1 ngày
    if (dates.length === 0) {
      dates.push(startDate.getDate());
    }

    return dates;
  };

  // Helper function để chuyển sang ngày tiếp theo
  const getNextDate = () => {
    const currentDate = getCurrentDate();
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);
    return nextDate;
  };

  // Helper function để chuyển sang ngày trước
  const getPrevDate = () => {
    const currentDate = getCurrentDate();
    const prevDate = new Date(currentDate);
    prevDate.setDate(currentDate.getDate() - 1);
    return prevDate;
  };

  const goToPrevious = () => {
    const prevDate = getPrevDate();
    const prevMonth = prevDate.getMonth();
    const prevYear = prevDate.getFullYear();
    const prevDay = prevDate.getDate();

    // Cập nhật visibleDates để hiển thị ngày trước
    const startDate = new Date(prevYear, prevMonth, prevDay - 1); // Bắt đầu từ ngày trước để có 4 ngày
    const newDates = buildDateRange(startDate);

    setVisibleDates(newDates);
    setCurrMonth(prevMonth);
    setCurrYear(prevYear);
    setSelectedDate(prevDay);
    onMonthYearChange?.(prevMonth, prevYear);
  };

  const goToNext = () => {
    // Tính ngày tiếp theo bằng cách +1 ngày vào ngày hiện tại
    const currentDate = new Date(currYear, currMonth, selectedDate);
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);

    const nextMonth = nextDate.getMonth();
    const nextYear = nextDate.getFullYear();
    const nextDay = nextDate.getDate();

    // Cập nhật month/year và selectedDate
    setCurrMonth(nextMonth);
    setCurrYear(nextYear);
    setSelectedDate(nextDay);

    // Xây dựng danh sách ngày hiển thị
    // Bắt đầu từ ngày tiếp theo (hoặc ngày trước nó nếu cần 4 ngày)
    let startDay = nextDay;
    if (nextDay > 1) {
      // Nếu không phải ngày đầu tháng, bắt đầu từ ngày trước để có 4 ngày
      startDay = Math.max(1, nextDay - 1);
    }

    const startDate = new Date(nextYear, nextMonth, startDay);
    const newDates = buildDateRange(startDate);

    setVisibleDates(newDates);
    onMonthYearChange?.(nextMonth, nextYear);
  };

  // Đồng bộ visibleDates khi selectedDate thay đổi (chỉ khi cần thiết)
  React.useEffect(() => {
    // Kiểm tra nếu selectedDate không nằm trong visibleDates
    if (!visibleDates.includes(selectedDate)) {
      // Cập nhật visibleDates để bao gồm selectedDate
      const startDate = new Date(currYear, currMonth, selectedDate - 1);
      const newDates = buildDateRange(startDate);
      setVisibleDates(newDates);
    }
  }, [selectedDate, currMonth, currYear]);

  // Thông báo thay đổi tháng/năm khi state thay đổi
  React.useEffect(() => {
    onMonthYearChange?.(currMonth, currYear);
  }, [currMonth, currYear, onMonthYearChange]);

  // Cập nhật lại tháng/năm khi đổi searchData
  React.useEffect(() => {
    const ctx = type === 'departure'
      ? getDateContext(searchData.departureDate)
      : getDateContext(searchData.returnDate);
    setCurrMonth(ctx.month);
    setCurrYear(ctx.year);
  }, [type, searchData.departureDate, searchData.returnDate]);

  return (
    <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl border border-gray-100">
      <div className="flex items-center justify-center space-x-6">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0 && visibleDates[0] <= 1}
          className={`p-3 rounded-full transition-all duration-300 ${(currentIndex === 0 && visibleDates[0] <= 1)
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-blue-600 hover:bg-blue-50 hover:scale-110 shadow-md'
            }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex space-x-3">
          {visibleDates.map(date => (
            <div
              key={date}
              className={`px-5 py-4 rounded-xl transition-all duration-300 cursor-pointer hover:scale-105 min-w-[120px] ${date === selectedDate
                ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-black shadow-xl transform scale-105 border-2 border-yellow-300'
                : 'bg-gray-50 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg hover:bg-blue-50'
                }`}
              onClick={() => setSelectedDate(date)}
            >
              <div className="text-center">
                <div className={`text-sm font-bold ${date === selectedDate ? 'text-black' : 'text-gray-700'}`}>
                  {(() => {
                    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
                    // Tạo Date object với năm, tháng, ngày để tính đúng thứ trong tuần
                    const dateObj = new Date(currYear, currMonth, date);
                    const dayOfWeek = dayNames[dateObj.getDay()];
                    return `${dayOfWeek} ${date} tháng`;
                  })()}
                </div>
                <div className={`text-sm font-bold ${date === selectedDate ? 'text-black' : 'text-gray-700'}`}>
                  {currMonth + 1}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={goToNext}
          className="p-3 rounded-full transition-all duration-300 text-blue-600 hover:bg-blue-50 hover:scale-110 shadow-md"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Component: Fare Headers
const FareHeaders = () => (
  <div className="grid grid-cols-4 gap-4 mb-4">
    <div></div>
    <div className="text-center bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 rounded-lg py-3 font-bold text-white shadow-lg">
      <div className="text-sm">FIRST CLASS</div>
      <div className="text-xs text-amber-100">Cao cấp</div>
    </div>
    <div className="text-center bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-lg py-3 font-bold text-white shadow-lg">
      <div className="text-sm">BUSINESS</div>
      <div className="text-xs text-red-100">Thương gia</div>
    </div>
    <div className="text-center bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-lg py-3 font-bold text-white shadow-lg">
      <div className="text-sm">ECO</div>
      <div className="text-xs text-green-100">Tiết kiệm</div>
    </div>
  </div>
);

// Component: Flight Details
const FlightDetails = ({ flight }: { flight: FlightItem }) => (
  <div className="bg-gradient-to-br from-yellow-200 via-indigo-50 to-purple-50 rounded-xl p-4 shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-center">
    <div className="text-center">
      <div className="text-xl font-bold text-blue-800 mb-1">{flight.code}</div>
      <div className="text-base text-gray-700 font-semibold mb-1">{flight.departTime} - {flight.arriveTime}</div>
      <div className="text-sm text-gray-600 mb-2">{flight.aircraft}</div>
      <div className="inline-flex items-center px-3 py-1 bg-blue-100 rounded-full">
        <span className="text-lg text-blue-600 mr-1">✈</span>
        <span className="text-blue-700 text-sm font-semibold">{flight.note}</span>
      </div>
    </div>
  </div>
);

// Component: Fare Cell
const FareCell = ({
  fare,
  fareIndex,
  flightId,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand
}: {
  fare: FareOption;
  fareIndex: number;
  flightId: string;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}) => {
  const isPlaceholder = fare.isPlaceholder;
  const isDisabled = fare.soldOut || isPlaceholder;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDisabled) return;
    onSelect();
  };

  const handleToggleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDisabled) return;
    onToggleExpand();
  };

  return (
    <div className="relative h-full">
      <button
        disabled={isDisabled}
        onClick={handleSelect}
        className={`w-full h-full rounded-xl p-4 text-center shadow-lg border transition-all duration-200 relative transform flex flex-col justify-between ${isPlaceholder
          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-dashed border-gray-300"
          : isDisabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
            : isSelected
              ? "bg-gradient-to-br from-white to-blue-50 text-black border-blue-500 shadow-xl hover:scale-105"
              : "bg-gradient-to-br from-white to-gray-50 text-black hover:from-blue-50 hover:to-blue-100 hover:shadow-lg border-gray-200 hover:border-blue-300 hover:scale-105"
          }`}
      >
        {isPlaceholder ? (
          <div className="flex flex-col h-full items-center justify-center space-y-1">
            <span className="text-3xl font-extrabold tracking-widest">X</span>
            <span className="text-xs font-semibold uppercase text-gray-500">Không có hạng</span>
          </div>
        ) : isDisabled ? (
          <div className="flex flex-col items-center">
            <svg className="w-6 h-6 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-xs font-semibold uppercase text-gray-500">Chỗ ngồi đã được đặt hết</span>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-grow">
              <div className="text-lg font-bold mb-1">{formatVnd(fare.price)}</div>
              <div className="text-sm text-gray-600 mb-2">1 người</div>
            </div>
            <div className="mt-auto">
              <button
                onClick={handleToggleDetails}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-sm font-medium"
              >
                <svg
                  className={`w-4 h-4 text-gray-600 mr-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="text-sm text-gray-700 font-semibold">Chi tiết</span>
              </button>
            </div>
          </div>
        )}

        {isSelected && !isDisabled && (
          <div className="absolute -right-3 -top-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full p-2 shadow-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
};

// Component: Expanded Details
const ExpandedDetails = ({
  flight,
  fare,
  type,
  state
}: {
  flight: FlightItem;
  fare: FareOption;
  type: 'departure' | 'return';
  state: any;
}) => {
  const bgColor = fare.name === "Business" ? "bg-amber-50" :
    fare.name === "SkyBoss" ? "bg-red-50" :
      fare.name === "Deluxe" ? "bg-orange-50" :
        fare.name === "Eco" ? "bg-green-50" : "bg-gray-50";

  return (
    <div className={`${bgColor} rounded-lg p-6 col-span-4`}>
      {/* Flight route and duration */}
      <div className="flex items-center justify-between mb-6 ">
        <div className="text-base text-gray-700 font-medium">
          {type === 'departure' ? state.departureAirport?.city : state.arrivalAirport?.city} {flight.departTime}, {type === 'departure' ? state.departureDate?.toLocaleDateString('vi-VN') : state.returnDate?.toLocaleDateString('vi-VN')}
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-base text-gray-700 font-medium">2 giờ 10 phút</div>
          <span className="text-xl text-gray-600">✈</span>
          <div className="text-base text-blue-600 font-medium">Bay thẳng</div>
        </div>
        <div className="text-base text-gray-700 font-medium">
          {type === 'departure' ? state.arrivalAirport?.city : state.departureAirport?.city} {flight.arriveTime}, {type === 'departure' ? state.departureDate?.toLocaleDateString('vi-VN') : state.returnDate?.toLocaleDateString('vi-VN')}
        </div>
      </div>

      {/* Includes section */}
      <div className="mb-4">
        <h4 className="text-lg font-bold text-black mb-3">Bao gồm:</h4>
        <div className="max-h-96 overflow-y-auto">
          <ul className="space-y-2 text-sm text-gray-800">
            {fare.includes.map((item, index) => (
              <li key={index} className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Excludes section */}
      {fare.excludes && fare.excludes.length > 0 && (
        <div className="mb-4">
          <h4 className="text-lg font-bold text-black mb-3">Chưa bao gồm:</h4>
          <div className="max-h-96 overflow-y-auto">
            <ul className="space-y-2 text-sm text-gray-800">
              {fare.excludes.map((item, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <a href="#" className="text-blue-600 underline text-base font-medium">Xem quy định giá vé</a>
        </div>
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-green-600 font-semibold text-base">Đã chọn</span>
        </div>
      </div>
    </div>
  );
};

// Component: Flight Summary Card
const FlightSummaryCard = ({
  title,
  total,
  flight,
  fare,
  type,
  state,
  selectedDate,
  currentMonth,
  currentYear,
  adultsCount,
  childrenCount,
  infantsCount
}: {
  title: string;
  total: number;
  flight?: FlightItem;
  fare?: FareOption;
  type: 'departure' | 'return';
  state: any;
  selectedDate: number;
  currentMonth: number;
  currentYear: number;
  adultsCount: number;
  childrenCount: number;
  infantsCount: number;
}) => {
  // Function to get full date string for display
  const getFullDateString = (date: number) => {
    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    // Sử dụng currentMonth và currentYear từ DateNavigation
    const dateObj = new Date(currentYear, currentMonth, date);
    const dayOfWeek = dayNames[dateObj.getDay()];
    return `${dayOfWeek}, ${String(date).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}/${currentYear}`;
  };

  // Kiểm tra nếu không có dữ liệu
  const hasNoData = !flight || !fare;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-lg text-black">{title}</h4>
        {!hasNoData && (
          <div className="flex items-center">
            <span className="font-bold text-lg text-black mr-2">{formatVnd(total)}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        )}
      </div>

      {hasNoData ? (
        <div className="text-sm text-gray-500 italic text-center py-4">
          Chưa chọn chuyến bay
        </div>
      ) : (
        <>
          {/* Route */}
          <div className="text-base text-gray-700 mb-2">
            {type === 'departure'
              ? `${state.departureAirport?.city || ''} (${state.departureAirport?.airportCode || ''}) ✈ ${state.arrivalAirport?.city || ''} (${state.arrivalAirport?.airportCode || ''})`
              : `${state.arrivalAirport?.city || ''} (${state.arrivalAirport?.airportCode || ''}) ✈ ${state.departureAirport?.city || ''} (${state.departureAirport?.airportCode || ''})`
            }
          </div>

          {/* Flight details - chia thành nhiều dòng */}
          <div className="text-base text-gray-700 mb-3 space-y-1">
            <div>{getFullDateString(selectedDate)}</div>
            {flight?.departTime && flight?.arriveTime && (
              <div>Giờ bay: {flight.departTime} - {flight.arriveTime}</div>
            )}
            {flight?.code && (
              <div>Số hiệu: {flight.code}</div>
            )}
            {fare?.name && (
              <div className="text-base font-bold text-gray-700">Hạng vé: {fare.name}</div>
            )}
          </div>

          {/* Price breakdown - chi tiết theo loại hành khách */}
          <div className="space-y-3 border-t pt-3">
            {/* Giá vé cho người lớn */}
            {adultsCount > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-base text-gray-700">Người lớn x {adultsCount}</span>
                  <span className="font-semibold text-gray-700">{formatVnd((fare?.price || 0) * adultsCount)}</span>
                </div>
              </div>
            )}

            {/* Giá vé cho trẻ em (tính như người lớn) */}
            {childrenCount > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-base text-gray-700">Trẻ em x {childrenCount}</span>
                  <span className="font-semibold text-gray-700">{formatVnd((fare?.price || 0) * childrenCount)}</span>
                </div>
              </div>
            )}

            {/* Giá vé cho em bé (100k mỗi em bé) */}
            {infantsCount > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-base text-gray-700">Em bé x {infantsCount}</span>
                  <span className="font-semibold text-gray-700">{formatVnd(100000 * infantsCount)}</span>
                </div>
              </div>
            )}

            {/* Thuế VAT */}
            {(adultsCount > 0 || childrenCount > 0 || infantsCount > 0) && (
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-base text-gray-700">Thuế VAT</span>
                <span className="font-semibold text-gray-700">{formatVnd((fare?.tax || 0) * (adultsCount + childrenCount))}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default function SelectFlightRecoveryPage() {
  const { state, setSelectedDeparture, setSelectedReturn, grandTotal } = useBooking();
  const { searchData } = useSearch();
  const { showNotification } = useNotification();

  const [selectedDepartureFlight, setSelectedDepartureFlight] = useState<{ flightId: string, fareIndex: number } | null>(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<{ flightId: string, fareIndex: number } | null>(null);

  // State cho flights từ API
  const [departureFlights, setDepartureFlights] = useState<FlightItem[]>([]);
  const [returnFlights, setReturnFlights] = useState<FlightItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // State cho user info
  const [userData, setUserData] = useState<any>(null);
  const [passengerName, setPassengerName] = useState<string>('');

  // Số lượng vé từ searchData - lấy số lượng cho từng loại hành khách
  const adultsCount = searchData.passengers?.adults || 0;
  const childrenCount = searchData.passengers?.children || 0;
  const infantsCount = searchData.passengers?.infants || 0;

  // Sử dụng ngày từ searchData hoặc mặc định
  const [selectedDepartureDate, setSelectedDepartureDate] = useState(
    searchData.departureDate ? searchData.departureDate.getDate() : 14
  );
  const [selectedReturnDate, setSelectedReturnDate] = useState(
    searchData.returnDate ? searchData.returnDate.getDate() : 14
  );

  // State để lưu tháng/năm hiện tại từ DateNavigation cho chuyến đi
  const [departureCurrentMonth, setDepartureCurrentMonth] = useState(
    searchData.departureDate ? searchData.departureDate.getMonth() : 9
  );
  const [departureCurrentYear, setDepartureCurrentYear] = useState(
    searchData.departureDate ? searchData.departureDate.getFullYear() : 2025
  );

  // State để lưu tháng/năm hiện tại từ DateNavigation cho chuyến về
  const [returnCurrentMonth, setReturnCurrentMonth] = useState(
    searchData.returnDate ? searchData.returnDate.getMonth() : 9
  );
  const [returnCurrentYear, setReturnCurrentYear] = useState(
    searchData.returnDate ? searchData.returnDate.getFullYear() : 2025
  );

  // State để lưu ngày đang tìm kiếm (để tránh tìm lại khi chọn lại cùng ngày)
  const [lastSearchedDepartureDate, setLastSearchedDepartureDate] = useState<Date | null>(null);
  const [lastSearchedReturnDate, setLastSearchedReturnDate] = useState<Date | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getCookie("access_token");
        if (!token) return;

        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.userId;

        if (!userId) return;

        const response = await requestApi(`users/${userId}`, "GET");
        if (response.success && response.data) {
          setUserData(response.data);
          // Tự động điền tên user
          const fullName = `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim();
          setPassengerName(fullName);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Đồng bộ ngày với searchData khi context thay đổi (chỉ khi thực sự thay đổi)
  useEffect(() => {
    if (searchData.departureDate) {
      const searchDate = searchData.departureDate.getDate();
      const searchMonth = searchData.departureDate.getMonth();
      const searchYear = searchData.departureDate.getFullYear();

      // Chỉ đồng bộ nếu ngày từ searchData khác với ngày hiện tại được chọn
      const currentSelectedDate = new Date(departureCurrentYear, departureCurrentMonth, selectedDepartureDate);
      const searchDateObj = new Date(searchYear, searchMonth, searchDate);

      if (searchDateObj.getTime() !== currentSelectedDate.getTime()) {
        setSelectedDepartureDate(searchDate);
        setDepartureCurrentMonth(searchMonth);
        setDepartureCurrentYear(searchYear);
        setLastSearchedDepartureDate(null);
      }
    }
    if (searchData.returnDate) {
      const searchDate = searchData.returnDate.getDate();
      const searchMonth = searchData.returnDate.getMonth();
      const searchYear = searchData.returnDate.getFullYear();

      const currentSelectedDate = new Date(returnCurrentYear, returnCurrentMonth, selectedReturnDate);
      const searchDateObj = new Date(searchYear, searchMonth, searchDate);

      if (searchDateObj.getTime() !== currentSelectedDate.getTime()) {
        setSelectedReturnDate(searchDate);
        setReturnCurrentMonth(searchMonth);
        setReturnCurrentYear(searchYear);
        setLastSearchedReturnDate(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData.departureDate, searchData.returnDate]);

  // Fetch flights khi component mount hoặc searchData thay đổi
  useEffect(() => {
    if (searchData.departureAirport && searchData.arrivalAirport && searchData.departureDate) {
      // Luôn gọi searchFlights khi có đủ thông tin
      searchFlights();
    }
    // Nếu không có searchData, sử dụng dữ liệu mẫu
    else if (!searchData.departureAirport && departureFlights.length === 0) {
      setDepartureFlights(recoveryFlights);
      setReturnFlights(recoveryReturnFlights);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData.departureAirport?.airportCode, searchData.arrivalAirport?.airportCode, searchData.departureDate]);

  // Tự động tìm lại chuyến đi khi người dùng chọn ngày mới
  useEffect(() => {
    if (searchData.departureAirport && searchData.arrivalAirport && departureCurrentYear && departureCurrentMonth !== undefined && selectedDepartureDate) {
      // Tạo date object mới từ ngày đã chọn
      const newDate = new Date(departureCurrentYear, departureCurrentMonth, selectedDepartureDate);
      // So sánh với ngày đã tìm kiếm lần cuối
      const shouldSearch = !lastSearchedDepartureDate ||
        lastSearchedDepartureDate.getDate() !== selectedDepartureDate ||
        lastSearchedDepartureDate.getMonth() !== departureCurrentMonth ||
        lastSearchedDepartureDate.getFullYear() !== departureCurrentYear;

      if (shouldSearch) {
        searchFlights(newDate, searchData.returnDate || undefined);
        // Luôn cập nhật lastSearchedDepartureDate ngay cả khi không có kết quả
        setLastSearchedDepartureDate(newDate);
        // Reset selection khi đổi ngày (chỉ reset selection, không reset ngày)
        setSelectedDepartureFlight(null);
        setSelectedReturnFlight(null);
        setExpandedFlight(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDepartureDate, departureCurrentMonth, departureCurrentYear]);

  // Tự động tìm lại chuyến về khi người dùng chọn ngày mới
  useEffect(() => {
    if (searchData.arrivalAirport && searchData.departureAirport && returnCurrentYear && returnCurrentMonth !== undefined && selectedReturnDate && searchData.returnDate) {
      // Tạo date object mới từ ngày đã chọn
      const newDate = new Date(returnCurrentYear, returnCurrentMonth, selectedReturnDate);
      // So sánh với ngày đã tìm kiếm lần cuối
      const shouldSearch = !lastSearchedReturnDate ||
        lastSearchedReturnDate.getDate() !== selectedReturnDate ||
        lastSearchedReturnDate.getMonth() !== returnCurrentMonth ||
        lastSearchedReturnDate.getFullYear() !== returnCurrentYear;

      if (shouldSearch) {
        searchFlights(searchData.departureDate || undefined, newDate);
        // Luôn cập nhật lastSearchedReturnDate ngay cả khi không có kết quả
        setLastSearchedReturnDate(newDate);
        // Reset selection chuyến về khi đổi ngày (chỉ reset selection, không reset ngày)
        setSelectedReturnFlight(null);
        setExpandedFlight(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReturnDate, returnCurrentMonth, returnCurrentYear]);

  // Kiểm tra availability thực tế từ FlightSeats sau khi load flights
  const checkedFlightsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkAvailability = async () => {
      // Check departure flights
      if (departureFlights.length > 0) {
        const needsCheck = departureFlights.some(
          flight => flight.flightData && !checkedFlightsRef.current.has(`dep-${flight.flightData.flightId}`)
        );

        if (needsCheck) {
          const updatedFlights = await Promise.all(
            departureFlights.map(async (flight) => {
              if (!flight.flightData) return flight;

              const flightKey = `dep-${flight.flightData!.flightId}`;
              if (checkedFlightsRef.current.has(flightKey)) return flight;

              const updatedFares = await Promise.all(
                flight.fares.map(async (fare) => {
                  if (fare.isPlaceholder || !fare.classType) return fare;

                  const travelClassMap: { [key: string]: string } = {
                    'first': 'First',
                    'business': 'Business',
                    'eco': 'Economy'
                  };
                  const travelClass = travelClassMap[fare.classType];

                  try {
                    const response = await requestApi(
                      `flight-seats/flight/${flight.flightData!.flightId}/available/${travelClass}`,
                      'GET'
                    );

                    if (!response.success || !response.data || response.data.length === 0) {
                      return { ...fare, soldOut: true };
                    }

                    return fare;
                  } catch (error) {
                    console.error(`Error checking availability:`, error);
                    return fare;
                  }
                })
              );

              checkedFlightsRef.current.add(flightKey);
              return { ...flight, fares: updatedFares };
            })
          );

          setDepartureFlights(updatedFlights);
        }
      }

      // Check return flights
      if (returnFlights.length > 0) {
        const needsCheck = returnFlights.some(
          flight => flight.flightData && !checkedFlightsRef.current.has(`ret-${flight.flightData.flightId}`)
        );

        if (needsCheck) {
          const updatedFlights = await Promise.all(
            returnFlights.map(async (flight) => {
              if (!flight.flightData) return flight;

              const flightKey = `ret-${flight.flightData!.flightId}`;
              if (checkedFlightsRef.current.has(flightKey)) return flight;

              const updatedFares = await Promise.all(
                flight.fares.map(async (fare) => {
                  if (fare.isPlaceholder || !fare.classType) return fare;

                  const travelClassMap: { [key: string]: string } = {
                    'first': 'First',
                    'business': 'Business',
                    'eco': 'Economy'
                  };
                  const travelClass = travelClassMap[fare.classType];

                  try {
                    const response = await requestApi(
                      `flight-seats/flight/${flight.flightData!.flightId}/available/${travelClass}`,
                      'GET'
                    );

                    if (!response.success || !response.data || response.data.length === 0) {
                      return { ...fare, soldOut: true };
                    }

                    return fare;
                  } catch (error) {
                    console.error(`Error checking availability:`, error);
                    return fare;
                  }
                })
              );

              checkedFlightsRef.current.add(flightKey);
              return { ...flight, fares: updatedFares };
            })
          );

          setReturnFlights(updatedFlights);
        }
      }
    };

    checkAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departureFlights.length, returnFlights.length]);


  // Hàm chuyển đổi flight từ API sang FlightItem
  const convertFlightToFlightItem = (flight: Flight): FlightItem => {
    // Parse departureTime và arrivalTime
    const departureTime = new Date(flight.departureTime);
    const arrivalTime = new Date(flight.arrivalTime);

    const departTimeStr = departureTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const arriveTimeStr = arrivalTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // Tạo fares từ economyPrice, businessPrice, firstClassPrice
    const fares: FareOption[] = [];

    if (flight.firstClassPrice > 0 && flight.availableFirstClassSeats > 0) {
      fares.push({
        name: "FIRST CLASS",
        price: flight.firstClassPrice,
        tax: Math.round(flight.firstClassPrice * 0.10),
        service: 0,
        classType: 'first',
        includes: [
          "Hành lý xách tay: 18kg",
          "Hành lý ký gửi: 60kg cho đường bay Úc, Kazakhstan; 40kg cho các đường bay còn lại và 01 bộ dụng cụ chơi golf (nếu có)",
          "Phòng chờ sang trọng (không áp dụng trên các chuyến bay nội địa Thái Lan và các sân bay có phòng chờ không đạt tiêu chuẩn hoặc đóng cửa trong giờ hoạt động của chuyến bay). Thời gian sử dụng dịch vụ là 03 tiếng trước giờ khởi hành chuyến bay",
          "Ưu tiên làm thủ tục trước chuyến bay",
          "Ưu tiên phục vụ hành lý",
          "Ưu tiên qua cửa an ninh (tùy theo điều kiện từng sân bay)",
          "Phục vụ đưa đón riêng ra tàu bay (áp dụng trường hợp tàu bay đậu bãi; không áp dụng đối với sân bay không cung cấp dịch vụ xe đưa đón riêng)",
          "Ưu tiên chọn chỗ ngồi trên tàu bay",
          "Thưởng thức ẩm thực tươi ngon suốt chuyến bay",
          "Bộ tiện ích (chuyến bay từ 04 tiếng trở lên)",
          "Hoàn bảo lưu định danh Tiền Vé: 02 năm kể từ ngày khởi hành dự kiến"
        ],
        excludes: []
      });
    }

    if (flight.businessPrice > 0 && flight.availableBusinessSeats > 0) {
      fares.push({
        name: "BUSINESS",
        price: flight.businessPrice,
        tax: Math.round(flight.businessPrice * 0.10),
        service: 0,
        classType: 'business',
        includes: [
          "Hành lý xách tay: 14kg cho đường bay Úc, Kazakhstan; 10kg cho các đường bay còn lại.",
          "Hành lý ký gửi: 50kg cho đường bay Úc, Kazakhstan; 30kg cho các đường bay còn lại và 01 bộ dụng cụ chơi golf (nếu có)",
          "Phòng chờ sang trọng (không áp dụng trên các chuyến bay nội địa Thái Lan và các sân bay có phòng chờ không đạt tiêu chuẩn hoặc đóng cửa trong giờ hoạt động của chuyến bay). Thời gian sử dụng dịch vụ là 03 tiếng trước giờ khởi hành chuyến bay.",
          "Ưu tiên làm thủ tục trước chuyến bay",
          "Ưu tiên phục vụ hành lý",
          "Ưu tiên qua cửa an ninh (tùy theo điều kiện từng sân bay)",
          "Phục vụ đưa đón riêng ra tàu bay (áp dụng trường hợp tàu bay đậu bãi; không áp dụng đối với sân bay không cung cấp dịch vụ xe đưa đón riêng)",
          "Ưu tiên chọn chỗ ngồi trên tàu bay (không áp dụng các hàng ghế dành cho khách Business)",
          "Thưởng thức ẩm thực tươi ngon suốt chuyến bay",
          "Bộ tiện ích (chuyến bay từ 04 tiếng trở lên)",
          "Hoàn bảo lưu định danh tiền vé trong vòng 02 (hai) năm kể từ ngày khởi hành dự kiến"
        ],
        excludes: []
      });
    }

    if (flight.economyPrice > 0 && flight.availableEconomySeats > 0) {
      fares.push({
        name: "ECO",
        price: flight.economyPrice,
        tax: Math.round(flight.economyPrice * 0.10),
        service: 0,
        classType: 'eco',
        includes: [
          "Hành lý xách tay: 07Kg."
        ],
        excludes: [
          "Hành lý ký gửi (tùy chọn)",
          "Suất ăn",
          "Bộ tiện ích 3 trong 1",
          "Chọn trước chỗ ngồi",
          "Thay đổi chuyến bay, ngày bay, hành trình",
          "Chênh lệch tiền vé khi thay đổi (nếu có)"
        ]
      });
    }

    const normalizedFares = ensureFareSlots(fares);

    return {
      id: `flight-${flight.flightId}`,
      code: flight.flightNumber,
      departTime: departTimeStr,
      arriveTime: arriveTimeStr,
      aircraft: flight.aircraft?.model || 'Airbus A320',
      note: "Bay thẳng",
      fares: normalizedFares,
      flightData: flight
    };
  };

  // Hàm tìm kiếm chuyến bay
  const searchFlights = async (customDepartureDate?: Date, customReturnDate?: Date) => {
    setLoading(true);
    setError('');

    try {
      // Format date - Sử dụng local date để tránh timezone issue
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formatted = `${year}-${month}-${day}`;

        return formatted;
      };

      // Sử dụng customDate nếu có, nếu không thì dùng từ searchData
      const departureDateToSearch = customDepartureDate || searchData.departureDate;
      const returnDateToSearch = customReturnDate || searchData.returnDate;

      // Tìm kiếm chuyến đi
      if (departureDateToSearch) {
        const departureSearchParams = {
          departureAirportCode: searchData.departureAirport?.airportCode,
          arrivalAirportCode: searchData.arrivalAirport?.airportCode,
          departureDate: formatDate(departureDateToSearch)
        };

        const departureSearchResult = await flightsService.searchFlights(departureSearchParams);

        if (departureSearchResult.success && departureSearchResult.data) {
          const departureItems = departureSearchResult.data.map(flight => convertFlightToFlightItem(flight));
          setDepartureFlights(departureItems);
        } else {
          setDepartureFlights([]);
        }
      }

      // Tìm kiếm chuyến về (nếu có returnDate)
      // Lưu ý: Chưa filter theo thời gian chuyến đi ở đây, sẽ filter sau khi chọn chuyến đi
      if (returnDateToSearch) {
        const returnSearchResult = await flightsService.searchFlights({
          departureAirportCode: searchData.arrivalAirport?.airportCode,
          arrivalAirportCode: searchData.departureAirport?.airportCode,
          departureDate: formatDate(returnDateToSearch)
        });

        if (returnSearchResult.success && returnSearchResult.data) {
          const returnItems = returnSearchResult.data.map(flight => convertFlightToFlightItem(flight));
          setReturnFlights(returnItems);
        } else {
          setReturnFlights([]);
        }
      }
    } catch (err: any) {
      setDepartureFlights([]);
      setReturnFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const [expandedFlight, setExpandedFlight] = useState<{ flightId: string, fareIndex: number, type: 'departure' | 'return' } | null>(null);

  // Tìm chuyến đi đã chọn từ danh sách
  const departureFlight = useMemo(() => {
    if (!selectedDepartureFlight) return undefined;
    return departureFlights.find(f => f.id === selectedDepartureFlight.flightId);
  }, [departureFlights, selectedDepartureFlight]);

  const returnFlight = returnFlights.find(f => f.id === selectedReturnFlight?.flightId);

  const departureFare = departureFlight?.fares[selectedDepartureFlight?.fareIndex || 0];
  const returnFare = returnFlight?.fares[selectedReturnFlight?.fareIndex || 0];

  // Lọc chuyến về: chỉ hiển thị các chuyến có thời gian khởi hành sau thời gian đến của chuyến đi
  const filteredReturnFlights = useMemo(() => {
    // Nếu chưa chọn chuyến đi hoặc chưa có dữ liệu chuyến đi, KHÔNG hiển thị chuyến về nào
    if (!selectedDepartureFlight || !departureFlight?.flightData) {
      return []; // Trả về mảng rỗng thay vì tất cả chuyến về
    }

    // Lấy thời gian đến của chuyến đi
    const arrivalTimeString = departureFlight.flightData.arrivalTime;
    if (!arrivalTimeString) {
      return returnFlights;
    }

    const departureArrivalTime = new Date(arrivalTimeString);

    // Kiểm tra nếu Date không hợp lệ
    if (isNaN(departureArrivalTime.getTime())) {
      return returnFlights;
    }

    const departureArrivalTimeMs = departureArrivalTime.getTime();

    // Lọc các chuyến về có departureTime > arrivalTime của chuyến đi
    const filtered = returnFlights.filter(flight => {
      if (!flight.flightData) {
        return false;
      }

      const departureTimeString = flight.flightData.departureTime;
      if (!departureTimeString) {
        return false;
      }

      const returnDepartureTime = new Date(departureTimeString);

      // Kiểm tra nếu Date không hợp lệ
      if (isNaN(returnDepartureTime.getTime())) {
        return false;
      }

      const returnDepartureTimeMs = returnDepartureTime.getTime();

      // Chỉ hiển thị chuyến về có thời gian khởi hành SAU thời gian đến của chuyến đi
      const isValid = returnDepartureTimeMs > departureArrivalTimeMs;
      const differenceMs = returnDepartureTimeMs - departureArrivalTimeMs;
      const differenceHours = differenceMs / (1000 * 60 * 60);

      // Debug log cho từng chuyến
      if (!isValid) {
      } else {
      }

      return isValid;
    });

    return filtered;
  }, [returnFlights, selectedDepartureFlight, departureFlight]);

  // Tự động tìm lại chuyến về với filter thời gian khi chọn chuyến đi
  useEffect(() => {
    const searchReturnFlightsWithFilter = async () => {
      // Chỉ tìm lại nếu đã chọn chuyến đi và có returnDate
      if (!selectedDepartureFlight || !departureFlight?.flightData || !searchData.returnDate) {
        return;
      }

      const arrivalTime = departureFlight.flightData.arrivalTime;
      if (!arrivalTime) {
        return;
      }

      try {
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        // Tìm lại chuyến về với filter thời gian từ backend
        const returnSearchResult = await flightsService.searchFlights({
          departureAirportCode: searchData.arrivalAirport?.airportCode,
          arrivalAirportCode: searchData.departureAirport?.airportCode,
          departureDate: formatDate(searchData.returnDate),
          minDepartureTime: arrivalTime // Gửi thời gian đến của chuyến đi để backend filter
        });

        if (returnSearchResult.success && returnSearchResult.data) {
          const returnItems = returnSearchResult.data.map(flight => convertFlightToFlightItem(flight));
          setReturnFlights(returnItems);
        } else {
          setReturnFlights([]);
        }
      } catch (err: any) {
      }
    };

    searchReturnFlightsWithFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDepartureFlight, departureFlight?.flightData?.arrivalTime, searchData.returnDate, searchData.arrivalAirport?.airportCode, searchData.departureAirport?.airportCode]);

  // Reset chuyến về đã chọn nếu nó không còn hợp lệ sau khi chọn chuyến đi mới
  useEffect(() => {
    if (selectedReturnFlight && filteredReturnFlights.length > 0) {
      const isStillValid = filteredReturnFlights.some(
        flight => flight.id === selectedReturnFlight.flightId
      );
      if (!isStillValid) {
        setSelectedReturnFlight(null);
        setSelectedReturn(undefined);
        showNotification(
          'warning',
          'Chuyến về đã chọn không còn hợp lệ',
          ['Vui lòng chọn lại chuyến về sau thời gian đến của chuyến đi mới']
        );
      }
    }
  }, [filteredReturnFlights, selectedReturnFlight, setSelectedReturn, showNotification]);

  // Tính tổng giá vé: Người lớn và trẻ em tính giá như nhau, em bé 100k
  const totalDeparture = useMemo(() => {
    if (!departureFare) return 0;
    const price = Number(departureFare.price) || 0;
    const tax = Number(departureFare.tax) || 0;
    // Người lớn + trẻ em tính giá như nhau
    const adultAndChildrenPrice = (price + tax) * (adultsCount + childrenCount);
    // Em bé: 100k
    const infantPrice = 100000 * infantsCount;
    return adultAndChildrenPrice + infantPrice;
  }, [departureFare, adultsCount, childrenCount, infantsCount]);

  const totalReturn = useMemo(() => {
    if (!returnFare) return 0;
    const price = Number(returnFare.price) || 0;
    const tax = Number(returnFare.tax) || 0;
    // Người lớn + trẻ em tính giá như nhau
    const adultAndChildrenPrice = (price + tax) * (adultsCount + childrenCount);
    // Em bé: 100k
    const infantPrice = 100000 * infantsCount;
    return adultAndChildrenPrice + infantPrice;
  }, [returnFare, adultsCount, childrenCount, infantsCount]);

  const computedGrandTotal = totalDeparture + totalReturn;

  // Kiểm tra đã chọn đủ chuyến bay chưa
  const isFlightSelected = selectedDepartureFlight !== null && selectedReturnFlight !== null;
  const [showAlert, setShowAlert] = useState(false);

  const handleContinue = (e: React.MouseEvent) => {
    if (!isFlightSelected) {
      e.preventDefault();
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return false;
    }
  };

  // Simplified flight section renderer
  const renderFlightSection = (
    flights: FlightItem[],
    type: 'departure' | 'return',
    title: string,
    selectedFlight: { flightId: string, fareIndex: number } | null,
    setSelectedFlight: (flight: { flightId: string, fareIndex: number } | null) => void,
    selectedDate: number,
    setSelectedDate: (date: number) => void,
    showEmptyMessage?: boolean,
    emptyMessage?: string
  ) => {
    // Closure để truy cập departureFlights và selectedDepartureFlight
    return (
      <div className="mb-8">
        {/* Section Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl p-4 mb-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <h2 className="text-xl font-bold text-white">{title}</h2>
              </div>
              <div className="hidden md:block w-px h-8 bg-white/30"></div>
              <div className="flex items-center space-x-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">
                    {type === 'departure' ? searchData.departureAirport?.airportCode : searchData.arrivalAirport?.airportCode}
                  </div>
                  <div className="text-xs text-blue-100">
                    {type === 'departure' ? searchData.departureAirport?.city : searchData.arrivalAirport?.city}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-0.5 bg-white/40"></div>
                  <span className="text-xl text-white">✈</span>
                  <div className="w-8 h-0.5 bg-white/40"></div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">
                    {type === 'departure' ? searchData.arrivalAirport?.airportCode : searchData.departureAirport?.airportCode}
                  </div>
                  <div className="text-xs text-blue-100">
                    {type === 'departure' ? searchData.arrivalAirport?.city : searchData.departureAirport?.city}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DateNavigation
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          searchData={searchData}
          type={type}
          onMonthYearChange={(month, year) => {
            if (type === 'departure') {
              setDepartureCurrentMonth(month);
              setDepartureCurrentYear(year);
            } else {
              setReturnCurrentMonth(month);
              setReturnCurrentYear(year);
            }
          }}
        />

        {/* Chỉ hiển thị FareHeaders và Flight Rows khi có chuyến bay */}
        {flights.length > 0 ? (
          <>
            <FareHeaders />

            {/* Flight Rows */}
            <div className="space-y-4">
              {flights.map((flight) => (
                <div key={flight.id} className="space-y-4">
                  {/* Flight row */}
                  <div className="grid grid-cols-4 gap-3 items-stretch">
                    <div className="h-full">
                      <FlightDetails flight={flight} />
                    </div>

                    {flight.fares.map((fare, fareIndex) => {
                      const isSelected = selectedFlight?.flightId === flight.id && selectedFlight?.fareIndex === fareIndex;
                      const isExpanded = expandedFlight?.flightId === flight.id && expandedFlight?.fareIndex === fareIndex && expandedFlight?.type === type;

                      return (
                        <FareCell
                          key={fareIndex}
                          fare={fare}
                          fareIndex={fareIndex}
                          flightId={flight.id}
                          isSelected={isSelected}
                          isExpanded={isExpanded}
                          onSelect={() => {
                            // Set local state trước
                            setSelectedFlight({ flightId: flight.id, fareIndex });

                            const flightData = {
                              flightId: flight.id,
                              fareIndex,
                              fareName: fare.name,
                              price: fare.price,
                              tax: fare.tax,
                              service: fare.service,
                              code: flight.code,
                              departTime: flight.departTime,
                              arriveTime: flight.arriveTime,
                            };

                            if (type === 'departure') {
                              // Set state cho chuyến đi - điều này sẽ trigger filteredReturnFlights recalculate
                              setSelectedDepartureFlight({ flightId: flight.id, fareIndex });
                              setSelectedDeparture(flightData);

                              // Lưu chuyến đi vào localStorage để dùng sau thanh toán
                              try {
                                localStorage.setItem('selectedDepartureFlight', JSON.stringify({
                                  flightId: (flight as any)?.flightData?.flightId,
                                  flightNumber: flight.code,
                                  travelClass: fare.name,
                                  price: fare.price,
                                  tax: fare.tax,
                                  aircraftId: (flight as any)?.flightData?.aircraft?.aircraftId,
                                }));
                              } catch { }
                            } else {
                              // Validate: Thời gian khởi hành của chuyến về phải sau thời gian đến của chuyến đi
                              if (selectedDepartureFlight) {
                                const selectedDepFlight = departureFlights.find(f => f.id === selectedDepartureFlight.flightId);
                                if (selectedDepFlight && selectedDepFlight.flightData) {
                                  const departureArrivalTime = new Date(selectedDepFlight.flightData.arrivalTime);
                                  const returnDepartureTime = new Date(flight.flightData?.departureTime || 0);
                                  if (returnDepartureTime.getTime() <= departureArrivalTime.getTime()) {
                                    showNotification(
                                      'error',
                                      'Thời gian không hợp lệ',
                                      [
                                        'Thời gian khởi hành của chuyến về phải sau thời gian đến của chuyến đi',
                                        `Chuyến đi đến: ${departureArrivalTime.toLocaleString('vi-VN')}`,
                                        `Chuyến về khởi hành: ${returnDepartureTime.toLocaleString('vi-VN')}`
                                      ]
                                    );
                                    return;
                                  }
                                }
                              }

                              setSelectedReturn(flightData);
                              // Lưu chuyến về vào localStorage để dùng sau thanh toán
                              try {
                                localStorage.setItem('selectedReturnFlight', JSON.stringify({
                                  flightId: (flight as any)?.flightData?.flightId,
                                  flightNumber: flight.code,
                                  travelClass: fare.name,
                                  price: fare.price,
                                  tax: fare.tax,
                                  aircraftId: (flight as any)?.flightData?.aircraft?.aircraftId,
                                }));
                              } catch { }
                            }
                          }}
                          onToggleExpand={() => {
                            if (isExpanded) {
                              setExpandedFlight(null);
                            } else {
                              setExpandedFlight({ flightId: flight.id, fareIndex, type });
                            }
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Expanded details */}
                  {expandedFlight?.flightId === flight.id && expandedFlight?.type === type && (
                    <ExpandedDetails
                      flight={flight}
                      fare={flight.fares[expandedFlight.fareIndex]}
                      type={type}
                      state={searchData}
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        ) : showEmptyMessage ? (
          // Hiển thị thông báo khi không có chuyến bay
          <div className="bg-white rounded-xl p-8 shadow-xl text-center">
            <p className="text-lg text-gray-600">{emptyMessage || 'Không tìm thấy chuyến bay phù hợp'}</p>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      {/* Top banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back button */}
              <Link
                href="/"
                className="flex items-center justify-center w-12 h-12 bg-black/20 hover:bg-black/30 rounded-full transition-all duration-200 hover:scale-110"
              >
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-black">
                  Chuyến bay khứ hồi | {searchData.passengers.adults} Người lớn
                </h1>
                <div className="text-black mt-2 font-medium">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Điểm khởi hành {searchData.departureAirport?.city || 'Chưa chọn'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Điểm đến {searchData.arrivalAirport?.city || 'Chưa chọn'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Flights table */}
        <div className="lg:col-span-2">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-lg font-semibold">Đang tìm kiếm chuyến bay...</span>
            </div>
          )}

          {!loading && (
            <>
              {/* Departure Flights - Luôn hiển thị với DateNavigation, kể cả khi không có chuyến bay */}
              {renderFlightSection(
                departureFlights,
                'departure',
                'CHUYẾN ĐI',
                selectedDepartureFlight,
                setSelectedDepartureFlight,
                selectedDepartureDate,
                setSelectedDepartureDate,
                true, // showEmptyMessage
                departureFlights.length === 0 ? 'Không tìm thấy chuyến bay đi phù hợp' : undefined // emptyMessage
              )}

              {/* Return Flights - Luôn hiển thị với DateNavigation nếu có returnDate */}
              {searchData.returnDate && (
                !selectedDepartureFlight ? (
                  // Chưa chọn chuyến đi - hiển thị header, DateNavigation và thông báo
                  renderFlightSection(
                    [],
                    'return',
                    'CHUYẾN VỀ',
                    selectedReturnFlight,
                    setSelectedReturnFlight,
                    selectedReturnDate,
                    setSelectedReturnDate,
                    true,
                    'Vui lòng chọn chuyến đi trước để xem các chuyến về phù hợp'
                  )
                ) : (
                  // Đã chọn chuyến đi - hiển thị header, DateNavigation và danh sách chuyến về
                  renderFlightSection(
                    filteredReturnFlights,
                    'return',
                    'CHUYẾN VỀ',
                    selectedReturnFlight,
                    setSelectedReturnFlight,
                    selectedReturnDate,
                    setSelectedReturnDate,
                    true,
                    filteredReturnFlights.length === 0 ? 'Không tìm thấy chuyến bay về phù hợp sau thời gian đến của chuyến đi' : undefined
                  )
                )
              )}
            </>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 sticky top-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mb-8 text-center">
              THÔNG TIN ĐẶT CHỖ
            </h3>

            {/* Passenger Info */}
            <div className="mb-6">
              <label className="block text-base font-bold text-black mb-2">
                Thông tin hành khách
              </label>
              <input
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className="w-full border-2 text-black  border-gray-300 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Nhập thông tin hành khách"
              />
            </div>

            {/* Flight Summaries */}
            <FlightSummaryCard
              title="Chuyến đi"
              total={totalDeparture}
              flight={departureFlight || undefined}
              fare={departureFare}
              type="departure"
              state={searchData}
              selectedDate={selectedDepartureDate}
              currentMonth={departureCurrentMonth}
              currentYear={departureCurrentYear}
              adultsCount={adultsCount}
              childrenCount={childrenCount}
              infantsCount={infantsCount}
            />

            <FlightSummaryCard
              title="Chuyến về"
              total={totalReturn}
              flight={returnFlight}
              fare={returnFare}
              type="return"
              state={searchData}
              selectedDate={selectedReturnDate}
              currentMonth={returnCurrentMonth}
              currentYear={returnCurrentYear}
              adultsCount={adultsCount}
              childrenCount={childrenCount}
              infantsCount={infantsCount}
            />

            {/* Total */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl text-center mb-8 shadow-xl">
              <div className="text-xl font-semibold mb-3">Tổng tiền</div>
              <div className="text-4xl md:text-5xl font-bold">
                {formatVnd(grandTotal || computedGrandTotal)}
              </div>
              <div className="text-red-100 text-sm mt-2">Bao gồm tất cả thuế và phí</div>
            </div>

            {showAlert && (
              <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Vui lòng chọn hạng máy bay cho cả chuyến đi và chuyến về trước khi tiếp tục!</span>
                </div>
              </div>
            )}

            <Link
              href="/book-plane/passengers"
              onClick={handleContinue}
              className={`w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-5 rounded-2xl text-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${!isFlightSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Đi tiếp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
