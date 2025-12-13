"use client";

import React, { useEffect, useState } from "react";
import { requestApi } from "@/lib/api";
import { getCookie } from "@/utils/cookies";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/components/Notification";

interface SeatAllocation {
    allocationId: number;
    seat?: {
        seatId: number;
        seatNumber: string;
        travelClass: string;
    };
    flightSeat?: {
        flightSeatId: number;
        seat: {
            seatId: number;
            seatNumber: string;
            travelClass: string;
        };
    };
    passenger: {
        passengerId: number;
        firstName: string;
        lastName: string;
        passengerType: 'Adult' | 'Child' | 'Infant';
        passportNumber?: string;
    };
}

interface BookingFlight {
    bookingFlightId: number;
    travelClass: string;
    fare: number;
    seatNumber?: string;
    baggageAllowance: number;
    flight: {
        flightId: number;
        flightNumber: string;
        departureTime: string;
        arrivalTime: string;
        duration: number;
        departureAirport: {
            airportId: number;
            airportCode: string;
            airportName: string;
            city: string;
        };
        arrivalAirport: {
            airportId: number;
            airportCode: string;
            airportName: string;
            city: string;
        };
    };
    seatAllocations: SeatAllocation[];
}

interface Booking {
    bookingId: number;
    bookingReference: string;
    bookedAt: string;
    totalAmount: number;
    bookingStatus: 'Reserved' | 'Confirmed' | 'Cancelled' | 'Completed';
    paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
    bookingFlights: BookingFlight[];
    passengers?: Array<{
        passengerId: number;
        firstName: string;
        lastName: string;
        passengerType: 'Adult' | 'Child' | 'Infant';
    }>;
}

