"use client";

import React, { useEffect, useState } from "react";
import { requestApi } from "@/lib/api";
import { getCookie } from "@/utils/cookies";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Passenger {
    passengerId: number;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    passportNumber?: string;
    passengerType: 'Adult' | 'Child' | 'Infant';
}

interface Booking {
    bookingId: number;
    bookingReference: string;
    bookedAt: string;
    totalAmount: number;
    bookingStatus: string;
    paymentStatus: string;
    bookingFlights?: any[];
    passengers?: Passenger[];
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4VERTISINGh6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                                        Ngày đặt: {new Date(booking.bookedAt).toLocaleDateString('vi-VN', {
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
                                {/* Passengers Information grouped by flights */}
                                {booking.passengers && booking.passengers.length > 0 && booking.bookingFlights && booking.bookingFlights.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Thông tin hành khách:</h4>
                                        {/* Group bookingFlights by flightId */}
                                        {(() => {
                                            console.log('Total bookingFlights:', booking.bookingFlights?.length);
                                            console.log('bookingFlights:', booking.bookingFlights);

                                            // Group by flight-room
                                            const groupedFlights = booking.bookingFlights.reduce((acc: any, bf: any) => {
                                                // Try different ways to get flightId
                                                const flightId = bf.flightId || bf.flight?.flightId || bf.flight?.id;
                                                console.log('bf.flightId:', bf.flightId, 'bf.flight:', bf.flight);
                                                if (!acc[flightId]) {
                                                    acc[flightId] = {
                                                        flight: bf.flight,
                                                        bookingFlights: []
                                                    };
                                                }
                                                acc[flightId].bookingFlights.push(bf);
                                                return acc;
                                            }, {});

                                            // Convert to array and take first 2 flights
                                            const flightGroups = Object.values(groupedFlights).slice(0, 2);

                                            console.log('groupedFlights:', groupedFlights);
                                            console.log('flightGroups:', flightGroups);

                                            console.log('Number of flight groups:', flightGroups.length);
                                            return flightGroups.map((group: any, flightIndex: number) => {
                                                console.log(`Group ${flightIndex} - bookingFlights count:`, group.bookingFlights?.length);
                                                return (
                                                    <div key={flightIndex} className="mb-4">
                                                        <div className={`p-4 rounded-lg border-2 ${flightIndex === 0 ? 'bg-blue-50 border-blue-300' : 'bg-green-50 border-green-300'}`}>
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h5 className="font-bold text-lg text-gray-900">
                                                                    {flightIndex === 0 ? '✈️ Chuyến đi' : '✈️ Chuyến về'}
                                                                </h5>
                                                                <div className="text-right">
                                                                    <div className="text-sm font-semibold text-gray-700">
                                                                        {new Date(group.flight?.departureTime).toLocaleDateString('vi-VN', {
                                                                            weekday: 'long',
                                                                            day: '2-digit',
                                                                            month: '2-digit',
                                                                            year: 'numeric'
                                                                        })}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600">
                                                                        {new Date(group.flight?.departureTime).toLocaleTimeString('vi-VN', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })} - {new Date(group.flight?.arrivalTime).toLocaleTimeString('vi-VN', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                                                <div>
                                                                    <span className="text-gray-600">Từ:</span>
                                                                    <span className="ml-2 font-semibold text-gray-900">
                                                                        {group.flight?.departureAirport?.city} ({group.flight?.departureAirport?.airportCode})
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">Đến:</span>
                                                                    <span className="ml-2 font-semibold text-gray-900">
                                                                        {group.flight?.arrivalAirport?.city} ({group.flight?.arrivalAirport?.airportCode})
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="border-t border-gray-300 pt-3">
                                                                <h6 className="font-semibold text-gray-700 mb-2">Danh sách hành khách:</h6>
                                                                <div className="space-y-2">
                                                                    {group.bookingFlights.map((bf: any) => {
                                                                        // Get the seatAllocation for this bookingFlight
                                                                        const seatAllocation = bf.seatAllocations?.[0];
                                                                        const passenger = seatAllocation?.passenger;
                                                                        const seatNumber = seatAllocation?.seat?.seatNumber || bf.seatNumber;

                                                                        return (
                                                                            <div key={bf.bookingFlightId} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                                                                                <div className="flex items-center justify-between">
                                                                                    <div className="flex items-center space-x-3">
                                                                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                                                            <span className="text-purple-600 font-bold text-sm">
                                                                                                {passenger?.passengerType === 'Adult' ? 'A' : passenger?.passengerType === 'Child' ? 'C' : 'I'}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="font-semibold text-gray-900">
                                                                                                {passenger?.firstName} {passenger?.lastName}
                                                                                            </p>
                                                                                            <p className="text-sm text-gray-600">
                                                                                                {passenger?.passengerType === 'Adult' ? 'Người lớn' :
                                                                                                    passenger?.passengerType === 'Child' ? 'Trẻ em' : 'Em bé'}
                                                                                                {passenger?.passportNumber && ` • Passport: ${passenger.passportNumber}`}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                    {seatNumber && (
                                                                                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                                                                            Ghế: {seatNumber}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
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

