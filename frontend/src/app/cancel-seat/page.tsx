'use client';

import React, { useState, useEffect } from 'react';
import { requestApi } from '@/lib/api';
import { useNotification } from '@/components/Notification';
import { getCookie } from '@/utils/cookies';

interface BookingInfo {
  bookingId: string;
  bookingReference: string;
  status: string;
  bookingStatus?: string;
  totalAmount: number;
  departureTime?: string;
  fareClass?: string;
  paymentStatus?: string;
  contactEmail?: string;
  contactPhone?: string;
  bookedAt?: string;
  bookingFlights?: Array<{
    bookingFlightId: number;
    seatNumber?: string;
    flightNumber?: string;
    travelClass?: string;
    fare?: number;
    baggageAllowance?: string;
    flight?: {
      flightId: number;
      flightNumber: string;
      departureTime: string;
      arrivalTime: string;
      status: string;
      departureAirport?: {
        airportCode: string;
        airportName: string;
        city: string;
      };
      arrivalAirport?: {
        airportCode: string;
        airportName: string;
        city: string;
      };
    };
    seatAllocations?: Array<{
      allocationId: number;
      flightSeat?: {
        flightSeatId: number;
        isAvailable: boolean;
        seat?: {
          seatId: number;
          seatNumber: string;
          travelClass: string;
        };
      };
      passenger?: {
        passengerId: number;
        firstName: string;
        lastName: string;
        passengerType: string;
        dateOfBirth?: string;
      };
    }>;
  }>;
  passengers?: Array<{
    passengerId: number;
    firstName: string;
    lastName: string;
    passengerType: string;
    dateOfBirth?: string;
    passportNumber?: string;
  }>;
  flight?: {
    departureTime: string;
  };
}

