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
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        🔍 Tra Cứu Đơn Hàng
                    </h1>
                    <p className="text-gray-600">
                        Nhập email và mã đặt chỗ để tra cứu thông tin đơn hàng của bạn
                    </p>
                </div>

                {/* Search Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@email.com"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                Mã Đặt Chỗ (PNR) <span className="text-gray-500 text-sm font-normal">(Tùy chọn)</span>
                            </label>
                            <input
                                type="text"
                                value={bookingReference}
                                onChange={(e) => setBookingReference(e.target.value.toUpperCase())}
                                placeholder="BK123456 - Bỏ trống nếu quên"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
                                maxLength={10}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                💡 Tip: Bỏ trống mã đặt chỗ để xem tất cả đơn hàng của email này
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                            <p className="font-semibold">⚠️ {error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                            '🔍 Tra Cứu Đơn Hàng'
                        )}
                    </button>
                </div>

                {/* Bookings List - Hiển thị khi chỉ tìm theo email */}
                {bookingsList.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            📋 Tìm thấy {bookingsList.length} đơn hàng
                        </h2>
                        <div className="space-y-4">
                            {bookingsList.map((booking: any, index: number) => (
                                <div
                                    key={index}
                                    onClick={() => handleSelectBooking(booking)}
                                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="text-lg font-bold text-blue-600 mb-1">
                                                {booking.bookingReference}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {formatDate(booking.bookedAt)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold mb-2 ${getStatusColor(booking.bookingStatus)}`}>
                                                {booking.bookingStatus}
                                            </div>
                                            <div className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ml-2 ${getStatusColor(booking.paymentStatus)}`}>
                                                {booking.paymentStatus}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="space-y-2">
                                                {booking.flights.map((flight: any, fIndex: number) => (
                                                    <div key={fIndex} className="flex items-center text-sm">
                                                        <span className="font-semibold text-gray-700">{flight.flightNumber}</span>
                                                        <span className="mx-2 text-gray-400">•</span>
                                                        <span className="text-gray-600">{flight.route}</span>
                                                        <span className="mx-2 text-gray-400">•</span>
                                                        <span className="text-gray-500">{flight.travelClass}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">Tổng tiền</p>
                                            <p className="text-2xl font-bold text-red-600">{formatVnd(booking.totalAmount)} VND</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                        <div className="text-sm text-gray-600">
                                            📧 {booking.contactEmail} • 📱 {booking.contactPhone}
                                        </div>
                                        <div className="text-blue-600 font-semibold text-sm flex items-center">
                                            Xem chi tiết
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                            <p className="text-blue-800 text-sm">
                                💡 <strong>Gợi ý:</strong> Click vào bất kỳ đơn hàng nào để xem thông tin chi tiết đầy đủ
                            </p>
                        </div>
                    </div>
                )}

                {/* Booking Details */}
                {bookingData && (
                    <div className="space-y-6">
                        {/* Booking Info Card */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                        Thông Tin Đặt Chỗ
                                    </h2>
                                    <p className="text-gray-600">
                                        Mã đặt chỗ: <span className="font-bold text-blue-600">{bookingData.bookingReference}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className={`inline-block px-4 py-2 rounded-lg font-semibold ${getStatusColor(bookingData.bookingStatus)}`}>
                                        {bookingData.bookingStatus}
                                    </div>
                                    <div className={`inline-block px-4 py-2 rounded-lg font-semibold mt-2 ml-2 ${getStatusColor(bookingData.paymentStatus)}`}>
                                        {bookingData.paymentStatus}
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-gray-600 text-sm">Khách hàng</p>
                                        <p className="font-semibold text-gray-800">{bookingData.customer.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Email</p>
                                        <p className="font-semibold text-gray-800">{bookingData.customer.email}</p>
                                    </div>
                                    {bookingData.customer.phone && (
                                        <div>
                                            <p className="text-gray-600 text-sm">Số điện thoại</p>
                                            <p className="font-semibold text-gray-800">{bookingData.customer.phone}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-gray-600 text-sm">Ngày đặt</p>
                                        <p className="font-semibold text-gray-800">{formatDate(bookingData.bookedAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Tổng tiền</p>
                                        <p className="font-bold text-2xl text-red-600">{formatVnd(bookingData.totalAmount)} VND</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Flight Details */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                ✈️ Thông Tin Chuyến Bay
                            </h2>
                            <div className="space-y-4">
                                {bookingData.flights.map((flight: any, index: number) => (
                                    <div key={index} className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="text-lg font-bold text-blue-600">
                                                {flight.flightNumber}
                                            </div>
                                            <div className="text-sm font-semibold text-gray-600">
                                                {flight.travelClass}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 items-center">
                                            <div>
                                                <p className="text-sm text-gray-600">Khởi hành</p>
                                                <p className="font-bold text-xl text-gray-800">{flight.departureAirport.code}</p>
                                                <p className="text-sm text-gray-600">{flight.departureAirport.city}</p>
                                                <p className="text-sm font-semibold text-gray-700 mt-1">
                                                    {formatDate(flight.departureTime)}
                                                </p>
                                            </div>

                                            <div className="text-center">
                                                <div className="text-2xl">✈️</div>
                                                <div className="h-1 bg-blue-300 my-2"></div>
                                            </div>

                                            <div className="text-right md:text-left">
                                                <p className="text-sm text-gray-600">Đến</p>
                                                <p className="font-bold text-xl text-gray-800">{flight.arrivalAirport.code}</p>
                                                <p className="text-sm text-gray-600">{flight.arrivalAirport.city}</p>
                                                <p className="text-sm font-semibold text-gray-700 mt-1">
                                                    {formatDate(flight.arrivalTime)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                            <div>
                                                {flight.seats.length > 0 && (
                                                    <span className="text-sm text-gray-600">
                                                        Ghế: <span className="font-semibold text-gray-800">{flight.seats.map((s: any) => s.seatNumber).join(', ')}</span>
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Giá vé</p>
                                                <p className="font-bold text-lg text-red-600">{formatVnd(flight.fare)} VND</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Passengers */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                👥 Thông Tin Hành Khách
                            </h2>
                            <div className="space-y-3">
                                {bookingData.passengers.map((passenger: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    {passenger.firstName} {passenger.lastName}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {passenger.passengerType} • {new Date(passenger.dateOfBirth).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                        {passenger.passportNumber && (
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Hộ chiếu</p>
                                                <p className="font-semibold text-gray-800">{passenger.passportNumber}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payments */}
                        {bookingData.payments.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl p-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                    💳 Thông Tin Thanh Toán
                                </h2>
                                <div className="space-y-3">
                                    {bookingData.payments.map((payment: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
                                            <div>
                                                <p className="font-semibold text-gray-800">{payment.paymentMethod}</p>
                                                <p className="text-sm text-gray-600">
                                                    {payment.paidAt ? formatDate(payment.paidAt) : 'Chưa thanh toán'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-xl text-gray-800">{formatVnd(payment.amount)} VND</p>
                                                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(payment.paymentStatus)}`}>
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
                <div className="text-center mt-8">
                    <button
                        onClick={() => router.push('/')}
                        className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-colors"
                    >
                        ← Quay về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
}
