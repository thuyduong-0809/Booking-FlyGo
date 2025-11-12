'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestApi } from '@/lib/api';

export default function GuestBookingLookupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [bookingReference, setBookingReference] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');
    const [bookingData, setBookingData] = useState<any>(null);
    const [bookingsList, setBookingsList] = useState<any[]>([]);

    const handleSearch = async () => {
        if (!email) {
            setError('Vui lòng nhập email');
            return;
        }

        setError('');
        setIsSearching(true);
        setBookingData(null);
        setBookingsList([]);

        try {
            let url = `bookings/guest/lookup?email=${encodeURIComponent(email)}`;
            if (bookingReference) {
                url += `&bookingReference=${encodeURIComponent(bookingReference)}`;
            }

            const response = await requestApi(url, 'GET');

            if (response.success) {
                // Nếu data là array -> danh sách bookings (chỉ tìm theo email)
                if (Array.isArray(response.data)) {
                    setBookingsList(response.data);
                    setBookingData(null);
                } else {
                    // Nếu data là object -> chi tiết 1 booking (tìm theo email + PNR)
                    setBookingData(response.data);
                    setBookingsList([]);
                }
                setError('');
            } else {
                setError(response.message || 'Không tìm thấy đơn hàng');
                setBookingData(null);
                setBookingsList([]);
            }
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi tra cứu');
            setBookingData(null);
            setBookingsList([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectBooking = (booking: any) => {
        setBookingReference(booking.bookingReference);
        setBookingsList([]);
        // Tự động tìm kiếm chi tiết booking
        handleSearchDetail(booking.bookingReference);
    };

    const handleSearchDetail = async (pnr: string) => {
        setIsSearching(true);
        try {
            const response = await requestApi(
                `bookings/guest/lookup?email=${encodeURIComponent(email)}&bookingReference=${encodeURIComponent(pnr)}`,
                'GET'
            );

            if (response.success) {
                setBookingData(response.data);
            } else {
                setError(response.message || 'Không tìm thấy đơn hàng');
            }
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi tra cứu');
        } finally {
            setIsSearching(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatVnd = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
            case 'paid':
                return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
            case 'pending':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
            case 'cancelled':
                return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 sm:py-8 md:py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        Tra cứu đơn hàng
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-2">
                        Nhập email và mã đặt chỗ để tra cứu thông tin đơn hàng của bạn
                    </p>
                </div>

                {/* Search Form */}
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                        <div>
                            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2 text-sm sm:text-base">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@email.com"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2 text-sm sm:text-base">
                                Mã Đặt Chỗ (PNR) <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-normal">(Tùy chọn)</span>
                            </label>
                            <input
                                type="text"
                                value={bookingReference}
                                onChange={(e) => setBookingReference(e.target.value.toUpperCase())}
                                placeholder="BK123456 - Bỏ trống nếu quên"
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                                maxLength={10}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
                                💡 Tip: Bỏ trống mã đặt chỗ để xem tất cả đơn hàng của email này
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl mb-4 sm:mb-6">
                            <p className="font-semibold text-sm sm:text-base">⚠️ {error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 sm:py-4 text-sm sm:text-base rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isSearching ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang tìm kiếm...
                            </span>
                        ) : (
                            'Tra Cứu Đơn Hàng'
                        )}
                    </button>
                </div>

                {/* Bookings List - Hiển thị khi chỉ tìm theo email */}
                {bookingsList.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">
                            📋 Tìm thấy {bookingsList.length} đơn hàng
                        </h2>
                        <div className="space-y-3 sm:space-y-4">
                            {bookingsList.map((booking: any, index: number) => (
                                <div
                                    key={index}
                                    onClick={() => handleSelectBooking(booking)}
                                    className="border-2 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer bg-white dark:bg-gray-700/50"
                                >
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                                        <div className="flex-1">
                                            <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 mb-1">
                                                {booking.bookingReference}
                                            </div>
                                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                                {formatDate(booking.bookedAt)}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                                            <div className={`inline-block px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold ${getStatusColor(booking.bookingStatus)}`}>
                                                {booking.bookingStatus}
                                            </div>
                                            <div className={`inline-block px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold ${getStatusColor(booking.paymentStatus)}`}>
                                                {booking.paymentStatus}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <div className="space-y-2">
                                                {booking.flights.map((flight: any, fIndex: number) => (
                                                    <div key={fIndex} className="flex flex-wrap items-center text-xs sm:text-sm gap-1">
                                                        <span className="font-semibold text-gray-700 dark:text-gray-200">{flight.flightNumber}</span>
                                                        <span className="text-gray-400 dark:text-gray-500">•</span>
                                                        <span className="text-gray-600 dark:text-gray-300 break-words">{flight.route}</span>
                                                        <span className="text-gray-400 dark:text-gray-500">•</span>
                                                        <span className="text-gray-500 dark:text-gray-400">{flight.travelClass}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Tổng tiền</p>
                                            <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{formatVnd(booking.totalAmount)} VND</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 break-words">
                                            <span className="block sm:inline">📧 {booking.contactEmail}</span>
                                            <span className="hidden sm:inline"> • </span>
                                            <span className="block sm:inline">📱 {booking.contactPhone}</span>
                                        </div>
                                        <div className="text-blue-600 dark:text-blue-400 font-semibold text-xs sm:text-sm flex items-center">
                                            Xem chi tiết
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg sm:rounded-xl">
                            <p className="text-blue-800 dark:text-blue-300 text-xs sm:text-sm">
                                💡 <strong>Gợi ý:</strong> Click vào bất kỳ đơn hàng nào để xem thông tin chi tiết đầy đủ
                            </p>
                        </div>
                    </div>
                )}

                {/* Booking Details */}
                {bookingData && (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Booking Info Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6 gap-4">
                                <div className="flex-1">
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                        Thông Tin Đặt Chỗ
                                    </h2>
                                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                                        Mã đặt chỗ: <span className="font-bold text-blue-600 dark:text-blue-400">{bookingData.bookingReference}</span>
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                                    <div className={`inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold ${getStatusColor(bookingData.bookingStatus)}`}>
                                        {bookingData.bookingStatus}
                                    </div>
                                    <div className={`inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold ${getStatusColor(bookingData.paymentStatus)}`}>
                                        {bookingData.paymentStatus}
                                    </div>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Khách hàng</p>
                                        <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100 break-words">{bookingData.customer.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Email</p>
                                        <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100 break-all">{bookingData.customer.email}</p>
                                    </div>
                                    {bookingData.customer.phone && (
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Số điện thoại</p>
                                            <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100">{bookingData.customer.phone}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Ngày đặt</p>
                                        <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100">{formatDate(bookingData.bookedAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Tổng tiền</p>
                                        <p className="font-bold text-xl sm:text-2xl text-red-600 dark:text-red-400">{formatVnd(bookingData.totalAmount)} VND</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Flight Details */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">
                                ✈️ Thông Tin Chuyến Bay
                            </h2>
                            <div className="space-y-3 sm:space-y-4">
                                {bookingData.flights.map((flight: any, index: number) => (
                                    <div key={index} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-blue-300 dark:hover:border-blue-500 transition-colors bg-white dark:bg-gray-700/50">
                                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                                            <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                                                {flight.flightNumber}
                                            </div>
                                            <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300">
                                                {flight.travelClass}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center">
                                            <div>
                                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Khởi hành</p>
                                                <p className="font-bold text-lg sm:text-xl text-gray-800 dark:text-gray-100">{flight.departureAirport.code}</p>
                                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">{flight.departureAirport.city}</p>
                                                <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
                                                    {formatDate(flight.departureTime)}
                                                </p>
                                            </div>

                                            <div className="text-center">
                                                <div className="text-xl sm:text-2xl">✈️</div>
                                                <div className="h-1 bg-blue-300 dark:bg-blue-600 my-2"></div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Đến</p>
                                                <p className="font-bold text-lg sm:text-xl text-gray-800 dark:text-gray-100">{flight.arrivalAirport.code}</p>
                                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">{flight.arrivalAirport.city}</p>
                                                <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
                                                    {formatDate(flight.arrivalTime)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                            <div>
                                                {flight.seats.length > 0 && (
                                                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                                        Ghế: <span className="font-semibold text-gray-800 dark:text-gray-100">{flight.seats.map((s: any) => s.seatNumber).join(', ')}</span>
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Giá vé</p>
                                                <p className="font-bold text-base sm:text-lg text-red-600 dark:text-red-400">{formatVnd(flight.fare)} VND</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Passengers */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">
                                👥 Thông Tin Hành Khách
                            </h2>
                            <div className="space-y-3">
                                {bookingData.passengers.map((passenger: any, index: number) => (
                                    <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl gap-3">
                                        <div className="flex items-center space-x-3 sm:space-x-4">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 dark:bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100 break-words">
                                                    {passenger.firstName} {passenger.lastName}
                                                </p>
                                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                                    {passenger.passengerType} • {new Date(passenger.dateOfBirth).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                        {passenger.passportNumber && (
                                            <div className="text-left sm:text-right pl-11 sm:pl-0">
                                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Hộ chiếu</p>
                                                <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100 break-all">{passenger.passportNumber}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payments */}
                        {bookingData.payments.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">
                                    💳 Thông Tin Thanh Toán
                                </h2>
                                <div className="space-y-3">
                                    {bookingData.payments.map((payment: any, index: number) => (
                                        <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700/50 gap-3">
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100">{payment.paymentMethod}</p>
                                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                                    {payment.paidAt ? formatDate(payment.paidAt) : 'Chưa thanh toán'}
                                                </p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="font-bold text-lg sm:text-xl text-gray-800 dark:text-gray-100 mb-1 sm:mb-0">{formatVnd(payment.amount)} VND</p>
                                                <span className={`inline-block px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold ${getStatusColor(payment.paymentStatus)}`}>
                                                    {payment.paymentStatus}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Back Button */}
                <div className="text-center mt-6 sm:mt-8">
                    <button
                        onClick={() => router.push('/')}
                        className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl transition-colors"
                    >
                        ← Quay về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
}
