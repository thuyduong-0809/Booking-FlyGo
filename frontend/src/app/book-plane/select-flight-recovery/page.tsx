"use client";

import React, { useMemo, useState, useEffect } from "react";
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

// Recovery flights data - both departure and return flights
const recoveryFlights: FlightItem[] = [
  {
    id: "r1",
    code: "VJ461",
    departTime: "05:30",
    arriveTime: "07:40",
    aircraft: "Airbus A320",
    note: "Bay thẳng",
    fares: [
      {
        name: "FIST CLASS",
        price: 8834400,
        tax: 1166800,
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
      },
      {
        name: "BUSSINESS",
        price: 4090000,
        tax: 1166800,
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
      },
      {
        name: "Eco",
        price: 3470000,
        tax: 1166800,
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
      },
    ],
  },
  {
    id: "r2",
    code: "VJ465",
    departTime: "10:45",
    arriveTime: "12:55",
    aircraft: "Airbus A320",
    note: "Bay thẳng",
    fares: [
      { name: "Business", price: 0, tax: 0, service: 0, soldOut: true, includes: [], excludes: [] },
      { name: "SkyBoss", price: 0, tax: 0, service: 0, soldOut: true, includes: [], excludes: [] },

      {
        name: "Eco",
        price: 3470000,
        tax: 1166800,
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
      },
    ],
  },
  {
    id: "r3",
    code: "VJ463",
    departTime: "17:00",
    arriveTime: "19:10",
    aircraft: "Airbus A321",
    note: "Bay thẳng",
    fares: [
      { name: "Business", price: 0, tax: 0, service: 0, soldOut: true, includes: [], excludes: [] },
      {
        name: "SkyBoss",
        price: 4090000,
        tax: 1166800,
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
      },

      {
        name: "Eco",
        price: 1010000,
        tax: 1166800,
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
      },
    ],
  },
];

