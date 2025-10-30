"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Link from 'next/link';
import { useBooking } from "../BookingContext";
import { useSearch } from "../SearchContext";
import { flightsService, Flight } from "../../../services/flights.service";
import { requestApi } from "@/lib/api";
import { getCookie } from "@/utils/cookies";

interface FareOption {
  name: string;
  price: number;
  soldOut?: boolean;
  tax: number;
  service: number;
  includes: string[];
  excludes: string[];
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

// Utility functions
const formatVnd = (n: number) => {
  // Làm tròn số về số nguyên để tránh hiển thị phần thập phân
  const roundedNumber = Math.round(n);
  return new Intl.NumberFormat("vi-VN").format(roundedNumber) + " VND";
};

// Component: Flight Route Display
const FlightRoute = ({ searchData }: { searchData: any }) => (
  <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-100">
    <div className="flex items-center justify-center">
      <div className="flex items-center space-x-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">
            {searchData.departureAirport?.airportCode}
          </div>
          <div className="text-sm text-gray-600">
            {searchData.departureAirport?.city}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <span className="text-2xl text-gray-600">✈</span>
          <div className="w-12 h-0.5 bg-gray-300"></div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">
            {searchData.arrivalAirport?.airportCode}
          </div>
          <div className="text-sm text-gray-600">
            {searchData.arrivalAirport?.city}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Component: Date Navigation
const DateNavigation = ({ selectedDate, setSelectedDate, searchData }: {
  selectedDate: number,
  setSelectedDate: (date: number) => void,
  searchData: any
}) => {
  function getDateContext(dateObj: Date | undefined) {
    const d = dateObj ? new Date(dateObj) : new Date(2025, 9, 14);
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      date: d.getDate(),
    };
  }

  const getMaxDayOfMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getInitialDates = () => {
    const { year, month, date: baseDate } = getDateContext(searchData.departureDate);
    const maxDay = getMaxDayOfMonth(year, month);
    const arr = [baseDate - 1, baseDate, baseDate + 1, baseDate + 2].filter(d => d >= 1 && d <= maxDay);
    return arr.length > 0 ? arr : [baseDate];
  };

  const [visibleDates, setVisibleDates] = useState(getInitialDates());
  const currentIndex = visibleDates.indexOf(selectedDate);
  // Lưu context tháng/năm hiện tại hiển thị
  const [currYear, setCurrYear] = useState(getDateContext(searchData.departureDate).year);
  const [currMonth, setCurrMonth] = useState(getDateContext(searchData.departureDate).month);
  const maxDay = getMaxDayOfMonth(currYear, currMonth);

  // Sửa lại logic chuyển ngày/tháng
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setSelectedDate(visibleDates[currentIndex - 1]);
    } else {
      let prevMonth = currMonth;
      let prevYear = currYear;
      if (visibleDates[0] <= 1) {
        if (prevMonth === 0) {
          prevMonth = 11;
          prevYear -= 1;
        } else {
          prevMonth -= 1;
        }
        const maxDayPrev = getMaxDayOfMonth(prevYear, prevMonth);
        const newDates = [maxDayPrev - 3, maxDayPrev - 2, maxDayPrev - 1, maxDayPrev].filter(d => d >= 1 && d <= maxDayPrev);
        setVisibleDates(newDates);
        setCurrMonth(prevMonth);
        setCurrYear(prevYear);
        setSelectedDate(newDates[newDates.length - 1]);
      } else {
        const prevStartDate = visibleDates[0] - 4;
        const newDates = [prevStartDate, prevStartDate + 1, prevStartDate + 2, prevStartDate + 3].filter(d => d >= 1 && d <= maxDay);
        if (newDates.length > 0) {
          setVisibleDates(newDates);
          setSelectedDate(newDates[newDates.length - 1]);
        }
      }
    }
  };

  const goToNext = () => {
    if (currentIndex < visibleDates.length - 1) {
      setSelectedDate(visibleDates[currentIndex + 1]);
    } else {
      let nextMonth = currMonth;
      let nextYear = currYear;
      if (visibleDates[visibleDates.length - 1] >= maxDay) {
        if (nextMonth === 11) {
          nextMonth = 0;
          nextYear += 1;
        } else {
          nextMonth += 1;
        }
        const maxDayNext = getMaxDayOfMonth(nextYear, nextMonth);
        const newDates = [1, 2, 3, 4].filter(d => d >= 1 && d <= maxDayNext);
        setVisibleDates(newDates);
        setCurrMonth(nextMonth);
        setCurrYear(nextYear);
        setSelectedDate(newDates[0]);
      } else {
        const nextStartDate = visibleDates[visibleDates.length - 1] + 1;
        const newDates = [nextStartDate, nextStartDate + 1, nextStartDate + 2, nextStartDate + 3].filter(d => d >= 1 && d <= maxDay);
        if (newDates.length > 0) {
          setVisibleDates(newDates);
          setSelectedDate(newDates[0]);
        }
      }
    }
  };

  // -- Bổ sung đồng bộ khi selectedDate vượt quá maxDay hiện tại thì tự động sang tháng ---
  useEffect(() => {
    if (selectedDate > maxDay) {
      // Chuyển sang ngày đầu tháng sau
      let newMonth = currMonth + 1;
      let newYear = currYear;
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      const maxDayNext = getMaxDayOfMonth(newYear, newMonth);
      const newDates = [1, 2, 3, 4].filter(d => d >= 1 && d <= maxDayNext);
      setVisibleDates(newDates);
      setCurrMonth(newMonth);
      setCurrYear(newYear);
      setSelectedDate(1);
    }
    if (selectedDate < 1) {
      // Chuyển sang cuối tháng trước
      let newMonth = currMonth - 1;
      let newYear = currYear;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
      const maxPrev = getMaxDayOfMonth(newYear, newMonth);
      const newDates = [maxPrev - 3, maxPrev - 2, maxPrev - 1, maxPrev].filter(d => d >= 1 && d <= maxPrev);
      setVisibleDates(newDates);
      setCurrMonth(newMonth);
      setCurrYear(newYear);
      setSelectedDate(maxPrev);
    }
  }, [selectedDate, currMonth, currYear, maxDay]);

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
                    const dayOfWeek = dayNames[date % 7];
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
  <div className="bg-gradient-to-br from-yellow-200 via-indigo-50 to-purple-50 rounded-xl p-4 shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300">
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
  const isDisabled = fare.soldOut;

  return (
    <button
      disabled={isDisabled}
      onClick={() => {
        if (isDisabled) return;
        onSelect();
        onToggleExpand();
      }}
      className={`rounded-xl p-4 text-center shadow-lg border transition-all duration-200 relative transform hover:scale-105 ${isDisabled
        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
        : isSelected
          ? "bg-gradient-to-br from-white to-blue-50 text-black border-blue-500 shadow-xl scale-105"
          : "bg-gradient-to-br from-white to-gray-50 text-black hover:from-blue-50 hover:to-blue-100 hover:shadow-lg border-gray-200 hover:border-blue-300"
        }`}
    >
      {isDisabled ? (
        <div className="flex flex-col items-center">
          <svg className="w-6 h-6 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div className="text-sm font-semibold">Hết chỗ</div>
        </div>
      ) : (
        <div>
          <div className="text-lg font-bold mb-1">{formatVnd(fare.price)}</div>
          <div className="text-sm text-gray-600 mb-2">1 người</div>
          <div className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full">
            <svg className="w-3 h-3 text-gray-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-xs text-gray-600">Chi tiết</span>
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
  );
};

// Component: Expanded Details
const ExpandedDetails = ({
  flight,
  fare,
  searchData
}: {
  flight: FlightItem;
  fare: FareOption;
  searchData: any;
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
          {searchData.departureAirport?.city} {flight.departTime}, {searchData.departureDate?.toLocaleDateString('vi-VN')}
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-base text-gray-700 font-medium">2 giờ 10 phút</div>
          <span className="text-xl text-gray-600">✈</span>
          <div className="text-base text-blue-600 font-medium">Bay thẳng</div>
        </div>
        <div className="text-base text-gray-700 font-medium">
          {searchData.arrivalAirport?.city} {flight.arriveTime}, {searchData.departureDate?.toLocaleDateString('vi-VN')}
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
  searchData,
  selectedDate,
  adultsCount,
  childrenCount,
  infantsCount
}: {
  title: string;
  total: number;
  flight?: FlightItem;
  fare?: FareOption;
  searchData: any;
  selectedDate: number;
  adultsCount: number;
  childrenCount: number;
  infantsCount: number;
}) => {
  // Function to get full date string for display
  const getFullDateString = (date: number) => {
    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const dayOfWeek = dayNames[date % 7];
    const month = searchData.departureDate ? searchData.departureDate.getMonth() + 1 : 10;
    const year = searchData.departureDate ? searchData.departureDate.getFullYear() : 2025;
    return `${dayOfWeek}, ${date}/${month}/${year}`;
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
            {`${searchData.departureAirport?.city || ''} (${searchData.departureAirport?.airportCode || ''}) ✈ ${searchData.arrivalAirport?.city || ''} (${searchData.arrivalAirport?.airportCode || ''})`}
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

export default function SelectFlightPage() {
  const { state, setSelectedDeparture, grandTotal } = useBooking();
  const { searchData } = useSearch();

  // Debug: Log searchData để kiểm tra dữ liệu
  console.log('SearchData in select-flight:', searchData);
  console.log('Departure Date:', searchData.departureDate);

  const [selectedDepartureFlight, setSelectedDepartureFlight] = useState<{ flightId: string, fareIndex: number } | null>(null);

  // State cho flights từ API
  const [departureFlights, setDepartureFlights] = useState<FlightItem[]>([]);
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
        name: "FIST CLASS",
        price: flight.firstClassPrice,
        tax: Math.round(flight.firstClassPrice * 0.10),
        service: 0,
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
        name: "BUSSINESS",
        price: flight.businessPrice,
        tax: Math.round(flight.businessPrice * 0.10),
        service: 0,
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
        name: "Eco",
        price: flight.economyPrice,
        tax: Math.round(flight.economyPrice * 0.10),
        service: 0,
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

    return {
      id: `flight-${flight.flightId}`,
      code: flight.flightNumber,
      departTime: departTimeStr,
      arriveTime: arriveTimeStr,
      aircraft: flight.aircraft?.model || 'Airbus A320',
      note: "Bay thẳng",
      fares: fares.length > 0 ? fares : [{
        name: "Eco",
        price: 0,
        soldOut: true,
        tax: 0,
        service: 0,
        includes: [],
        excludes: []
      }],
      flightData: flight
    };
  };

  // Hàm tìm kiếm chuyến bay
  const searchFlights = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Format date
      const formatDate = (date: Date) => {
        const formatted = date.toISOString().split('T')[0];
        console.log('📅 Formatting date:', date, '->', formatted);
        return formatted;
      };

      const searchParams = {
        departureAirportCode: searchData.departureAirport?.airportCode,
        arrivalAirportCode: searchData.arrivalAirport?.airportCode,
        departureDate: searchData.departureDate ? formatDate(searchData.departureDate) : undefined
      };

      console.log('✈️ Searching flights with params:', searchParams);

      // Tìm kiếm chuyến đi
      const departureSearchResult = await flightsService.searchFlights(searchParams);

      console.log('🔍 Search result:', departureSearchResult);

      if (departureSearchResult.success && departureSearchResult.data) {
        console.log('✅ Found', departureSearchResult.data.length, 'flights');
        const departureItems = departureSearchResult.data.map(flight => convertFlightToFlightItem(flight));
        setDepartureFlights(departureItems);
      } else {
        console.warn('⚠️ No flights found');
        setDepartureFlights([]);
      }
    } catch (err: any) {
      console.error('❌ Error searching flights:', err);
      setError(`Lỗi khi tìm kiếm chuyến bay: ${err.message || 'Không thể kết nối đến server'}`);
      setDepartureFlights([]);
    } finally {
      setLoading(false);
    }
  }, [searchData.departureAirport, searchData.arrivalAirport, searchData.departureDate]);

  // Đồng bộ ngày với searchData khi context thay đổi
  useEffect(() => {
    if (searchData.departureDate) {
      setSelectedDepartureDate(searchData.departureDate.getDate());
    }
  }, [searchData.departureDate]);

  // Fetch flights khi component mount hoặc searchData thay đổi
  useEffect(() => {
    if (searchData.departureAirport && searchData.arrivalAirport && searchData.departureDate) {
      // Luôn gọi searchFlights khi có đủ thông tin
      console.log('🔍 Triggering search with:', {
        departure: searchData.departureAirport.airportCode,
        arrival: searchData.arrivalAirport.airportCode,
        date: searchData.departureDate
      });
      searchFlights();
    }
  }, [searchFlights]);

  const [expandedFlight, setExpandedFlight] = useState<{ flightId: string, fareIndex: number } | null>(null);

  const departureFlight = departureFlights.find(f => f.id === selectedDepartureFlight?.flightId);
  const departureFare = departureFlight?.fares[selectedDepartureFlight?.fareIndex || 0];

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

  const computedGrandTotal = totalDeparture;

  // Kiểm tra đã chọn chuyến bay chưa
  const isFlightSelected = selectedDepartureFlight !== null;
  const [showAlert, setShowAlert] = useState(false);

  const handleContinue = (e: React.MouseEvent) => {
    if (!isFlightSelected) {
      e.preventDefault();
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return false;
    }
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
                  Chuyến bay một chiều | {searchData.passengers?.adults || 1} Người lớn
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
              {/* Departure Flights */}
              {departureFlights.length > 0 ? (
                <div className="mb-8">
                  {/* Section Header */}
                  <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl p-4 mb-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                          <h2 className="text-xl font-bold text-white">CHUYẾN ĐI</h2>
                        </div>
                        <div className="hidden md:block w-px h-8 bg-white/30"></div>
                        <div className="flex items-center space-x-3">
                          <div className="text-center">
                            <div className="text-xl font-bold text-white">
                              {searchData.departureAirport?.airportCode}
                            </div>
                            <div className="text-xs text-blue-100">
                              {searchData.departureAirport?.city}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-0.5 bg-white/40"></div>
                            <span className="text-xl text-white">✈</span>
                            <div className="w-8 h-0.5 bg-white/40"></div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-white">
                              {searchData.arrivalAirport?.airportCode}
                            </div>
                            <div className="text-xs text-blue-100">
                              {searchData.arrivalAirport?.city}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DateNavigation selectedDate={selectedDepartureDate} setSelectedDate={setSelectedDepartureDate} searchData={searchData} />
                  <FareHeaders />

                  {/* Flight Rows */}
                  <div className="space-y-4">
                    {departureFlights.map((flight) => (
                      <div key={flight.id} className="space-y-4">
                        {/* Flight row */}
                        <div className="grid grid-cols-4 gap-3">
                          <FlightDetails flight={flight} />

                          {flight.fares.map((fare, fareIndex) => {
                            const isSelected = selectedDepartureFlight?.flightId === flight.id && selectedDepartureFlight?.fareIndex === fareIndex;
                            const isExpanded = expandedFlight?.flightId === flight.id && expandedFlight?.fareIndex === fareIndex;

                            return (
                              <FareCell
                                key={fareIndex}
                                fare={fare}
                                fareIndex={fareIndex}
                                flightId={flight.id}
                                isSelected={isSelected}
                                isExpanded={isExpanded}
                                onSelect={() => {
                                  setSelectedDepartureFlight({ flightId: flight.id, fareIndex });

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

                                  setSelectedDeparture(flightData);

                                  // Lưu flightId vào localStorage để dùng sau thanh toán
                                  console.log('💾 Saving flight to localStorage:', {
                                    flightId: flight.flightData?.flightId,
                                    code: flight.code,
                                    flightData: flight.flightData
                                  });

                                  localStorage.setItem('selectedFlight', JSON.stringify({
                                    flightId: flight.flightData?.flightId, // ID từ database
                                    flightNumber: flight.code, // VD: VN001
                                    travelClass: fare.name,
                                    price: fare.price,
                                    tax: fare.tax,
                                    aircraftId: flight.flightData?.aircraft?.aircraftId // Cần aircraftId để tìm seats
                                  }));
                                }}
                                onToggleExpand={() => {
                                  if (isExpanded) {
                                    setExpandedFlight(null);
                                  } else {
                                    setExpandedFlight({ flightId: flight.id, fareIndex });
                                  }
                                }}
                              />
                            );
                          })}
                        </div>

                        {/* Expanded details */}
                        {expandedFlight?.flightId === flight.id && (
                          <ExpandedDetails
                            flight={flight}
                            fare={flight.fares[expandedFlight.fareIndex]}
                            searchData={searchData}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                !loading && (
                  <div className="bg-white rounded-xl p-8 shadow-xl mb-8 text-center">
                    <p className="text-lg text-gray-600">Không tìm thấy chuyến bay phù hợp</p>
                  </div>
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

            {/* Flight Summary */}
            <FlightSummaryCard
              title="Chuyến đi"
              total={totalDeparture}
              flight={departureFlight}
              fare={departureFare}
              searchData={searchData}
              selectedDate={selectedDepartureDate}
              adultsCount={adultsCount}
              childrenCount={childrenCount}
              infantsCount={infantsCount}
            />

            {/* Total */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl text-center mb-8 shadow-xl">
              <div className="text-xl font-semibold mb-3">Tổng tiền</div>
              <div className="text-4xl md:text-5xl font-bold">
                {formatVnd(totalDeparture)}
              </div>
              <div className="text-red-100 text-sm mt-2">Bao gồm tất cả thuế và phí</div>
            </div>

            {showAlert && (
              <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Vui lòng chọn hạng máy bay trước khi tiếp tục!</span>
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