const CancelSeatPage = () => {
  const { showNotification, showConfirmModal } = useNotification();
  const [bookingCode, setBookingCode] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cancellationFee, setCancellationFee] = useState(0);
  const [refundAmount, setRefundAmount] = useState(0);
  const [userData, setUserData] = useState<any>(null);

  // Tự động điền thông tin user khi đã đăng nhập
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
          // Tự động điền email
          if (response.data.email) {
            setEmail(response.data.email);
          }
          // Tự động điền tên hành khách
          const fullName = `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim();
          if (fullName) {
            setPassengerName(fullName);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const validateCancellation = (booking: BookingInfo) => {
    const now = new Date();
    // FIX: Get departureTime from bookingFlights, not from booking.flight
    const departureTime = new Date(booking.bookingFlights?.[0]?.flight?.departureTime || booking.departureTime || '');
    const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    const bookingStatus = (booking.bookingStatus || booking.status)?.toLowerCase();
    const paymentStatus = booking.paymentStatus?.toLowerCase();

    // Kiểm tra xem chuyến bay đã khởi hành chưa
    if (hoursUntilDeparture < 0) {
      return { canCancel: false, reason: 'Chuyến bay đã khởi hành. Không thể hủy vé.' };
    }

    // Kiểm tra trạng thái booking
    if (bookingStatus === 'cancelled') {
      return { canCancel: false, reason: 'Vé này đã được hủy trước đó.' };
    }

    if (paymentStatus === 'refunded') {
      return { canCancel: false, reason: 'Vé này đã được hoàn tiền trước đó.' };
    }

    // Không cho hủy trong vòng 2 giờ trước giờ khởi hành
    if (hoursUntilDeparture < 2) {
      return { canCancel: false, reason: 'Không thể hủy vé trong vòng 2 giờ trước giờ khởi hành.' };
    }

    // Nếu chưa thanh toán - cho hủy miễn phí
    if (paymentStatus !== 'paid') {
      return {
        canCancel: true,
        requiresRefund: false,
        fee: 0,
        refund: 0,
        reason: 'Đặt chỗ chưa thanh toán. Bạn có thể hủy mà không mất phí.'
      };
    }

    const totalAmount = booking.totalAmount || 0;
    // FIX: Get fare class from bookingFlights, not from booking.fareClass
    const fareClass = booking.bookingFlights?.[0]?.travelClass?.toLowerCase() || 'economy';
    let feePercentage = 0;

    // Xác định hạng vé
    const isFirst = fareClass.includes('first');
    const isBusiness = fareClass.includes('business');
    const isEconomy = !isFirst && !isBusiness; // Mặc định là Economy

    // Tính phí hủy theo hạng vé và thời gian
    if (isFirst) {
      // First Class - Phí thấp nhất
      if (hoursUntilDeparture >= 168) { // >= 7 ngày
        feePercentage = 0; // Miễn phí
      } else if (hoursUntilDeparture >= 48) { // 2-7 ngày
        feePercentage = 0.10; // 10%
      } else if (hoursUntilDeparture >= 24) { // 1-2 ngày
        feePercentage = 0.15; // 15%
      } else { // < 24 giờ
        feePercentage = 0.20; // 20%
      }
    } else if (isBusiness) {
      // Business Class - Phí trung bình
      if (hoursUntilDeparture >= 168) { // >= 7 ngày
        feePercentage = 0.10; // 10%
      } else if (hoursUntilDeparture >= 48) { // 2-7 ngày
        feePercentage = 0.20; // 20%
      } else if (hoursUntilDeparture >= 24) { // 1-2 ngày
        feePercentage = 0.25; // 25%
      } else { // < 24 giờ
        feePercentage = 0.30; // 30%
      }
    } else {
      // Economy Class - Phí cao nhất
      if (hoursUntilDeparture >= 168) { // >= 7 ngày
        feePercentage = 0.30; // 30%
      } else if (hoursUntilDeparture >= 48) { // 2-7 ngày
        feePercentage = 0.40; // 40%
      } else if (hoursUntilDeparture >= 24) { // 1-2 ngày
        feePercentage = 0.50; // 50%
      } else { // < 24 giờ
        feePercentage = 0.60; // 60%
      }
    }

    const fee = totalAmount * feePercentage;
    const refund = Math.max(0, totalAmount - fee);

    return {
      canCancel: true,
      requiresRefund: paymentStatus === 'paid',
      fee: Math.round(fee),
      refund: Math.round(refund),
      reason: `Phí hủy: ${Math.round(fee).toLocaleString('vi-VN')}đ (${(feePercentage * 100).toFixed(0)}%). Số tiền hoàn lại: ${Math.round(refund).toLocaleString('vi-VN')}đ`,
    };
  };

  const handleSearchBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    setBookingInfo(null);
    setShowConfirmation(false);

    try {
      const code = bookingCode.trim().toUpperCase();
      const name = passengerName.trim().toLowerCase();
      const emailSearch = email.trim().toLowerCase();

      // Validate: require booking code AND email, or just passenger name
      if (!code && !name) {
        const errorMsg = 'Vui lòng nhập mã đặt vé hoặc tên hành khách.';
        setError(errorMsg);
        showNotification('error', errorMsg);
        return;
      }

      if (code && !emailSearch) {
        const errorMsg = 'Vui lòng nhập email để xác thực mã đặt vé.';
        setError(errorMsg);
        showNotification('error', errorMsg);
        return;
      }

      const bookingsRes = await requestApi('bookings', 'GET');
      const bookings = bookingsRes?.data || bookingsRes || [];

      // Find booking by criteria
      const target = Array.isArray(bookings)
        ? bookings.find((b: any) => {
          // If searching by booking code, MUST match both code AND email
          if (code) {
            const codeMatch = b.bookingReference?.toUpperCase() === code;
            const emailMatch = b.user?.email?.toLowerCase() === emailSearch;
            return codeMatch && emailMatch;
          }

          // If searching by passenger name only
          if (name) {
            const userFullName = `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.toLowerCase();
            if (userFullName.includes(name)) return true;

            // Also check passengers if available
            if (b.passengers && Array.isArray(b.passengers)) {
              return b.passengers.some((p: any) => {
                const passengerFullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
                return passengerFullName.includes(name);
              });
            }
          }

          return false;
        })
        : null;

      if (!target) {
        const errorMsg = 'Không tìm thấy đặt chỗ. Vui lòng kiểm tra lại mã đặt vé và email.';
        setError(errorMsg);
        showNotification('error', errorMsg);
        return;
      }

      const detailRes = await requestApi(`bookings/${target.bookingId}`, 'GET');
      const bookingDetail = detailRes?.data || detailRes;

      console.log('Booking Detail:', bookingDetail);
      console.log('Booking Flights:', bookingDetail?.bookingFlights);
      if (bookingDetail?.bookingFlights?.[0]) {
        console.log('First Flight Seat Allocations:', bookingDetail.bookingFlights[0].seatAllocations);
      }

      if (!bookingDetail) {
        const errorMsg = 'Không thể lấy thông tin chi tiết booking.';
        setError(errorMsg);
        showNotification('error', errorMsg);
        return;
      }

      const validation = validateCancellation(bookingDetail);

      if (!validation.canCancel) {
        setError(validation.reason);
        showNotification('warning', 'Không thể hủy vé', validation.reason);
        return;
      }

      setBookingInfo(bookingDetail);
      setCancellationFee(validation.fee || 0);
      setRefundAmount(validation.refund || 0);
      setShowConfirmation(true);

      if (!validation.requiresRefund) {
        const infoMsg = 'Đặt chỗ chưa thanh toán. Bạn có thể hủy mà không mất phí.';
        setMessage(infoMsg);
        showNotification('info', infoMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
      setError(errorMsg);
      showNotification('error', 'Lỗi tra cứu', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const processCancellation = async () => {
    if (!bookingInfo) return;

    setLoading(true);
    setError('');

    try {
      const finalReason = selectedReason === 'other' ? customReason : selectedReason;

      // SCENARIO 1: User đã đăng nhập → dùng userData
      // SCENARIO 2: User chưa đăng nhập → dùng passengerName từ input
      let cancelledByName: string;

      if (userData && userData.firstName && userData.lastName) {
        // User đã đăng nhập (có token) → ưu tiên dùng tên từ userData
        cancelledByName = `${userData.firstName} ${userData.lastName}`.trim();
      } else if (passengerName && passengerName.trim()) {
        // User chưa đăng nhập HOẶC userData chưa có → dùng tên từ input
        cancelledByName = passengerName.trim();
      } else {
        // Fallback: nếu không có gì cả → dùng email hoặc 'Unknown'
        cancelledByName = email.trim() || 'Unknown User';
      }

      // Validation: đảm bảo cancelledBy không null/empty
      if (!cancelledByName || cancelledByName === '') {
        const errorMsg = 'Không xác định được người hủy vé. Vui lòng nhập tên hành khách.';
        setError(errorMsg);
        showNotification('error', errorMsg);
        return;
      }

      console.log('🔍 Cancellation Info:', {
        hasToken: !!getCookie("access_token"),
        userData: userData ? { firstName: userData.firstName, lastName: userData.lastName } : null,
        passengerNameInput: passengerName,
        emailInput: email,
        finalCancelledBy: cancelledByName,
        finalReason
      });

      const cancelRes = await requestApi(`bookings/${bookingInfo.bookingId}`, 'DELETE', {
        reason: finalReason,
        cancelledBy: cancelledByName,
        cancellationFee,
        refundAmount,
      });

      if (cancelRes?.success === false) {
        const errorMsg = cancelRes?.message || 'Hủy đặt vé thất bại. Vui lòng thử lại.';
        setError(errorMsg);
        showNotification('error', 'Hủy vé thất bại', errorMsg);
        return;
      }

      const refundMsg = refundAmount > 0
        ? `Số tiền ${refundAmount.toLocaleString('vi-VN')}đ sẽ được hoàn lại trong 3-5 ngày làm việc.`
        : 'Đặt chỗ đã được hủy thành công.';

      const successMsg = `Hủy đặt vé thành công! ${refundMsg}`;
      setMessage(successMsg);

      showNotification(
        'success',
        'Hủy vé thành công!',
        [
          `Mã đặt chỗ: ${bookingInfo.bookingReference}`,
          refundAmount > 0 ? `Số tiền hoàn lại: ${refundAmount.toLocaleString('vi-VN')}đ` : 'Không có hoàn tiền',
          refundAmount > 0 ? 'Thời gian xử lý: 3-5 ngày làm việc' : ''
        ].filter(Boolean),
        5000
      );

      setBookingCode('');
      setPassengerName('');
      setEmail('');
      setSelectedReason('');
      setCustomReason('');
      setBookingInfo(null);
      setShowConfirmation(false);
    } catch (err: any) {
      const errorMsg = err?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
      setError(errorMsg);
      showNotification('error', 'Lỗi hủy vé', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = () => {
    if (!bookingInfo) return;

    const finalReason = selectedReason === 'other' ? customReason : selectedReason;

    showConfirmModal({
      title: 'Xác nhận hủy vé',
      message: `Bạn có chắc chắn muốn hủy vé ${bookingInfo.bookingReference}? Phí hủy: ${cancellationFee.toLocaleString('vi-VN')}đ. Số tiền hoàn lại: ${refundAmount.toLocaleString('vi-VN')}đ. Lý do: ${finalReason}`,
      confirmText: 'Xác nhận hủy',
      cancelText: 'Quay lại',
      confirmButtonColor: 'red',
      onConfirm: processCancellation,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-gray-900 mb-2">Hủy Đặt Vé</h1>
          <p className="text-lg text-gray-600">Chúng tôi sẽ xử lý yêu cầu hoàn tiền của bạn trong 3-5 ngày làm việc</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-red-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">Thông tin hủy vé</h2>
          </div>

          <div className="p-6">
            {message && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-base text-green-800">{message}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-base text-red-800">{error}</p>
                </div>
              </div>
            )}

            {!showConfirmation ? (
              <form onSubmit={handleSearchBooking} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bookingCode" className="block text-base font-semibold text-gray-700 mb-2">
                      Mã đặt vé
                    </label>
                    <input
                      type="text"
                      id="bookingCode"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-lg text-gray-900 placeholder-gray-400 uppercase"
                      value={bookingCode}
                      onChange={e => setBookingCode(e.target.value)}
                      placeholder="Nhập mã đặt vé (VD: BK1A2B3C)"
                    />
                  </div>

                  <div>
                    <label htmlFor="passengerName" className="block text-base font-semibold text-gray-700 mb-2">
                      Họ tên hành khách
                    </label>
                    <input
                      type="text"
                      id="passengerName"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-lg text-gray-900 placeholder-gray-400"
                      value={passengerName}
                      onChange={e => setPassengerName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-lg text-gray-900 placeholder-gray-400"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Bắt buộc khi tìm theo mã đặt vé</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Nhập mã đặt vé + email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang kiểm tra...
                    </span>
                  ) : (
                    'Kiểm tra điều kiện hủy vé'
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-1">Mã đặt chỗ</p>
                      <p className="text-3xl font-bold text-gray-900">{bookingInfo?.bookingReference}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${bookingInfo?.bookingStatus === 'Confirmed' || bookingInfo?.status === 'Confirmed'
                        ? 'bg-green-100 text-green-700'
                        : bookingInfo?.bookingStatus === 'Pending' || bookingInfo?.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                        }`}>
                        {bookingInfo?.bookingStatus || bookingInfo?.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${bookingInfo?.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-orange-100 text-orange-700'
                        }`}>
                        {bookingInfo?.paymentStatus || 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                    <span className="text-base text-gray-600">Tổng tiền</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-blue-600">
                        {Math.floor(bookingInfo?.totalAmount || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                      </span>
                      <span className="text-lg font-semibold text-blue-600">VND</span>
                    </div>
                  </div>
                </div>

                {bookingInfo?.bookingFlights && bookingInfo.bookingFlights.length > 0 && (
                  <div className="space-y-3">
                    {bookingInfo.bookingFlights.map((bf, idx) => (
                      <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        {bf.flight && (
                          <div>
                            <div className="bg-blue-600 px-4 py-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl font-bold text-white">
                                    Máy bay :
                                  </span>
                                  <span className="text-white font-bold text-xl">{bf.flight.flightNumber}</span>
                                </div>
                                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                                  {bf.travelClass || 'Economy'}
                                </span>
                              </div>
                            </div>

                            <div className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <p className="text-4xl font-bold text-gray-900">{bf.flight.departureAirport?.airportCode}</p>
                                  <p className="text-base font-medium text-gray-700 mt-1">{bf.flight.departureAirport?.city}</p>
                                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-medium">
                                      {new Date(bf.flight.departureTime).toLocaleString('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-bold text-gray-700">
                                      {new Date(bf.flight.departureTime).toLocaleString('vi-VN', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-col items-center px-2">
                                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                  </svg>
                                  <span className="text-sm text-gray-400 mt-1">
                                    {(() => {
                                      const dep = new Date(bf.flight.departureTime);
                                      const arr = new Date(bf.flight.arrivalTime);
                                      const diff = Math.abs(arr.getTime() - dep.getTime());
                                      const hours = Math.floor(diff / (1000 * 60 * 60));
                                      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                      return `${hours}h ${minutes}m`;
                                    })()}
                                  </span>
                                </div>

                                <div className="flex-1 text-right">
                                  <p className="text-4xl font-bold text-gray-900">{bf.flight.arrivalAirport?.airportCode}</p>
                                  <p className="text-base font-medium text-gray-700 mt-1">{bf.flight.arrivalAirport?.city}</p>
                                  <div className="flex items-center justify-end gap-1 mt-2 text-sm text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-medium">
                                      {new Date(bf.flight.arrivalTime).toLocaleString('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-end gap-1 mt-1 text-sm text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-bold text-gray-700">
                                      {new Date(bf.flight.arrivalTime).toLocaleString('vi-VN', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {bf.seatAllocations && bf.seatAllocations.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                  <div className="flex items-center gap-2 mb-3">
                                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                    </svg>
                                    <span className="text-base font-semibold text-gray-700">Hành khách & Ghế ngồi</span>
                                  </div>
                                  <div className="grid gap-2">
                                    {bf.seatAllocations.map((sa, saIdx) => (
                                      <div key={saIdx} className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3 border border-gray-200">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                          </div>
                                          <div>
                                            <p className="text-lg font-semibold text-gray-900">
                                              {sa.passenger?.firstName} {sa.passenger?.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500 capitalize">{sa.passenger?.passengerType}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-blue-200 shadow-sm">

                                          <span className="text-xl font-bold text-blue-600">
                                            {sa.flightSeat?.seat?.seatNumber || 'N/A'}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {showConfirmation && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="text-base text-yellow-800">
                        <p className="text-lg font-semibold mb-2">Chi phí hủy vé</p>
                        <div className="space-y-1">
                          <p>Phí hủy: <strong>{cancellationFee.toLocaleString('vi-VN')}đ</strong></p>
                          <p>Số tiền hoàn lại: <strong className="text-green-700">{refundAmount.toLocaleString('vi-VN')}đ</strong></p>
                          <p className="text-sm mt-2">Thời gian hoàn tiền: 3-5 ngày làm việc</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="reason" className="block text-base font-semibold text-gray-700 mb-2">
                    Lý do hủy vé <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="reason"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-base text-gray-900"
                    value={selectedReason}
                    onChange={e => {
                      setSelectedReason(e.target.value);
                      if (e.target.value !== 'other') {
                        setCustomReason('');
                      }
                    }}
                    required
                  >
                    <option value="">Chọn lý do hủy vé</option>
                    <option value="Thay đổi kế hoạch cá nhân">Thay đổi kế hoạch cá nhân</option>
                    <option value="Bận công việc đột xuất">Bận công việc đột xuất</option>
                    <option value="Lý do sức khỏe">Lý do sức khỏe</option>
                    <option value="Sự cố gia đình">Sự cố gia đình</option>
                    <option value="Đặt nhầm thông tin chuyến bay">Đặt nhầm thông tin chuyến bay</option>
                    <option value="other">Lý do khác</option>
                  </select>

                  {selectedReason === 'other' && (
                    <div className="mt-3">
                      <label htmlFor="customReason" className="block text-sm font-medium text-gray-700 mb-1">
                        Vui lòng nhập lý do cụ thể
                      </label>
                      <textarea
                        id="customReason"
                        rows={4}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-base text-gray-900 placeholder-gray-400 resize-none"
                        value={customReason}
                        onChange={e => setCustomReason(e.target.value)}
                        required
                        placeholder="Nhập lý do hủy vé của bạn..."
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmation(false);
                      setBookingInfo(null);
                      setSelectedReason('');
                      setCustomReason('');
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCancel}
                    disabled={loading || !selectedReason || (selectedReason === 'other' && !customReason.trim())}
                    className="flex-1 bg-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Đang xử lý...' : 'Xác nhận hủy vé'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelSeatPage;
