"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '../BookingContext';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface FlightPrice {
  date: string;
  price: number;
  isLowest?: boolean;
}

interface FlightInfo {
  departure: string;
  destination: string;
  date: string;
  price: number;
  taxes: number;
  services: number;
}

const FlightDetailPage = () => {
  const router = useRouter();
  const { state, setDates } = useBooking();
  const [selectedDepartureDate, setSelectedDepartureDate] = useState<Date | null>(null);
  const [selectedReturnDate, setSelectedReturnDate] = useState<Date | null>(null);
  const [departureMonth, setDepartureMonth] = useState(10);
  const [returnMonth, setReturnMonth] = useState(10);
  const [departureYear, setDepartureYear] = useState(2025);
  const [returnYear, setReturnYear] = useState(2025);

  // Mock data cho giá vé theo ngày - phù hợp với hình ảnh
  const departurePrices: FlightPrice[] = [
    { date: '2025-10-13', price: 1290000 },
    { date: '2025-10-14', price: 890000 },
    { date: '2025-10-15', price: 890000 },
    { date: '2025-10-16', price: 490000, isLowest: true },
    { date: '2025-10-17', price: 1010000 },
    { date: '2025-10-18', price: 890000 },
    { date: '2025-10-19', price: 890000 },
    { date: '2025-10-20', price: 890000 },
    { date: '2025-10-21', price: 890000 },
    { date: '2025-10-22', price: 890000 },
    { date: '2025-10-23', price: 890000 },
    { date: '2025-10-24', price: 890000 },
    { date: '2025-10-25', price: 890000 },
    { date: '2025-10-26', price: 890000 },
    { date: '2025-10-27', price: 890000 },
    { date: '2025-10-28', price: 490000, isLowest: true },
    { date: '2025-10-29', price: 490000, isLowest: true },
    { date: '2025-10-30', price: 890000 },
    { date: '2025-10-31', price: 490000, isLowest: true },
  ];

  const returnPrices: FlightPrice[] = [
    { date: '2025-10-13', price: 890000 },
    { date: '2025-10-14', price: 890000 },
    { date: '2025-10-15', price: 890000 },
    { date: '2025-10-16', price: 490000, isLowest: true },
    { date: '2025-10-17', price: 890000 },
    { date: '2025-10-18', price: 890000 },
    { date: '2025-10-19', price: 890000 },
    { date: '2025-10-20', price: 890000 },
    { date: '2025-10-21', price: 890000 },
    { date: '2025-10-22', price: 890000 },
    { date: '2025-10-23', price: 890000 },
    { date: '2025-10-24', price: 890000 },
    { date: '2025-10-25', price: 890000 },
    { date: '2025-10-26', price: 890000 },
    { date: '2025-10-27', price: 890000 },
    { date: '2025-10-28', price: 490000, isLowest: true },
    { date: '2025-10-29', price: 490000, isLowest: true },
    { date: '2025-10-30', price: 890000 },
    { date: '2025-10-31', price: 490000, isLowest: true },
  ];

  const getPriceForDate = (date: Date, prices: FlightPrice[]) => {
    const dateStr = date.toISOString().split('T')[0];
    return prices.find(p => p.date === dateStr);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getTotalPrice = () => {
    let total = 0;
    if (selectedDepartureDate) {
      const depPrice = getPriceForDate(selectedDepartureDate, departurePrices);
      if (depPrice) total += depPrice.price;
    }
    if (selectedReturnDate) {
      const retPrice = getPriceForDate(selectedReturnDate, returnPrices);
      if (retPrice) total += retPrice.price;
    }
    return total;
  };

  const renderCalendar = (value: Date | null, onChange: (date: Date | null) => void, prices: FlightPrice[], title: string) => {
    return (
      <div className="mb-8">
        <h3 className="text-xl md:text-2xl font-bold mb-6 text-black">{title}</h3>
        
        {/* Month selection */}
        <div className="flex items-center justify-between mb-6">
          <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex space-x-4">
            <div className="bg-yellow-400 border-2 border-red-500 rounded-full px-8 py-4 shadow-md">
              <div className="text-lg font-bold text-black">10/2025</div>
              <div className="text-sm font-semibold text-black">Từ 490 000 VND</div>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-full px-8 py-4 hover:border-gray-300 transition-colors">
              <div className="text-lg font-bold text-black">11/2025</div>
              <div className="text-sm font-semibold text-black">Từ 490 000 VND</div>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-full px-8 py-4 hover:border-gray-300 transition-colors">
              <div className="text-lg font-bold text-black">12/2025</div>
              <div className="text-sm font-semibold text-black">Từ 290 000 VND</div>
            </div>
          </div>
          
          <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white border rounded-lg p-6 shadow-md">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map(day => (
              <div key={day} className="text-center text-base font-bold text-black py-3">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Previous month days */}
            <div className="text-center py-3 text-gray-400 text-base">29</div>
            <div className="text-center py-3 text-gray-400 text-base">30</div>
            
            {/* Current month days */}
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
              const date = new Date(2025, 9, day);
              const priceData = getPriceForDate(date, prices);
              const isSelected = value && value.getDate() === day;
              const isLowest = priceData?.isLowest;
              const isDisabled = day <= 12; // Disable dates before 13th
              
              return (
                <button
                  key={day}
                  onClick={() => {
                    if (isDisabled) return;
                    onChange(date);
                    const depISO = title.includes("Chuyến đi") ? date.toISOString().split('T')[0] : (selectedDepartureDate ? selectedDepartureDate.toISOString().split('T')[0] : undefined);
                    const retISO = title.includes("Chuyến về") ? date.toISOString().split('T')[0] : (selectedReturnDate ? selectedReturnDate.toISOString().split('T')[0] : undefined);
                    setDates(depISO, retISO);
                  }}
                  disabled={isDisabled}
                  className={`
                    text-center py-4 rounded-lg text-base transition-colors border
                    ${isDisabled 
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                      : isSelected 
                        ? 'bg-pink-200 text-black border-pink-300' 
                        : isLowest 
                          ? 'bg-green-500 text-white border-green-600' 
                          : 'bg-white hover:bg-gray-50 text-black border-gray-200'
                    }
                  `}
                >
                  <div className="font-bold text-lg">{day}</div>
                  {priceData && !isDisabled && (
                    <div className="text-sm mt-2 font-medium">
                      {formatPrice(priceData.price)} VND
                    </div>
                  )}
                </button>
              );
            })}
            
            {/* Next month day */}
            <div className="text-center py-3 text-gray-400 text-base">1</div>
            <div className="text-center py-3 text-gray-400 text-base">2</div>
            <div className="text-center py-3 text-gray-400 text-base">3</div>
            <div className="text-center py-3 text-gray-400 text-base">4</div>
            <div className="text-center py-3 text-gray-400 text-base">5</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-yellow-400 py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black">CHUYẾN BAY {state.tripType === "oneway" ? "1 CHIỀU" : "KHỨ HỒI"} | {state.passengers} Người lớn</h1>
              <div className="text-base md:text-lg text-black mt-2 font-medium">
                <div>• Điểm khởi hành {state.origin}</div>
                <div>• Điểm đến {state.destination}</div>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-xl">✈️</div>
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-xl">👤</div>
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-xl">🛒</div>
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-xl">$</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-6">
                Chọn giá vé (Giá hiển thị theo tiền VND)
              </h2>
              
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded"></div>
                  <span className="text-base font-medium text-black">Giá vé thấp nhất</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-pink-200 rounded"></div>
                  <span className="text-base font-medium text-black">Đang chọn</span>
                </div>
              </div>

              {/* Departure Flight */}
              {renderCalendar(
                selectedDepartureDate,
                setSelectedDepartureDate,
                departurePrices,
                "Chuyến đi Tp. Hồ Chí Minh (SGN) → Hà Nội (HAN)"
              )}

              {/* Return Flight - chỉ hiển thị khi là khứ hồi */}
              {state.tripType === "round" && renderCalendar(
                selectedReturnDate,
                setSelectedReturnDate,
                returnPrices,
                "Chuyến về Hà Nội (HAN) → Tp. Hồ Chí Minh (SGN)"
              )}

              <button
                onClick={() => router.push('/book-plane/select-flight')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-6 rounded-lg transition-colors text-lg mt-8"
              >
                Đi tiếp
              </button>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-8 sticky top-4 shadow-xl border">
              <h3 className="text-xl md:text-2xl font-bold text-red-600 mb-8 text-center">THÔNG TIN ĐẶT CHỖ</h3>
              
              {/* Passenger Info */}
              <div className="mb-8">
                <label className="block text-base font-bold text-black mb-3">
                  Thông tin hành khách
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập thông tin hành khách"
                />
              </div>

              {/* Departure Flight */}
              <div className="mb-8">
                <h4 className="font-bold text-lg text-black mb-4">Chuyến đi</h4>
                <div className="space-y-4">
                  <div className="text-base font-medium text-black">
                    Tp. Hồ Chí Minh (SGN) → Hà Nội (HAN)
                  </div>
                  <div className="text-base text-gray-600 border-b border-dashed pb-3">
                    {selectedDepartureDate 
                      ? selectedDepartureDate.toLocaleDateString('vi-VN')
                      : 'Chọn ngày khởi hành'
                    }
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Giá vé</label>
                      <input
                        type="text"
                        className="w-full border-2 border-gray-300 rounded px-3 py-2 text-base bg-gray-50"
                        value={selectedDepartureDate ? `${formatPrice(getPriceForDate(selectedDepartureDate, departurePrices)?.price || 0)} VND` : ''}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Thuế, phí</label>
                      <input
                        type="text"
                        className="w-full border-2 border-gray-300 rounded px-3 py-2 text-base"
                        placeholder="0 VND"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Dịch vụ</label>
                      <select className="w-full border-2 border-gray-300 rounded px-3 py-2 text-base">
                        <option>0 VND</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Return Flight - chỉ hiển thị khi là khứ hồi */}
              {state.tripType === "round" && (
                <div className="mb-8">
                  <h4 className="font-bold text-lg text-black mb-4 bg-yellow-100 px-3 py-2 rounded">Chuyến về</h4>
                  <div className="space-y-4">
                    <div className="text-base font-medium text-black">
                      Hà Nội (HAN) → Tp. Hồ Chí Minh (SGN)
                    </div>
                    <div className="text-base text-gray-600 border-b border-dashed pb-3">
                      {selectedReturnDate 
                        ? selectedReturnDate.toLocaleDateString('vi-VN')
                        : 'Chọn ngày về'
                      }
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-black mb-2">Giá vé</label>
                        <input
                          type="text"
                          className="w-full border-2 border-gray-300 rounded px-3 py-2 text-base bg-gray-50"
                          value={selectedReturnDate ? `${formatPrice(getPriceForDate(selectedReturnDate, returnPrices)?.price || 0)} VND` : ''}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-black mb-2">Thuế, phí</label>
                        <input
                          type="text"
                          className="w-full border-2 border-gray-300 rounded px-3 py-2 text-base"
                          placeholder="0 VND"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-black mb-2">Dịch vụ</label>
                        <select className="w-full border-2 border-gray-300 rounded px-3 py-2 text-base">
                          <option>0 VND</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="bg-red-600 text-white p-6 rounded-lg text-center shadow-lg">
                <div className="text-lg font-semibold mb-2">Tổng tiền</div>
                <div className="text-3xl md:text-4xl font-bold">
                  {formatPrice(getTotalPrice())} VND
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetailPage;
