'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBooking } from '../BookingContext';
import { useSearch } from '../SearchContext';

interface Passenger {
  id: number;
  gender: 'male' | 'female' | 'other';
  lastName: string;
  firstName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  country: string;
  idNumber: string;
  currentResidence: string;
  skyjoyMemberCode: string;
  buyForMe: boolean;
  ottPreference: 'none' | 'zalo' | 'whatsapp';
  rememberDetails: boolean;
}

export default function PassengersPage() {
  const router = useRouter();
  const { state, grandTotal } = useBooking();
  const { searchData } = useSearch();

  // Lấy số lượng người từ searchData
  const totalAdults = searchData.passengers?.adults || 0;
  const totalChildren = searchData.passengers?.children || 0;
  const totalInfants = searchData.passengers?.infants || 0;

  const [passengers, setPassengers] = useState<Passenger[]>(
    Array.from({ length: totalAdults }, (_, index) => ({
      id: index + 1,
      gender: 'male' as const,
      lastName: '',
      firstName: '',
      dateOfBirth: '',
      phoneNumber: '',
      email: '',
      country: 'Việt Nam',
      idNumber: '',
      currentResidence: '',
      skyjoyMemberCode: '',
      buyForMe: false,
      ottPreference: 'none' as const,
      rememberDetails: false,
    }))
  );

  const [surveyChecked, setSurveyChecked] = useState(false);

  const updatePassenger = (passengerId: number, field: keyof Passenger, value: any) => {
    setPassengers(prev =>
      prev.map(passenger =>
        passenger.id === passengerId
          ? { ...passenger, [field]: value }
          : passenger
      )
    );
  };

  const formatVnd = (amount: number) => {
    // Làm tròn số về số nguyên để tránh hiển thị phần thập phân
    const roundedNumber = Math.round(amount);
    return new Intl.NumberFormat('vi-VN').format(roundedNumber);
  };

  const departureFlight = state.selectedDeparture;
  const returnFlight = state.selectedReturn;

  // Tính tổng tiền: Người lớn và trẻ em tính giá như nhau, em bé 100k
  const calculatedTotal = useMemo(() => {
    const depPricePerPerson = (Number(departureFlight?.price) || 0);
    const depTaxPerPerson = (Number(departureFlight?.tax) || 0);

    const retPricePerPerson = (Number(returnFlight?.price) || 0);
    const retTaxPerPerson = (Number(returnFlight?.tax) || 0);

    // Người lớn + trẻ em tính giá như nhau
    const adultAndChildrenCount = totalAdults + totalChildren;

    // Tổng cho chuyến đi
    const depAdultPrice = (depPricePerPerson + depTaxPerPerson) * adultAndChildrenCount;
    const depInfantPrice = 100000 * totalInfants;
    const totalDeparture = depAdultPrice + depInfantPrice;

    // Tổng cho chuyến về
    const retAdultPrice = (retPricePerPerson + retTaxPerPerson) * adultAndChildrenCount;
    const retInfantPrice = 100000 * totalInfants;
    const totalReturn = retAdultPrice + retInfantPrice;

    return totalDeparture + totalReturn;
  }, [departureFlight, returnFlight, totalAdults, totalChildren, totalInfants]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      {/* Top banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back button */}
              <Link
                href="/book-plane/select-flight-recovery"
                className="flex items-center justify-center w-12 h-12 bg-black/20 hover:bg-black/30 rounded-full transition-all duration-200 hover:scale-110"
              >
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-black">
                  CHUYẾN BAY KHỨ HỒI | {totalAdults} Người lớn {totalChildren > 0 && `${totalChildren} Trẻ em`} {totalInfants > 0 && `${totalInfants} Em bé`}
                </h1>
                <div className="text-black mt-2 font-medium">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Điểm khởi hành {searchData.departureAirport?.city}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Điểm đến {searchData.arrivalAirport?.city}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Passenger Forms */}
        <div className="lg:col-span-2">

          {/* Passenger Forms */}
          <div className="space-y-8">
            {passengers.map((passenger, index) => (
              <div key={passenger.id} className="bg-white rounded-xl p-8 shadow-xl border border-gray-100">
                {/* Passenger Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Người lớn {index + 1}</h3>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                </div>

                {/* Gender Selection */}
                <div className="mb-6">
                  <div className="flex space-x-6">
                    {[
                      { value: 'male', label: 'Nam' },
                      { value: 'female', label: 'Nữ' },
                      { value: 'other', label: 'Khác' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`gender-${passenger.id}`}
                          value={option.value}
                          checked={passenger.gender === option.value}
                          onChange={(e) => updatePassenger(passenger.id, 'gender', e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-base text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-base font-bold text-black mb-2">
                        Họ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={passenger.lastName}
                        onChange={(e) => updatePassenger(passenger.id, 'lastName', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3  text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Nhập họ"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        ① Hướng dẫn nhập họ, tên đệm và tên.
                      </p>
                    </div>

                    <div>
                      <label className="block text-base font-bold text-black mb-2">
                        Ngày sinh <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={passenger.dateOfBirth}
                        onChange={(e) => updatePassenger(passenger.id, 'dateOfBirth', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="DD/MM/YYYY"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-bold text-black mb-2">
                        Số điện thoại  <span className="text-red-500">*</span>
                      </label>
                      <div className="flex">
                        <select className="border-2 border-gray-300 border-r-0 rounded-l-xl px-3 py-3 text-gray-700 focus:border-blue-500 focus:ring-3 focus:ring-blue-200">
                          <option value="+84 ">🇻🇳 +84 </option>
                        </select>
                        <input
                          type="tel"
                          value={passenger.phoneNumber}
                          onChange={(e) => updatePassenger(passenger.id, 'phoneNumber', e.target.value)}
                          className="flex-1 border-2 border-gray-300 rounded-r-xl px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-bold text-black mb-2">
                        CCCD / Hộ chiếu
                      </label>
                      <input
                        type="text"
                        value={passenger.idNumber}
                        onChange={(e) => updatePassenger(passenger.id, 'idNumber', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Nhập CCCD hoặc số hộ chiếu"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-bold text-black mb-2">
                        Nơi ở hiện tại
                      </label>
                      <input
                        type="text"
                        value={passenger.currentResidence}
                        onChange={(e) => updatePassenger(passenger.id, 'currentResidence', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Nhập địa chỉ hiện tại"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-bold text-black mb-2">
                        Nhập mã hội viên SkyJoy (SJxxxxxxxxxx)
                      </label>
                      <input
                        type="text"
                        value={passenger.skyjoyMemberCode}
                        onChange={(e) => updatePassenger(passenger.id, 'skyjoyMemberCode', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="SJxxxxxxxxxx"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div >
                      <label className="block text-base font-bold text-black mb-2">
                        Tên đệm & tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={passenger.firstName}
                        onChange={(e) => updatePassenger(passenger.id, 'firstName', e.target.value)}
                        className="mb-6 w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all "
                        placeholder="Nhập tên đệm và tên"
                      />
                    </div>

                    <div >
                      <label className="block text-base font-bold text-black mb-2">
                        Quốc gia <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={passenger.country}
                        onChange={(e) => updatePassenger(passenger.id, 'country', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Việt Nam"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-bold text-black mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={passenger.email}
                        onChange={(e) => updatePassenger(passenger.id, 'email', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Nhập email"
                      />
                    </div>
                  </div>
                </div>

                {/* Buy for me toggle */}
                <div className="mt-6 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={passenger.buyForMe}
                    onChange={(e) => updatePassenger(passenger.id, 'buyForMe', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-base text-gray-700">Mua vé cho tôi</span>
                </div>

                {/* OTT Communication */}
                <div className="mt-6">
                  <label className="block text-base font-bold text-black mb-3">
                    Nhận thông tin hành trình qua tin nhắn OTT
                  </label>
                  <div className="flex space-x-6">
                    {[
                      { value: 'none', label: 'Không chọn' },
                      { value: 'zalo', label: 'Zalo OA' },
                      { value: 'whatsapp', label: 'WhatsApp' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`ott-${passenger.id}`}
                          value={option.value}
                          checked={passenger.ottPreference === option.value}
                          onChange={(e) => updatePassenger(passenger.id, 'ottPreference', e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-base text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Remember details */}
                <div className="mt-6 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={passenger.rememberDetails}
                    onChange={(e) => updatePassenger(passenger.id, 'rememberDetails', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-base text-gray-700">
                    Ghi nhớ các chi tiết hành khách trên cho các lần đặt vé trong tương lai
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Policy */}
          <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <p className="text-base text-gray-700">
              Bằng cách chọn "Đi tiếp", Quý khách xác nhận đã đọc, hiểu và đồng ý với việc xử lý dữ liệu cá nhân theo các mục đích đã chọn và{' '}
              <a href="#" className="text-blue-600 underline hover:text-blue-800">
                Chính sách Quyền riêng tư
              </a>{' '}
              của Vietjet.
            </p>
          </div>
        </div>

        {/* Right: Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 sticky top-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mb-8 text-center">
              THÔNG TIN ĐẶT CHỖ
            </h3>

            {/* Departure Flight */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-bold text-black">Chuyến đi</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-black">{formatVnd(((Number(departureFlight?.price) || 0) + (Number(departureFlight?.tax) || 0)) * (totalAdults + totalChildren) + 100000 * totalInfants)} VND</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                {/* Route */}
                <div className="text-base text-gray-700">{searchData.departureAirport?.city || ''} ({searchData.departureAirport?.airportCode || ''}) ✈ {searchData.arrivalAirport?.city || ''} ({searchData.arrivalAirport?.airportCode || ''})</div>

                {/* Date - Format: "Chủ nhật, 28/10/2025" */}
                <div className="text-base text-gray-700">
                  {(() => {
                    const date = searchData.departureDate || new Date();
                    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
                    const dayName = dayNames[date.getDay()];
                    const day = date.getDate();
                    const month = date.getMonth() + 1;
                    const year = date.getFullYear();
                    return `${dayName}, ${day}/${month}/${year}`;
                  })()}
                </div>

                {/* Time */}
                <div className="text-base text-gray-700">Giờ bay: {departureFlight?.departTime || ''} - {departureFlight?.arriveTime || ''}</div>

                {/* Flight Code */}
                <div className="text-base text-gray-700">Số hiệu: {departureFlight?.code || ''}</div>

                {/* Fare Class */}
                <div className="text-base font-bold text-gray-700">Hạng vé: {departureFlight?.fareName || ''}</div>

                {/* Price Breakdown */}
                <div className="pt-2 space-y-3 border-t border-gray-200">
                  {/* Giá vé cho người lớn */}
                  {totalAdults > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-700">Người lớn x {totalAdults}</span>
                      <span className="font-semibold text-gray-700">{formatVnd((Number(departureFlight?.price) || 0) * totalAdults)} VND</span>
                    </div>
                  )}

                  {/* Giá vé cho trẻ em */}
                  {totalChildren > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-700">Trẻ em x {totalChildren}</span>
                      <span className="font-semibold text-gray-700">{formatVnd((Number(departureFlight?.price) || 0) * totalChildren)} VND</span>
                    </div>
                  )}

                  {/* Giá vé cho em bé */}
                  {totalInfants > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-700">Em bé x {totalInfants}</span>
                      <span className="font-semibold text-gray-700">{formatVnd(100000 * totalInfants)} VND</span>
                    </div>
                  )}

                  {/* Thuế VAT */}
                  {(totalAdults > 0 || totalChildren > 0 || totalInfants > 0) && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-base text-gray-700">Thuế VAT</span>
                      <span className="font-semibold text-gray-700">{formatVnd((Number(departureFlight?.tax) || 0) * (totalAdults + totalChildren))} VND</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Return Flight */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-bold text-black">Chuyến về</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-black">{formatVnd(((Number(returnFlight?.price) || 0) + (Number(returnFlight?.tax) || 0)) * (totalAdults + totalChildren) + 100000 * totalInfants)} VND</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                {/* Route */}
                <div className="text-base text-gray-700">{searchData.arrivalAirport?.city || ''} ({searchData.arrivalAirport?.airportCode || ''}) ✈ {searchData.departureAirport?.city || ''} ({searchData.departureAirport?.airportCode || ''})</div>

                {/* Date - Format: "Thứ hai, 29/10/2025" */}
                <div className="text-base text-gray-700">
                  {(() => {
                    const date = searchData.returnDate || new Date();
                    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
                    const dayName = dayNames[date.getDay()];
                    const day = date.getDate();
                    const month = date.getMonth() + 1;
                    const year = date.getFullYear();
                    return `${dayName}, ${day}/${month}/${year}`;
                  })()}
                </div>

                {/* Time */}
                <div className="text-base text-gray-700">Giờ bay: {returnFlight?.departTime || ''} - {returnFlight?.arriveTime || ''}</div>

                {/* Flight Code */}
                <div className="text-base text-gray-700">Số hiệu: {returnFlight?.code || ''}</div>

                {/* Fare Class */}
                <div className="text-base font-bold text-gray-700">Hạng vé: {returnFlight?.fareName || ''}</div>

                {/* Price Breakdown */}
                <div className="pt-2 space-y-3 border-t border-gray-200">
                  {/* Giá vé cho người lớn */}
                  {totalAdults > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-700">Người lớn x {totalAdults}</span>
                      <span className="font-semibold text-gray-700">{formatVnd((Number(returnFlight?.price) || 0) * totalAdults)} VND</span>
                    </div>
                  )}

                  {/* Giá vé cho trẻ em */}
                  {totalChildren > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-700">Trẻ em x {totalChildren}</span>
                      <span className="font-semibold text-gray-700">{formatVnd((Number(returnFlight?.price) || 0) * totalChildren)} VND</span>
                    </div>
                  )}

                  {/* Giá vé cho em bé */}
                  {totalInfants > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-base text-gray-700">Em bé x {totalInfants}</span>
                      <span className="font-semibold text-gray-700">{formatVnd(100000 * totalInfants)} VND</span>
                    </div>
                  )}

                  {/* Thuế VAT */}
                  {(totalAdults > 0 || totalChildren > 0 || totalInfants > 0) && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-base text-gray-700">Thuế VAT</span>
                      <span className="font-semibold text-gray-700">{formatVnd((Number(returnFlight?.tax) || 0) * (totalAdults + totalChildren))} VND</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl text-center mb-8 shadow-xl">
              <div className="text-xl font-semibold mb-3">Tổng tiền</div>
              <div className="text-4xl md:text-5xl font-bold">
                {formatVnd(calculatedTotal)} VND
              </div>
              <div className="text-red-100 text-sm mt-2">Bao gồm tất cả thuế và phí</div>
            </div>

            <Link href="/book-plane/choose-seat" className="w-full block text-center bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-5 rounded-2xl text-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              Đi tiếp
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="px-6 py-3 border-2 border-gray-300 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Quay lại
          </button>

          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">Tổng tiền</div>
            <div className="text-2xl font-bold text-red-600">{formatVnd(calculatedTotal)} VND</div>
          </div>

          <Link href="/book-plane/choose-seat" className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            Đi tiếp
          </Link>
        </div>
      </div>
    </div>
  );
}

