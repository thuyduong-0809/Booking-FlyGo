"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBooking } from '../BookingContext';
import { useSearch } from '../SearchContext';
import PaymentMoMo from './payment-momo/PaymentMoMo';
import { paymentsService } from '@/services/payments.service';

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + " VND";
}

export default function PaymentPage() {
  const router = useRouter();
  const { state, grandTotal } = useBooking();
  const { searchData } = useSearch();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('atm');
  const [showMoMoPayment, setShowMoMoPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const dep = state.selectedDeparture;
  const ret = state.selectedReturn;
  const selectedServices = state.selectedServices || [];

  // Lấy số lượng người từ searchData
  const totalAdults = searchData.passengers?.adults || 0;
  const totalChildren = searchData.passengers?.children || 0;
  const totalInfants = searchData.passengers?.infants || 0;

  // Kiểm tra loại chuyến bay
  const isOneWay = searchData.tripType === 'oneWay';

  // Tính toán giá vé
  const calculateFlightPrice = (flight: any) => {
    if (!flight) return 0;
    const pricePerPerson = Number(flight.price) || 0;
    const taxPerPerson = Number(flight.tax) || 0;
    const adultAndChildrenCount = totalAdults + totalChildren;
    const infantPrice = 100000; // Em bé 100k

    return (pricePerPerson + taxPerPerson) * adultAndChildrenCount + infantPrice * totalInfants;
  };

  const departurePrice = calculateFlightPrice(dep);
  const returnPrice = calculateFlightPrice(ret);
  const servicesTotal = selectedServices
    .filter(service => service.isSelected)
    .reduce((total, service) => total + service.price, 0);
  const totalPrice = isOneWay ? departurePrice + servicesTotal : departurePrice + returnPrice + servicesTotal;

  // Handle payment confirmation
  const handlePaymentConfirm = async () => {
    if (!state.bookingId) {
      alert('Không tìm thấy booking. Vui lòng quay lại trang trước.');
      return;
    }

    if (selectedPaymentMethod === 'momo') {
      // Hiển thị PaymentMoMo component
      setShowMoMoPayment(true);
    } else {
      alert('Phương thức thanh toán này chưa được hỗ trợ. Vui lòng chọn MoMo.');
    }
  };

  const handleMoMoComplete = async () => {
    if (!state.bookingId) {
      alert('Không tìm thấy booking. Vui lòng quay lại trang trước.');
      return;
    }

    console.log('🚀 === STARTING PAYMENT COMPLETION PROCESS ===');
    console.log('📌 Booking ID:', state.bookingId);

    try {
      setIsProcessing(true);
      console.log('🔄 Step 1: Getting payments for booking:', state.bookingId);

      // Get all payments for this booking
      const payments = await paymentsService.getPaymentsByBooking(Number(state.bookingId));
      console.log('📋 Step 1 complete - Found payments:', payments);
      console.log('📋 Number of payments:', payments?.length);

      if (payments && payments.length > 0) {
        // Find the most recent payment
        const latestPayment = payments.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        console.log('🔍 Step 2: Latest payment found:', latestPayment);
        console.log('📌 Payment ID:', latestPayment.paymentId);
        console.log('📌 Current Status:', latestPayment.paymentStatus);

        // Check if payment is already completed
        if (latestPayment.paymentStatus === 'Completed') {
          console.log('✅ Payment already completed, redirecting...');
          setShowMoMoPayment(false);
          window.location.href = `/book-plane/payment/success?bookingId=${state.bookingId}`;
          return;
        }

        // Payment is still pending → Update to Completed
        console.log('⏳ Step 3: Updating payment from Pending to Completed...');
        console.log('📌 Calling updatePaymentStatus with:');
        console.log('   - paymentId:', latestPayment.paymentId);
        console.log('   - newStatus: Completed');

        try {
          const result = await paymentsService.updatePaymentStatus(
            latestPayment.paymentId,
            'Completed'
          );

          console.log('✅ Step 3 complete - Payment status updated successfully:', result);
          console.log('✅ New payment status from response:', result.paymentStatus);

          // Redirect to success page
          console.log('🚀 Step 4: Redirecting to success page...');
          setShowMoMoPayment(false);
          setIsProcessing(false);

          // Wait a bit to ensure backend update is complete
          await new Promise(resolve => setTimeout(resolve, 500));

          window.location.href = `/book-plane/payment/success?bookingId=${state.bookingId}`;
        } catch (updateError) {
          console.error('❌ Error updating payment status:', updateError);
          setIsProcessing(false);
          alert('Lỗi cập nhật trạng thái: ' + (updateError as any)?.message || 'Vui lòng thử lại.');
        }
      } else {
        console.warn('⚠️ No payments found');
        setIsProcessing(false);
        alert('Không tìm thấy thông tin thanh toán. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      setIsProcessing(false);
      alert('Có lỗi xảy ra: ' + (error as any)?.message || 'Vui lòng thử lại.');
    }
  };

  const handleMoMoClose = () => {
    setShowMoMoPayment(false);
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
                href="/book-plane/choose-seat"
                className="flex items-center justify-center w-12 h-12 bg-black/20 hover:bg-black/30 rounded-full transition-all duration-200 hover:scale-110"
              >
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-black">
                  XÁC NHẬN & THANH TOÁN
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
        <div className="lg:col-span-2 space-y-6">
          {/* Flight Information */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-7 h-7 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              Thông tin hành trình
            </h2>
            <div className="space-y-6">
              {/* Departure Flight */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-blue-800">Chuyến đi</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-700">{dep?.code}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800">{searchData.departureAirport?.airportCode}</div>
                    <div className="text-base text-gray-600">{searchData.departureAirport?.city}</div>
                    <div className="text-xl font-semibold text-gray-800 mt-2">{dep?.departTime}</div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <svg className="w-6 h-6 text-gray-500 mx-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                    </svg>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800">{searchData.arrivalAirport?.airportCode}</div>
                    <div className="text-base text-gray-600">{searchData.arrivalAirport?.city}</div>
                    <div className="text-xl font-semibold text-gray-800 mt-2">{dep?.arriveTime}</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{dep?.fareName}</span>
                </div>
              </div>

              {/* Return Flight - chỉ hiển thị khi không phải chuyến bay một chiều */}
              {!isOneWay && (
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-green-800">Chuyến về</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <span className="text-sm font-medium text-green-700">{ret?.code}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800">{searchData.arrivalAirport?.airportCode}</div>
                      <div className="text-base text-gray-600">{searchData.arrivalAirport?.city}</div>
                      <div className="text-xl font-semibold text-gray-800 mt-2">{ret?.departTime}</div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="flex-1 h-px bg-gray-300"></div>
                      <svg className="w-6 h-6 text-gray-500 mx-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                      </svg>
                      <div className="flex-1 h-px bg-gray-300"></div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800">{searchData.departureAirport?.airportCode}</div>
                      <div className="text-base text-gray-600">{searchData.departureAirport?.city}</div>
                      <div className="text-xl font-semibold text-gray-800 mt-2">{ret?.arriveTime}</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{ret?.fareName}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-7 h-7 text-green-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
              </svg>
              Phương thức thanh toán
            </h2>
            <div className="space-y-4">
              <label
                onClick={() => setSelectedPaymentMethod('atm')}
                className={`flex items-center p-4 border-2 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group ${selectedPaymentMethod === 'atm' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              >
                <input
                  type="radio"
                  name="pay"
                  checked={selectedPaymentMethod === 'atm'}
                  onChange={() => setSelectedPaymentMethod('atm')}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-4 flex items-center space-x-3">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">ATM</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">Thẻ nội địa/NAPAS</div>
                    <div className="text-base text-gray-600">Thanh toán qua thẻ ATM nội địa</div>
                  </div>
                </div>
              </label>

              <label
                onClick={() => setSelectedPaymentMethod('visa')}
                className={`flex items-center p-4 border-2 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group ${selectedPaymentMethod === 'visa' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              >
                <input
                  type="radio"
                  name="pay"
                  checked={selectedPaymentMethod === 'visa'}
                  onChange={() => setSelectedPaymentMethod('visa')}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-4 flex items-center space-x-3">
                  <div className="w-12 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">VISA</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">Thẻ quốc tế (Visa/Master/JCB)</div>
                    <div className="text-base text-gray-600">Thanh toán qua thẻ quốc tế</div>
                  </div>
                </div>
              </label>

              <label
                onClick={() => setSelectedPaymentMethod('momo')}
                className={`flex items-center p-4 border-2 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group ${selectedPaymentMethod === 'momo' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              >
                <input
                  type="radio"
                  name="pay"
                  checked={selectedPaymentMethod === 'momo'}
                  onChange={() => setSelectedPaymentMethod('momo')}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-4 flex items-center space-x-3">
                  <div className="w-12 h-8 bg-gradient-to-r from-pink-500 to-pink-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">MOMO</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">Ví điện tử (Momo/ZaloPay)</div>
                    <div className="text-base text-gray-600">Thanh toán qua ví điện tử</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <Link
              href="/book-plane/choose-seat"
              className="px-8 py-4 border-2 border-gray-300 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              Quay lại
            </Link>
            <button
              onClick={handlePaymentConfirm}
              disabled={isProcessing}
              className="px-12 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 sticky top-4">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mb-8 text-center">
              THÔNG TIN ĐẶT CHỖ
            </h3>

            {/* Passenger Information */}
            <div className="mb-6">
              <h4 className="text-xl font-bold text-gray-800 mb-3">Hành khách</h4>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-lg">Người lớn</span>
                  <span className="font-semibold text-gray-800 text-lg">{totalAdults}</span>
                </div>
                {totalChildren > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 text-lg">Trẻ em</span>
                    <span className="font-semibold text-gray-800 text-lg">{totalChildren}</span>
                  </div>
                )}
                {totalInfants > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 text-lg">Em bé</span>
                    <span className="font-semibold text-gray-800 text-lg">{totalInfants}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Flight Summary */}
            <div className="mb-6">
              <h4 className="text-xl font-bold text-gray-800 mb-3">Tóm tắt chuyến bay</h4>
              <div className="space-y-4">
                {/* Departure */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-blue-800 text-lg">Chuyến đi</h5>
                    <span className="text-base text-blue-600 font-medium">{dep?.code}</span>
                  </div>
                  <div className="text-base text-gray-700">
                    <div>{searchData.departureAirport?.city} → {searchData.arrivalAirport?.city}</div>
                    <div className="text-sm text-gray-600 mt-1">{dep?.departTime} - {dep?.arriveTime}</div>
                  </div>
                </div>

                {/* Return - chỉ hiển thị khi không phải chuyến bay một chiều */}
                {!isOneWay && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-green-800 text-lg">Chuyến về</h5>
                      <span className="text-base text-green-600 font-medium">{ret?.code}</span>
                    </div>
                    <div className="text-base text-gray-700">
                      <div>{searchData.arrivalAirport?.city} → {searchData.departureAirport?.city}</div>
                      <div className="text-sm text-gray-600 mt-1">{ret?.departTime} - {ret?.arriveTime}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="mb-6">
              <h4 className="text-xl font-bold text-gray-800 mb-3">Chi tiết giá</h4>
              <div className="space-y-3 text-base">
                {/* Chuyến đi */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-800 font-medium text-lg">Chuyến đi</span>
                    <span className="font-semibold text-blue-800 text-lg">{formatVnd(departurePrice)}</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    {totalAdults > 0 && (
                      <div className="flex justify-between">
                        <span>Người lớn x {totalAdults}</span>
                        <span>{formatVnd((Number(dep?.price) || 0) * totalAdults)}</span>
                      </div>
                    )}
                    {totalChildren > 0 && (
                      <div className="flex justify-between">
                        <span>Trẻ em x {totalChildren}</span>
                        <span>{formatVnd((Number(dep?.price) || 0) * totalChildren)}</span>
                      </div>
                    )}
                    {totalInfants > 0 && (
                      <div className="flex justify-between">
                        <span>Em bé x {totalInfants}</span>
                        <span>{formatVnd(100000 * totalInfants)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-blue-200 pt-1">
                      <span>Thuế VAT</span>
                      <span>{formatVnd((Number(dep?.tax) || 0) * (totalAdults + totalChildren))}</span>
                    </div>
                  </div>
                </div>

                {/* Chuyến về - chỉ hiển thị khi không phải chuyến bay một chiều */}
                {!isOneWay && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-800 font-medium text-lg">Chuyến về</span>
                      <span className="font-semibold text-green-800 text-lg">{formatVnd(returnPrice)}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {totalAdults > 0 && (
                        <div className="flex justify-between">
                          <span>Người lớn x {totalAdults}</span>
                          <span>{formatVnd((Number(ret?.price) || 0) * totalAdults)}</span>
                        </div>
                      )}
                      {totalChildren > 0 && (
                        <div className="flex justify-between">
                          <span>Trẻ em x {totalChildren}</span>
                          <span>{formatVnd((Number(ret?.price) || 0) * totalChildren)}</span>
                        </div>
                      )}
                      {totalInfants > 0 && (
                        <div className="flex justify-between">
                          <span>Em bé x {totalInfants}</span>
                          <span>{formatVnd(100000 * totalInfants)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-green-200 pt-1">
                        <span>Thuế VAT</span>
                        <span>{formatVnd((Number(ret?.tax) || 0) * (totalAdults + totalChildren))}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dịch vụ bổ sung - chỉ hiển thị khi có dịch vụ được chọn */}
                {servicesTotal > 0 && (
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-orange-800 font-medium text-lg">Dịch vụ bổ sung</span>
                      <span className="font-semibold text-orange-800 text-lg">{formatVnd(servicesTotal)}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {selectedServices
                        .filter(service => service.isSelected)
                        .map((service) => (
                          <div key={service.id} className="flex justify-between">
                            <span>{service.name}</span>
                            <span>{formatVnd(service.price)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-red-600 items-center font-bold text-xl">
                    <span>Tổng cộng</span>
                    <span className="text-red-600">{formatVnd(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-2xl text-center mb-6 shadow-xl">
              <div className="text-2xl font-semibold mb-2">Tổng tiền</div>
              <div className="text-4xl font-bold mb-2">{formatVnd(totalPrice)}</div>
              <div className="text-red-100 text-sm">Bao gồm tất cả thuế và phí</div>
            </div>

            <Link href="/book-plane/select-flight" className="block text-center text-blue-600 hover:text-blue-800 underline text-sm transition-colors">
              Thay đổi chuyến bay
            </Link>
          </div>
        </div>
      </div>

      {/* PaymentMoMo Modal */}
      {showMoMoPayment && state.bookingId && (
        <PaymentMoMo
          isOpen={showMoMoPayment}
          onClose={handleMoMoClose}
          onComplete={handleMoMoComplete}
          bookingId={state.bookingId.toString()}
          totalAmount={totalPrice}
          orderInfo="Thanh toan ve may bay FlyGo"
        />
      )}
    </div>
  );
}