const MyBookingsPage = () => {
    const PAGE_SIZE = 5;

    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [displayedBookings, setDisplayedBookings] = useState<Booking[]>([]);
    const [pendingDate, setPendingDate] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [hasMore, setHasMore] = useState(false);
    const [expandedBookings, setExpandedBookings] = useState<Set<number>>(new Set());
    const router = useRouter();
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            console.log("🔍 Bắt đầu fetch bookings...");

            const token = getCookie("access_token");
            console.log("🔑 Token:", token ? "Có token" : "Không có token");

            if (!token) {
                console.log("❌ Không có token, chuyển hướng đến login");
                router.push("/login?action=redirect");
                return;
            }

            const payload = JSON.parse(atob(token.split(".")[1]));
            const userId = payload.userId;
            console.log("👤 User ID:", userId);

            if (!userId) {
                console.log("❌ Không có userId trong token");
                showNotification("error", "Không tìm thấy thông tin người dùng");
                router.push("/login");
                return;
            }

            console.log("🌐 Gọi API:", `bookings?userId=${userId}`);
            const response = await requestApi(`bookings?userId=${userId}`, "GET");
            console.log("📡 API Response:", response);
            console.log("📡 Response type:", typeof response);
            console.log("📡 Response keys:", Object.keys(response || {}));

            // Xử lý response - có thể API trả về trực tiếp array hoặc có wrapper
            let data = [];
            if (response.success && response.data) {
                data = response.data || [];
            } else if (Array.isArray(response)) {
                // Trường hợp API trả về trực tiếp array
                data = response;
                console.log("📡 API trả về trực tiếp array");
            } else if (response && typeof response === 'object' && !response.success) {
                // Trường hợp API trả về object nhưng không có success flag
                data = response.data || response || [];
                console.log("📡 API trả về object không có success flag");
            }

            console.log("✅ Dữ liệu bookings sau xử lý:", data);
            console.log("📊 Số lượng bookings:", data.length);

            // Log chi tiết từng booking để debug
            if (Array.isArray(data) && data.length > 0) {
                data.forEach((booking, index) => {
                    console.log(`📦 Booking ${index + 1}:`, {
                        bookingId: booking.bookingId,
                        bookingReference: booking.bookingReference,
                        hasBookingFlights: !!booking.bookingFlights,
                        bookingFlightsCount: booking.bookingFlights?.length || 0,
                        bookingFlightsData: booking.bookingFlights,
                        allKeys: Object.keys(booking)
                    });
                });
            }

            if (Array.isArray(data)) {
                setBookings(data);
                applyFiltersAndUpdate(data, searchDate);
                setPendingDate(searchDate);

                if (data.length === 0) {
                    console.log("ℹ️ Không có booking nào");
                }
            } else {
                console.log("❌ Dữ liệu không hợp lệ:", response);
                // Tạm thời set empty array để test UI
                setBookings([]);
                applyFiltersAndUpdate([], searchDate);
                showNotification("error", response.message || "Không thể tải danh sách đặt chỗ");
            }
        } catch (error: any) {
            console.error("💥 Lỗi khi fetch bookings:", error);
            showNotification("error", error.message || "Có lỗi xảy ra khi tải danh sách đặt chỗ");
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndUpdate = (source: Booking[], dateFilter: string) => {
        const normalizedDate = dateFilter.trim();
        console.log("🔍 Apply filters - Source:", source.length, "Date filter:", normalizedDate);

        const filtered = source.filter((booking) => {
            if (!normalizedDate) return true;

            const flights = booking.bookingFlights || [];
            return flights.some((bf) => {
                if (!bf?.flight?.departureTime) return false;

                // Sử dụng local date để tránh vấn đề timezone
                const departureDateObj = new Date(bf.flight.departureTime);
                const year = departureDateObj.getFullYear();
                const month = String(departureDateObj.getMonth() + 1).padStart(2, '0');
                const day = String(departureDateObj.getDate()).padStart(2, '0');
                const departureDate = `${year}-${month}-${day}`;

                return departureDate === normalizedDate;
            });
        });

        console.log("📋 Filtered bookings:", filtered.length);
        setFilteredBookings(filtered);
        const initialSlice = filtered.slice(0, PAGE_SIZE);
        console.log("📄 Displayed bookings:", initialSlice.length);
        setDisplayedBookings(initialSlice);
        setHasMore(filtered.length > initialSlice.length);
    };

    const formatVnd = (amount: number | string) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat("vi-VN", {
            style: 'currency',
            currency: 'VND'
        }).format(numAmount);
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
            case 'Confirmed':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Reserved':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Cancelled':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'Hoàn thành';
            case 'Confirmed':
                return 'Đã xác nhận';
            case 'Reserved':
                return 'Đã đặt chỗ';
            case 'Cancelled':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'Paid':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Failed':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'Refunded':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getPaymentStatusText = (status: string) => {
        switch (status) {
            case 'Paid':
                return 'Đã thanh toán';
            case 'Pending':
                return 'Chờ thanh toán';
            case 'Failed':
                return 'Thanh toán thất bại';
            case 'Refunded':
                return 'Đã hoàn tiền';
            default:
                return status;
        }
    };

    const getTravelClassText = (travelClass: string) => {
        switch (travelClass) {
            case 'Economy':
                return 'Phổ thông';
            case 'Business':
                return 'Thương gia';
            case 'First':
                return 'Hạng nhất';
            default:
                return travelClass;
        }
    };

    const getPassengerTypeText = (type: string) => {
        switch (type) {
            case 'Adult':
                return 'Người lớn';
            case 'Child':
                return 'Trẻ em';
            case 'Infant':
                return 'Em bé';
            default:
                return type;
        }
    };

    const handleApplyFilter = () => {
        setSearchDate(pendingDate);
        applyFiltersAndUpdate(bookings, pendingDate);
    };

    const handleResetFilter = () => {
        setPendingDate("");
        setSearchDate("");
        applyFiltersAndUpdate(bookings, "");
    };

    const handleLoadMore = () => {
        const nextIndex = displayedBookings.length;
        const nextSlice = filteredBookings.slice(nextIndex, nextIndex + PAGE_SIZE);
        const updated = [...displayedBookings, ...nextSlice];
        setDisplayedBookings(updated);
        setHasMore(updated.length < filteredBookings.length);
    };

    const toggleBookingDetails = (bookingId: number) => {
        console.log("🔄 Toggle booking details for ID:", bookingId);
        console.log("📋 Current expanded bookings:", Array.from(expandedBookings));

        setExpandedBookings((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(bookingId)) {
                console.log("➖ Removing from expanded:", bookingId);
                newSet.delete(bookingId);
            } else {
                console.log("➕ Adding to expanded:", bookingId);
                newSet.add(bookingId);
            }
            console.log("📋 New expanded bookings:", Array.from(newSet));
            return newSet;
        });
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">Đơn đặt của tôi</h1>
                <p className="text-gray-600">Xem và quản lý tất cả các đơn đặt chỗ của bạn</p>
                {/* Debug info */}

            </div>

            {!loading && bookings.length === 0 ? (
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
                <>
                    <div className="mb-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tìm kiến chuyến bay</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="flex flex-col">
                                <label className="text-md font-semibold text-black mb-1 dark:text-black">Ngày khởi hành</label>
                                <input
                                    type="date"
                                    value={pendingDate}
                                    onChange={(e) => setPendingDate(e.target.value)}
                                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 text-black dark:border-gray-600 dark:text-black"
                                />
                            </div>
                            <div className="flex items-end gap-3">
                                <button
                                    onClick={handleApplyFilter}
                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Lọc
                                </button>
                                <button
                                    onClick={handleResetFilter}
                                    className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                                >
                                    Đặt lại
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {displayedBookings.length === 0 && (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center text-gray-600">
                                Không tìm thấy chuyến bay phù hợp với điều kiện tìm kiếm.
                            </div>
                        )}
                        {displayedBookings.map((booking) => (
                            <div key={booking.bookingId} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                                {/* Header */}
                                <div className="bg-blue-600 px-6 py-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-white">
                                                    Mã đặt chỗ: {booking.bookingReference}
                                                </h3>
                                            </div>
                                            <p className="text-blue-100 text-sm">
                                                Ngày đặt: {formatDateTime(booking.bookedAt)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(booking.bookingStatus)}`}>
                                                {getStatusText(booking.bookingStatus)}
                                            </span>
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                                {getPaymentStatusText(booking.paymentStatus)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Debug info for this booking - Chỉ hiển thị trong development mode */}


                                    {(() => {
                                        const isExpanded = expandedBookings.has(booking.bookingId);
                                        const hasFlights = booking.bookingFlights && booking.bookingFlights.length > 0;

                                        console.log(`📦 Booking ${booking.bookingId}:`, {
                                            isExpanded,
                                            hasFlights,
                                            flightCount: booking.bookingFlights?.length || 0,
                                            expandedIds: Array.from(expandedBookings)
                                        });

                                        if (!isExpanded) {
                                            return null;
                                        }

                                        if (!hasFlights) {
                                            return (
                                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-3">
                                                        <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                                        Không có thông tin chuyến bay
                                                    </h4>
                                                    <p className="text-gray-600 text-sm mb-4">
                                                        Booking này chưa có chuyến bay được liên kết. Vui lòng liên hệ bộ phận hỗ trợ.
                                                    </p>
                                                    <div className="text-xs text-gray-500">
                                                        Mã đặt chỗ: <strong>{booking.bookingReference}</strong>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        const flightsWithData = booking.bookingFlights.filter(
                                            (bf) => bf && bf.flight && bf.flight.departureAirport && bf.flight.arrivalAirport
                                        );

                                        console.log(`✈️ Flights with data for booking ${booking.bookingId}:`, flightsWithData.length);

                                        if (flightsWithData.length === 0) {
                                            return (
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-3">
                                                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                                        Dữ liệu chuyến bay không đầy đủ
                                                    </h4>
                                                    <p className="text-gray-600 text-sm mb-4">
                                                        Thông tin sân bay hoặc chi tiết chuyến bay bị thiếu. Vui lòng liên hệ bộ phận hỗ trợ.
                                                    </p>
                                                    <div className="text-xs text-gray-500 space-y-1">
                                                        <p>Mã đặt chỗ: <strong>{booking.bookingReference}</strong></p>
                                                        <p>Tổng số chuyến bay: <strong>{booking.bookingFlights?.length || 0}</strong></p>
                                                        <p>Chuyến bay hợp lệ: <strong>0</strong></p>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (() => {

                                            const sortedFlights = [...flightsWithData].sort((a, b) => {
                                                const timeA = new Date(a.flight.departureTime).getTime();
                                                const timeB = new Date(b.flight.departureTime).getTime();
                                                return timeA - timeB;
                                            });

                                            const primaryDepartureCode = sortedFlights[0].flight.departureAirport.airportCode?.toUpperCase();
                                            const primaryArrivalCode = sortedFlights[0].flight.arrivalAirport.airportCode?.toUpperCase();

                                            const departureFlights = sortedFlights.filter((bf) => {
                                                const depCode = bf.flight.departureAirport.airportCode?.toUpperCase();
                                                const arrCode = bf.flight.arrivalAirport.airportCode?.toUpperCase();
                                                return depCode === primaryDepartureCode && arrCode === primaryArrivalCode;
                                            });

                                            const returnFlights = sortedFlights.filter((bf) => {
                                                const depCode = bf.flight.departureAirport.airportCode?.toUpperCase();
                                                const arrCode = bf.flight.arrivalAirport.airportCode?.toUpperCase();
                                                return depCode === primaryArrivalCode && arrCode === primaryDepartureCode;
                                            });

                                            const remainingFlights = sortedFlights.filter(
                                                (bf) => !departureFlights.includes(bf) && !returnFlights.includes(bf)
                                            );

                                            remainingFlights.forEach((bf) => {
                                                const depCode = bf.flight.departureAirport.airportCode?.toUpperCase();
                                                const arrCode = bf.flight.arrivalAirport.airportCode?.toUpperCase();

                                                if (depCode === primaryDepartureCode) {
                                                    departureFlights.push(bf);
                                                } else if (depCode === primaryArrivalCode) {
                                                    returnFlights.push(bf);
                                                } else if (arrCode === primaryArrivalCode) {
                                                    departureFlights.push(bf);
                                                } else if (arrCode === primaryDepartureCode) {
                                                    returnFlights.push(bf);
                                                } else {
                                                    departureFlights.push(bf);
                                                }
                                            });

                                            const renderFlightCard = (bookingFlight: BookingFlight, isReturnFlight: boolean) => {
                                                const flight = bookingFlight.flight;

                                                return (
                                                    <div
                                                        key={bookingFlight.bookingFlightId}
                                                        className={`p-5 rounded-lg border-2 ${isReturnFlight ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-300'}`}
                                                    >
                                                        {/* Flight Header */}
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isReturnFlight ? 'bg-green-200' : 'bg-blue-200'}`}>
                                                                    <span className="text-2xl">{isReturnFlight ? '🛬' : '🛫'}</span>
                                                                </div>
                                                                <div>
                                                                    <h5 className="font-bold text-lg text-gray-900">
                                                                        {isReturnFlight ? 'Chuyến về' : 'Chuyến đi'}
                                                                    </h5>
                                                                    <p className="text-sm text-gray-600">
                                                                        Chuyến bay: {flight.flightNumber || 'N/A'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm font-semibold text-gray-700">
                                                                    {flight.departureTime ? formatDate(flight.departureTime) : 'N/A'}
                                                                </div>
                                                                <div className="text-sm text-gray-600">
                                                                    {flight.departureTime && flight.arrivalTime
                                                                        ? `${formatTime(flight.departureTime)} - ${formatTime(flight.arrivalTime)}`
                                                                        : 'N/A'}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Route Information */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                                    <span className="text-blue-600 font-bold text-xs">Từ</span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-gray-900">
                                                                        {flight.departureAirport.city || 'N/A'}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600">
                                                                        {flight.departureAirport.airportName || 'N/A'} ({flight.departureAirport.airportCode || 'N/A'})
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                                    <span className="text-green-600 font-bold text-xs">Đến</span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-gray-900">
                                                                        {flight.arrivalAirport.city || 'N/A'}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600">
                                                                        {flight.arrivalAirport.airportName || 'N/A'} ({flight.arrivalAirport.airportCode || 'N/A'})
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Passengers and Seats */}
                                                        {bookingFlight.seatAllocations && bookingFlight.seatAllocations.length > 0 && (
                                                            <div className="border-t border-gray-300 pt-4 mt-4">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <h6 className="font-semibold text-gray-700">
                                                                        Hành khách & Ghế ngồi
                                                                    </h6>
                                                                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                                                                        {getTravelClassText(bookingFlight.travelClass)}
                                                                    </span>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {bookingFlight.seatAllocations.map((allocation) => (
                                                                        allocation && allocation.passenger && (
                                                                            <div key={allocation.allocationId} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                                                                <div className="flex items-center justify-between">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                                                                                            <span className="text-purple-600 font-bold text-sm">
                                                                                                {allocation.passenger.passengerType === 'Adult' ? 'A' : allocation.passenger.passengerType === 'Child' ? 'C' : 'I'}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="font-semibold text-gray-900">
                                                                                                {allocation.passenger.firstName} {allocation.passenger.lastName}
                                                                                            </p>
                                                                                            <p className="text-sm text-gray-600">
                                                                                                {getPassengerTypeText(allocation.passenger.passengerType)}
                                                                                                {allocation.passenger.passportNumber && ` • Passport: ${allocation.passenger.passportNumber}`}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                    {((allocation.flightSeat && allocation.flightSeat.seat && allocation.flightSeat.seat.seatNumber) ||
                                                                                        (allocation.seat && allocation.seat.seatNumber)) && (
                                                                                            <div className="flex items-center gap-2">
                                                                                                <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-semibold">
                                                                                                    Ghế: {allocation.flightSeat?.seat?.seatNumber || allocation.seat?.seatNumber}
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            };

                                            return (
                                                <div className="space-y-6 mb-6">
                                                    {departureFlights.length > 0 && (
                                                        <div>
                                                            <h4 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
                                                                <span className="text-2xl"></span> Chuyến đi ({departureFlights.length})
                                                            </h4>
                                                            <div className="space-y-4">
                                                                {departureFlights.map((bf) => renderFlightCard(bf, false))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {returnFlights.length > 0 && (
                                                        <div>
                                                            <h4 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2">
                                                                <span className="text-2xl"></span> Chuyến về ({returnFlights.length})
                                                            </h4>
                                                            <div className="space-y-4">
                                                                {returnFlights.map((bf) => renderFlightCard(bf, true))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })();
                                    })()}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-5 border-t-2 border-gray-200">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                                            <p className="text-3xl font-bold text-green-600">{formatVnd(booking.totalAmount)}</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    console.log("🖱️ Button clicked for booking:", booking.bookingId);
                                                    toggleBookingDetails(booking.bookingId);
                                                }}
                                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                                            >
                                                {expandedBookings.has(booking.bookingId) ? (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                        Ẩn chi tiết
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                        Xem chi tiết
                                                    </>
                                                )}
                                            </button>
                                            {(booking.bookingStatus === 'Completed' || booking.bookingStatus === 'Confirmed') && (
                                                <Link
                                                    href={`/book-plane/payment/success?bookingId=${booking.bookingId}`}
                                                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                                                >
                                                    Xem hóa đơn
                                                </Link>
                                            )}
                                            {booking.bookingStatus === 'Reserved' && booking.paymentStatus !== 'Paid' && (
                                                <Link
                                                    href={`/book-plane/payment?bookingId=${booking.bookingId}`}
                                                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                                                >
                                                    Thanh toán ngay
                                                </Link>
                                            )}
                                            {booking.bookingStatus === 'Cancelled' && (
                                                <Link
                                                    href="/"
                                                    className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                                                >
                                                    Đặt lại
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {hasMore && (
                            <div className="text-center pt-4">
                                <button
                                    onClick={handleLoadMore}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Xem thêm
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MyBookingsPage;

