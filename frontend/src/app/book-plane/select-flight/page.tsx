"use client";

import React, { useMemo, useState } from "react";
import Link from 'next/link';
import { useBooking } from "../BookingContext";

interface FareOption {
  name: string; // Business, SkyBoss, Deluxe, Eco
  price: number; // per pax in VND
  soldOut?: boolean;
  tax: number;
  service: number;
  includes: string[];
  excludes: string[];
}

interface FlightItem {
  id: string;
  code: string; // e.g. VJ461
  departTime: string; // 05:30
  arriveTime: string; // 07:40
  aircraft: string; // Airbus A320
  note?: string; // Bay thẳng
  fares: FareOption[]; // 4 columns
}

const mockFlights: FlightItem[] = [
  {
    id: "1",
    code: "VJ461",
    departTime: "05:30",
    arriveTime: "07:40",
    aircraft: "Airbus A320",
    note: "Bay thẳng",
    fares: [
      {
        name: "FIRST CLASS",
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
        name: "BUSINESS",
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
        name: "ECO",
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
    id: "2",
    code: "VJ465",
    departTime: "10:45",
    arriveTime: "12:55",
    aircraft: "Airbus A320",
    note: "Bay thẳng",
    fares: [
      { name: "FIRST CLASS", price: 0, tax: 0, service: 0, soldOut: true, includes: [], excludes: [] },
      { name: "BUSINESS", price: 0, tax: 0, service: 0, soldOut: true, includes: [], excludes: [] },
      {
        name: "ECO",
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
    id: "3",
    code: "VJ463",
    departTime: "17:00",
    arriveTime: "19:10",
    aircraft: "Airbus A321",
    note: "Bay thẳng",
    fares: [
      { name: "FIRST CLASS", price: 0, tax: 0, service: 0, soldOut: true, includes: [], excludes: [] },
      {
        name: "BUSINESS",
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
        name: "ECO",
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

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + " VND";
}

const DateNavigation = ({ selectedDate, setSelectedDate }: { selectedDate: number, setSelectedDate: (date: number) => void }) => {
  const [visibleDates, setVisibleDates] = useState([13, 14, 15, 16]);
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
                  10
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

export default function SelectFlightPage() {
  const { state, setSelectedDeparture, grandTotal } = useBooking();
  const [selectedDepartureFlight, setSelectedDepartureFlight] = useState<{ flightId: string, fareIndex: number } | null>(null);
  const [selectedDate, setSelectedDate] = useState(14); // Thứ ba 14 tháng 10
  const [expandedFlight, setExpandedFlight] = useState<{ flightId: string, fareIndex: number } | null>(null); // Track which fare is expanded

  const departureFlight = mockFlights.find(f => f.id === selectedDepartureFlight?.flightId);
  const departureFare = departureFlight?.fares[selectedDepartureFlight?.fareIndex || 0];

  const totalDeparture = useMemo(() => {
    if (!departureFare) return 0;
    return departureFare.price + departureFare.tax + departureFare.service;
  }, [departureFare]);

  const computedGrandTotal = totalDeparture;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      {/* Top banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black">
                Chuyến bay một chiều | {state.passengers} Người lớn
              </h1>
              <div className="text-black mt-2 font-medium">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Điểm khởi hành {state.origin}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Điểm đến {state.destination}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Flights table */}
        <div className="lg:col-span-2">
          {/* Route display */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl p-4 mb-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <h2 className="text-xl font-bold text-white">CHUYẾN ĐI</h2>
                </div>
                <div className="hidden md:block w-px h-8 bg-white/30"></div>
                <div className="flex items-center space-x-3">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">HAN</div>
                    <div className="text-xs text-blue-100">Hà Nội</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-0.5 bg-white/40"></div>
                    <span className="text-xl text-white">✈</span>
                    <div className="w-8 h-0.5 bg-white/40"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">VCA</div>
                    <div className="text-xs text-blue-100">Cần Thơ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date Navigation */}
          <DateNavigation selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

          {/* Fare headers */}
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

          {/* Flight Rows */}
          <div className="space-y-4">
            {mockFlights.map((f) => (
              <div key={f.id} className="space-y-4">
                {/* Flight row */}
                <div className="grid grid-cols-4 gap-3">
                  {/* Flight details */}
                  <div className="bg-gradient-to-br from-yellow-200 via-indigo-50 to-purple-50 rounded-xl p-4 shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-800 mb-1">{f.code}</div>
                      <div className="text-base text-gray-700 font-semibold mb-1">{f.departTime} - {f.arriveTime}</div>
                      <div className="text-sm text-gray-600 mb-2">{f.aircraft}</div>
                      <div className="inline-flex items-center px-3 py-1 bg-blue-100 rounded-full">
                        <span className="text-lg text-blue-600 mr-1">✈</span>
                        <span className="text-blue-700 text-sm font-semibold">{f.note}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fare cells */}
                  {f.fares.map((fare, fareIndex) => {
                    const isSelected = selectedDepartureFlight?.flightId === f.id && selectedDepartureFlight?.fareIndex === fareIndex;
                    const isExpanded = expandedFlight?.flightId === f.id && expandedFlight?.fareIndex === fareIndex;
                    const isDisabled = fare.soldOut;

                    return (
                      <button
                        key={fareIndex}
                        disabled={isDisabled}
                        onClick={() => {
                          if (isDisabled) return;

                          // Toggle expansion
                          if (isExpanded) {
                            setExpandedFlight(null);
                          } else {
                            setExpandedFlight({ flightId: f.id, fareIndex });
                          }

                          // Also select this fare
                          setSelectedDepartureFlight({ flightId: f.id, fareIndex });
                          setSelectedDeparture({
                            flightId: f.id,
                            fareIndex,
                            fareName: fare.name,
                            price: fare.price,
                            tax: fare.tax,
                            service: fare.service,
                            code: f.code,
                            departTime: f.departTime,
                            arriveTime: f.arriveTime,
                          });
                        }}
                        className={`rounded-xl p-6 text-center shadow-lg border transition-all duration-200 relative ${isDisabled
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                          : isSelected
                            ? "bg-white text-black border-red-500 border-2 shadow-xl transform scale-105"
                            : "bg-white text-black hover:bg-gray-50 hover:shadow-xl hover:scale-102 border border-gray-200"
                          }`}
                      >
                        {isDisabled ? (
                          <div className="flex flex-col items-center">
                            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <div className="text-base">Hết chỗ</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-xl font-bold">{formatVnd(fare.price)}</div>
                            <div className="text-base mt-1">1 người</div>
                            <svg className="w-5 h-5 mx-auto mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        )}

                        {/* Selection indicator */}
                        {isSelected && !isDisabled && (
                          <div className="absolute -right-2 -top-2 bg-green-500 text-white rounded-full p-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Expanded details section - appears right below the flight row */}
                {expandedFlight?.flightId === f.id && (() => {
                  const selectedFlight = mockFlights.find(flight => flight.id === expandedFlight.flightId);
                  const selectedFare = selectedFlight?.fares[expandedFlight.fareIndex];
                  const fareName = selectedFare?.name;

                  // Màu nền tương ứng với từng fare class
                  let bgColor = "bg-gray-50";
                  if (fareName === "FIRST CLASS") bgColor = "bg-amber-50";
                  else if (fareName === "BUSINESS") bgColor = "bg-red-50";
                  else if (fareName === "ECO") bgColor = "bg-green-50";

                  return (
                    <div className={`${bgColor} rounded-lg p-6 col-span-4`}>
                      {/* Flight route and duration */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-base text-gray-700 font-medium">
                          {state.origin} {f.departTime}, {state.departureDate}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-base text-gray-700 font-medium">2 giờ 10 phút</div>
                          <span className="text-xl text-gray-600">✈</span>
                          <div className="text-base text-blue-600 font-medium">Bay thẳng</div>
                        </div>
                        <div className="text-base text-gray-700 font-medium">
                          {state.destination} {f.arriveTime}, {state.departureDate}
                        </div>
                      </div>

                      {/* Includes section */}
                      <div className="mb-4">
                        <h4 className="text-lg font-bold text-black mb-3">Bao gồm:</h4>
                        <ul className="space-y-3 text-base text-gray-800">
                          {(selectedFare?.includes || []).map((item, index) => (
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
                      {selectedFare?.excludes && selectedFare.excludes.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-lg font-bold text-black mb-3">Chưa bao gồm:</h4>
                          <ul className="space-y-3 text-base text-gray-800">
                            {selectedFare.excludes.map((item, index) => (
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

                      {/* Footer with links and selection status */}
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
                })()}
              </div>
            ))}
          </div>
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
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Nhập thông tin hành khách"
              />
            </div>

            {/* Departure Flight */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-lg text-black">Chuyến đi</h4>
                <div className="flex items-center">
                  <span className="font-bold text-lg text-black mr-2">{formatVnd(totalDeparture)}</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>

              <div className="text-base text-gray-700 mb-2">
                Hà Nội (HAN) ✈ Cần Thơ (VCA)
              </div>
              <div className="text-base text-gray-700 mb-3">
                T3, 14/10/2025 | {departureFlight?.departTime} - {departureFlight?.arriveTime} | {departureFlight?.code} | {departureFare?.name}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-base text-gray-700">Giá vé</span>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700">{formatVnd(departureFare?.price || 0)}</span>
                    <svg className="w-4 h-4 ml-1 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base text-gray-700">Thuế, phí</span>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700">{formatVnd(departureFare?.tax || 0)}</span>
                    <svg className="w-4 h-4 ml-1 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base text-gray-700">Dịch vụ</span>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700">{formatVnd(departureFare?.service || 0)}</span>
                    <svg className="w-4 h-4 ml-1 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl text-center mb-8 shadow-xl">
              <div className="text-xl font-semibold mb-3">Tổng tiền</div>
              <div className="text-4xl md:text-5xl font-bold">
                {formatVnd(grandTotal || computedGrandTotal)}
              </div>
              <div className="text-red-100 text-sm mt-2">Bao gồm tất cả thuế và phí</div>
            </div>

            <Link
              href="/book-plane/passengers"
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-5 rounded-2xl text-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
            >
              Đi tiếp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}