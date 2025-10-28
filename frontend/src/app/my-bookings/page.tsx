"use client";

import React, { useEffect, useState } from "react";
import { requestApi } from "@/lib/api";
import { getCookie } from "@/utils/cookies";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Booking {
    bookingId: number;
    bookingReference: string;
    bookingDate: string;
    totalAmount: number;
    bookingStatus: string;
    paymentStatus: string;
    bookingFlights?: any[];
}

const MyBookingsPage = () => {
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const token = getCookie("access_token");

            if (!token) {
                router.push("/login");
                return;
            }

            const payload = JSON.parse(atob(token.split(".")[1]));
            const userId = payload.userId;

            if (!userId) {
                console.error("User ID not found in token");
                router.push("/login");
                return;
            }

            const response = await requestApi(`bookings?userId=${userId}`, "GET");

            console.log('📋 Bookings response:', response);

            if (response.success && response.data) {
                setBookings(response.data);
            } else {
                setError("Không thể tải danh sách đặt chỗ");
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            setError("Có lỗi xảy ra khi tải danh sách đặt chỗ");
        } finally {
            setLoading(false);
        }
    };

    const formatVnd = (n: number) => {
        return new Intl.NumberFormat("vi-VN").format(n) + " VND";
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'Reserved':
                return 'bg-yellow-100 text-yellow-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'Paid':
                return 'bg-green-100 text-green-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <div className="text-lg font-medium text-gray-600">Đang tải đơn đặt chỗ...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Đơn đặt của tôi</h1>
                <p className="text-gray-600">Xem và quản lý tất cả các đơn đặt chỗ của bạn</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {bookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Chưa có đơn đặt chỗ
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Bạn chưa có đơn đặt chỗ nào. Hãy bắt đầu tìm kiếm chuyến bay!
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        Tìm kiếm chuyến bay
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking.bookingId} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        Mã đặt chỗ: {booking.bookingReference}
                                    </h3>
                                    <p className="text-blue-100 text-sm mt-1">
                                        Ngày đặt: {new Date(booking.bookingDate).toLocaleDateString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.bookingStatus)}`}>
                                        {booking.bookingStatus}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                        {booking.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {booking.bookingFlights && booking.bookingFlights.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Thông tin chuyến bay:</h4>
                                        <div className="space-y-3">
                                            {booking.bookingFlights.map((bf: any, index: number) => {
                                                const flight = bf.flight;
                                                return (
                                                    <div key={index} className={`p-4 rounded-lg ${index === 0 ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'}`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-semibold text-gray-900">
                                                                {index === 0 ? '✈️ Chuyến đi' : '✈️ Chuyến về'}
                                                            </span>
                                                            <span className="text-sm text-gray-600">Số hiệu: {flight.flightNumber}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <span className="text-gray-600">Từ:</span>
                                                                <span className="ml-2 text-black font-semibold">{flight.departureAirport?.city} ({flight.departureAirport?.airportCode})</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-600">Đến:</span>
                                                                <span className="ml-2 text-black font-semibold">{flight.arrivalAirport?.city} ({flight.arrivalAirport?.airportCode})</span>
                                                            </div>
                                                            {/* <div>
                                                                <span className="text-gray-600">Khởi hành:</span>
                                                                <span className="ml-2 text-black font-semibold">{bf.departTime || flight.departTime}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-600">Đến nơi:</span>
                                                                <span className="ml-2 text-black font-semibold">{bf.arriveTime || flight.arriveTime}</span>
                                                            </div> */}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div>
                                        <p className="text-sm text-gray-600">Tổng tiền</p>
                                        <p className="text-2xl font-bold text-green-600">{formatVnd(booking.totalAmount)}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        {booking.bookingStatus === 'Completed' && (
                                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                                Xem chi tiết
                                            </button>
                                        )}
                                        {booking.bookingStatus === 'Reserved' && booking.paymentStatus !== 'Paid' && (
                                            <Link
                                                href={`/book-plane/payment?bookingId=${booking.bookingId}`}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                                            >
                                                Thanh toán
                                            </Link>
                                        )}
                                        {booking.bookingStatus === 'Cancelled' && (
                                            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                                                Đặt lại
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookingsPage;