// Return flights for recovery
const recoveryReturnFlights: FlightItem[] = [
  {
    id: "rr1",
    code: "VJ464",
    departTime: "13:20",
    arriveTime: "15:30",
    aircraft: "Airbus A321",
    note: "Bay thẳng",
    fares: [
      {
        name: "Business",
        price: 3110400,
        tax: 1166800,
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
      },
      {
        name: "SkyBoss",
        price: 3110400,
        tax: 1166800,
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
      },

      {
        name: "Eco",
        price: 890000,
        tax: 1166800,
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
      },
    ],
  },
];

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
const DateNavigation = ({ selectedDate, setSelectedDate, searchData, type }: {
  selectedDate: number,
  setSelectedDate: (date: number) => void,
  searchData: any,
  type: 'departure' | 'return'
}) => {
  // Khởi tạo visibleDates dựa trên ngày từ searchData
  const getInitialDates = () => {
    const baseDate = type === 'departure'
      ? (searchData.departureDate ? searchData.departureDate.getDate() : 14)
      : (searchData.returnDate ? searchData.returnDate.getDate() : 14);
    return [baseDate - 1, baseDate, baseDate + 1, baseDate + 2];
  };

  const [visibleDates, setVisibleDates] = useState(getInitialDates());
  const currentIndex = visibleDates.indexOf(selectedDate);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setSelectedDate(visibleDates[currentIndex - 1]);
    } else {
      // Load previous 4 dates
      const prevStartDate = visibleDates[0] - 4;
      if (prevStartDate >= 1) { // Đảm bảo không âm
        const newDates = [prevStartDate, prevStartDate + 1, prevStartDate + 2, prevStartDate + 3];
        setVisibleDates(newDates);
        setSelectedDate(newDates[3]); // Chọn ngày cuối của nhóm mới
      }
    }
  };

  const goToNext = () => {
    if (currentIndex < visibleDates.length - 1) {
      setSelectedDate(visibleDates[currentIndex + 1]);
    } else {
      // Load next 4 dates starting from the next date
      const nextStartDate = visibleDates[visibleDates.length - 1] + 1;
      const newDates = [nextStartDate, nextStartDate + 1, nextStartDate + 2, nextStartDate + 3];
      setVisibleDates(newDates);
      setSelectedDate(newDates[0]);
    }
  };


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
                  {type === 'departure'
                    ? (searchData.departureDate ? searchData.departureDate.getMonth() + 1 : 10)
                    : (searchData.returnDate ? searchData.returnDate.getMonth() + 1 : 10)
                  }
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
        <ul className="space-y-3 text-base text-gray-800">
          {fare.includes.map((item, index) => (
            <li key={index} className="flex items-start">
              <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Excludes section */}
      {fare.excludes && fare.excludes.length > 0 && (
        <div className="mb-4">
          <h4 className="text-lg font-bold text-black mb-3">Chưa bao gồm:</h4>
          <ul className="space-y-3 text-base text-gray-800">
            {fare.excludes.map((item, index) => (
              <li key={index} className="flex items-start">
                <svg className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
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
  quantity
}: {
  title: string;
  total: number;
  flight?: FlightItem;
  fare?: FareOption;
  type: 'departure' | 'return';
  state: any;
  selectedDate: number;
  quantity: number;
}) => {
  // Function to get full date string for display
  const getFullDateString = (date: number) => {
    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const dayOfWeek = dayNames[date % 7];
    const month = type === 'departure'
      ? (state.departureDate ? state.departureDate.getMonth() + 1 : 10)
      : (state.returnDate ? state.returnDate.getMonth() + 1 : 10);
    const year = type === 'departure'
      ? (state.departureDate ? state.departureDate.getFullYear() : 2025)
      : (state.returnDate ? state.returnDate.getFullYear() : 2025);
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

          {/* Price breakdown - chia thành nhiều dòng */}
          <div className="space-y-2 border-t pt-2">
            <div className="flex justify-between items-center">
              <span className="text-base text-gray-700">Giá vé</span>
              <span className="font-semibold text-gray-700">{formatVnd(fare?.price || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base text-gray-700">Thuế, phí</span>
              <span className="font-semibold text-gray-700">{formatVnd(fare?.tax || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base text-gray-700">Dịch vụ</span>
              <span className="font-semibold text-gray-700">{formatVnd(fare?.service || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base text-gray-700">Số lượng vé</span>
              <span className="font-semibold text-gray-700">{quantity}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function SelectFlightRecoveryPage() {
  const { state, setSelectedDeparture, setSelectedReturn, grandTotal } = useBooking();
  const { searchData } = useSearch();

  // Debug: Log searchData để kiểm tra dữ liệu
  console.log('SearchData in select-flight-recovery:', searchData);
  console.log('Departure Date:', searchData.departureDate);
  console.log('Return Date:', searchData.returnDate);

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

  // Số lượng vé = số lượng người từ searchData
  const departureQuantity = searchData.passengers?.adults || 1;
  const returnQuantity = searchData.passengers?.adults || 1;

  // Sử dụng ngày từ searchData hoặc mặc định
  const [selectedDepartureDate, setSelectedDepartureDate] = useState(
    searchData.departureDate ? searchData.departureDate.getDate() : 14
  );
  const [selectedReturnDate, setSelectedReturnDate] = useState(
    searchData.returnDate ? searchData.returnDate.getDate() : 14
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

  // Đồng bộ ngày với searchData khi context thay đổi
  useEffect(() => {
    if (searchData.departureDate) {
      setSelectedDepartureDate(searchData.departureDate.getDate());
    }
    if (searchData.returnDate) {
      setSelectedReturnDate(searchData.returnDate.getDate());
    }
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
  }, [searchData.departureAirport?.airportCode, searchData.arrivalAirport?.airportCode]);

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
          "Hành lý ký gửi: 60kg",
          "Phòng chờ sang trọng",
          "Ưu tiên làm thủ tục",
          "Thưởng thức ẩm thực suốt chuyến bay",
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
          "Hành lý xách tay: 14kg",
          "Hành lý ký gửi: 50kg",
          "Phòng chờ",
          "Ưu tiên làm thủ tục",
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
          "Hành lý xách tay: 07Kg"
        ],
        excludes: [
          "Hành lý ký gửi (tùy chọn)",
          "Suất ăn",
          "Chọn trước chỗ ngồi",
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
  const searchFlights = async () => {
    setLoading(true);
    setError('');

    try {
      // Format date
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };

      // Tìm kiếm chuyến đi
      const departureSearchResult = await flightsService.searchFlights({
        departureAirportCode: searchData.departureAirport?.airportCode,
        arrivalAirportCode: searchData.arrivalAirport?.airportCode,
        departureDate: formatDate(searchData.departureDate!)
      });

      if (departureSearchResult.success && departureSearchResult.data) {
        const departureItems = departureSearchResult.data.map(flight => convertFlightToFlightItem(flight));
        setDepartureFlights(departureItems);
      } else {
        setDepartureFlights([]);
      }

      // Tìm kiếm chuyến về (nếu có returnDate)
      if (searchData.returnDate) {
        const returnSearchResult = await flightsService.searchFlights({
          departureAirportCode: searchData.arrivalAirport?.airportCode,
          arrivalAirportCode: searchData.departureAirport?.airportCode,
          departureDate: formatDate(searchData.returnDate)
        });

        if (returnSearchResult.success && returnSearchResult.data) {
          const returnItems = returnSearchResult.data.map(flight => convertFlightToFlightItem(flight));
          setReturnFlights(returnItems);
        } else {
          setReturnFlights([]);
        }
      }
    } catch (err: any) {
      console.error('Error searching flights:', err);
      setError(`Lỗi khi tìm kiếm chuyến bay: ${err.message || 'Không thể kết nối đến server'}`);
      setDepartureFlights([]);
      setReturnFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const [expandedFlight, setExpandedFlight] = useState<{ flightId: string, fareIndex: number, type: 'departure' | 'return' } | null>(null);

  const departureFlight = departureFlights.find(f => f.id === selectedDepartureFlight?.flightId);
  const returnFlight = returnFlights.find(f => f.id === selectedReturnFlight?.flightId);

  const departureFare = departureFlight?.fares[selectedDepartureFlight?.fareIndex || 0];
  const returnFare = returnFlight?.fares[selectedReturnFlight?.fareIndex || 0];

  const totalDeparture = useMemo(() => {
    if (!departureFare) return 0;
    const price = Number(departureFare.price) || 0;
    const tax = Number(departureFare.tax) || 0;
    return (price + tax) * departureQuantity;
  }, [departureFare, departureQuantity]);

  const totalReturn = useMemo(() => {
    if (!returnFare) return 0;
    const price = Number(returnFare.price) || 0;
    const tax = Number(returnFare.tax) || 0;
    return (price + tax) * returnQuantity;
  }, [returnFare, returnQuantity]);

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
    setSelectedDate: (date: number) => void
  ) => (
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

      <DateNavigation selectedDate={selectedDate} setSelectedDate={setSelectedDate} searchData={searchData} type={type} />
      <FareHeaders />

      {/* Flight Rows */}
      <div className="space-y-4">
        {flights.map((flight) => (
          <div key={flight.id} className="space-y-4">
            {/* Flight row */}
            <div className="grid grid-cols-4 gap-3">
              <FlightDetails flight={flight} />

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
                        setSelectedDeparture(flightData);
                      } else {
                        setSelectedReturn(flightData);
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
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      {/* Top banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
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
                renderFlightSection(
                  departureFlights,
                  'departure',
                  'CHUYẾN ĐI',
                  selectedDepartureFlight,
                  setSelectedDepartureFlight,
                  selectedDepartureDate,
                  setSelectedDepartureDate
                )
              ) : (
                !loading && (
                  <div className="bg-white rounded-xl p-8 shadow-xl mb-8 text-center">
                    <p className="text-lg text-gray-600">Không tìm thấy chuyến bay đi phù hợp</p>
                  </div>
                )
              )}

              {/* Return Flights */}
              {returnFlights.length > 0 ? (
                renderFlightSection(
                  returnFlights,
                  'return',
                  'CHUYẾN VỀ',
                  selectedReturnFlight,
                  setSelectedReturnFlight,
                  selectedReturnDate,
                  setSelectedReturnDate
                )
              ) : (
                !loading && searchData.returnDate && (
                  <div className="bg-white rounded-xl p-8 shadow-xl mb-8 text-center">
                    <p className="text-lg text-gray-600">Không tìm thấy chuyến bay về phù hợp</p>
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

            {/* Flight Summaries */}
            <FlightSummaryCard
              title="Chuyến đi"
              total={totalDeparture}
              flight={departureFlight}
              fare={departureFare}
              type="departure"
              state={searchData}
              selectedDate={selectedDepartureDate}
              quantity={departureQuantity}
            />

            <FlightSummaryCard
              title="Chuyến về"
              total={totalReturn}
              flight={returnFlight}
              fare={returnFare}
              type="return"
              state={searchData}
              selectedDate={selectedReturnDate}
              quantity={returnQuantity}
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
