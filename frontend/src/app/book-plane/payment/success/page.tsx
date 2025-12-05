"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { paymentsService } from '@/services/payments.service';
import { bookingFlightsService } from '@/services/booking-flights.service';
import { seatAllocationsService } from '@/services/seat-allocations.service';
import { requestApi } from '@/lib/api';

export default function PaymentSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [paymentData, setPaymentData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const orderId = searchParams.get('orderId');
        const resultCode = searchParams.get('resultCode');
        const amount = searchParams.get('amount');
        const bookingId = searchParams.get('bookingId');


        // Nếu có query params từ MoMo redirect
        if (orderId && resultCode) {
            setPaymentData({
                orderId,
                resultCode: parseInt(resultCode),
                amount: amount ? parseInt(amount) : 0,
            });

            // Nếu thanh toán thành công (resultCode === '0')
            if (resultCode === '0') {

                if (bookingId) {
                    // Có bookingId trong URL → update trực tiếp
                    updatePaymentStatus(parseInt(bookingId));
                } else {
                    // Không có bookingId → lấy từ orderId
                    getBookingAndUpdateStatus(orderId);
                }
            } else {
                setLoading(false);
            }
        }
        // Nếu chỉ có bookingId → tự động update status
        else if (bookingId) {
            updatePaymentStatusWhenBookingIdOnly(parseInt(bookingId));
        }
        else {
            setLoading(false);
        }
    }, [searchParams]);

    const getBookingAndUpdateStatus = async (orderId: string) => {
        try {
            setLoading(true);

            // Lấy bookingId từ orderId
            const bookingId = await paymentsService.getBookingByOrderId(orderId);

            if (bookingId) {
                // Update status với bookingId này và redirect
                await updatePaymentStatus(bookingId);
            } else {
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
        }
    };

    const updatePaymentStatusWhenBookingIdOnly = async (bookingId: number) => {
        try {
            setLoading(true);

            // Lấy payments theo bookingId
            const payments = await paymentsService.getPaymentsByBooking(bookingId);

            if (payments && payments.length > 0) {
                // Tìm payment đang pending
                const pendingPayment = payments.find(p => p.paymentStatus === 'Pending');

                if (pendingPayment && pendingPayment.paymentId) {
                    // Update status
                    const result = await paymentsService.updatePaymentStatus(
                        pendingPayment.paymentId,
                        'Completed'
                    );

                    // Set payment data
                    setPaymentData({
                        orderId: result.paymentDetails?.momoOrderId || 'N/A',
                        resultCode: 0, // Success
                        amount: result.amount,
                    });
                } else {
                    // Không có pending payment, lấy latest
                    const latestPayment = payments[payments.length - 1];
                    setPaymentData({
                        orderId: latestPayment.paymentDetails?.momoOrderId || 'N/A',
                        resultCode: latestPayment.paymentStatus === 'Completed' ? 0 : -1,
                        amount: latestPayment.amount,
                    });
                }
            }

            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    // Hàm tính baggageAllowance dựa trên travelClass
    // Theo yêu cầu: eco là 7kg, business là 14kg, firstclass là 16kg
    const getBaggageAllowance = (travelClass: 'Economy' | 'Business' | 'First'): number => {
        switch (travelClass) {
            case 'First':
                return 16; // 16kg cho First Class (theo yêu cầu)
            case 'Business':
                return 14; // 14kg cho Business
            case 'Economy':
                return 7; // 7kg cho Economy
            default:
                return 7; // Mặc định 7kg
        }
    };

    // Hàm map travelClass từ fare name sang database enum
    const mapTravelClass = (travelClassName: string): 'Economy' | 'Business' | 'First' => {
        const className = travelClassName?.toUpperCase();
        if (className === 'FIRST CLASS' || className === 'FIST CLASS') {
            return 'First';
        } else if (className === 'BUSSINESS' || className === 'BUSINESS') {
            return 'Business';
        } else {
            return 'Economy';
        }
    };

    // Hàm tạo bookingFlights và seatAllocations
    const createBookingFlightsAndSeatAllocations = async (bookingId: number) => {
        try {
            // 1. Lấy thông tin flight đã chọn từ localStorage (đi/ về)
            const savedDeparture = localStorage.getItem('selectedDepartureFlight') || localStorage.getItem('selectedFlight');
            const savedReturn = localStorage.getItem('selectedReturnFlight');

            if (!savedDeparture) {
                return;
            }

            const depFlight = savedDeparture ? JSON.parse(savedDeparture) : null;
            const retFlight = savedReturn ? JSON.parse(savedReturn) : null;

            // Kiểm tra có flightId không
            if (!depFlight.flightId) {
                return;
            }

            // 2. Lấy passengers từ booking
            const bookingResponse = await requestApi(`bookings/${bookingId}`, 'GET');
            if (!bookingResponse.success || !bookingResponse.data) {
                return;
            }

            // Chỉ tạo booking flights cho Người lớn và Trẻ em
            const passengers = (bookingResponse.data.passengers || []).filter(
                (p: any) => p.passengerType === 'Adult' || p.passengerType === 'Child'
            );

            if (passengers.length === 0) {
                return;
            }

            // 3. Kiểm tra travelClass cho chuyến đi - map từ fare name sang database enum
            const departureTravelClass = mapTravelClass(depFlight.travelClass || '');
            const departureBaggageAllowance = getBaggageAllowance(departureTravelClass);
            // 4. Lấy ghế đã chọn từ localStorage (nếu có)
            let selectedSeats: { departure?: Array<{ seatNumber: string; flightId: number }>, return?: Array<{ seatNumber: string; flightId: number }> } = {};
            try {
                const savedSeats = localStorage.getItem('selectedSeats');
                if (savedSeats) {
                    const parsedSeats = JSON.parse(savedSeats);
                    if (parsedSeats && typeof parsedSeats === 'object') {
                        selectedSeats = {
                            departure: parsedSeats.departure || [],
                            return: parsedSeats.return || []
                        };
                    }
                }
            } catch (error) {
            }


            // 4a. Tạo bookingFlight cho mỗi passenger cho chuyến đi
            const departureSeats = selectedSeats.departure || [];
            for (let i = 0; i < passengers.length; i++) {
                const passenger = passengers[i];

                try {
                    // Lấy ghế đã chọn cho passenger này (theo thứ tự)
                    // Nếu có ghế đã chọn và flightId khớp, sử dụng ghế đó
                    // Nếu không, để backend tự động chọn
                    let seatNumber: string | undefined = undefined;
                    if (departureSeats.length > i && departureSeats[i].flightId === Number(depFlight.flightId)) {
                        seatNumber = departureSeats[i].seatNumber;
                    } else {
                    }

                    // Tạo bookingFlight với passengerId để backend tự động tạo seatAllocation
                    // Nếu có seatNumber, backend sẽ sử dụng ghế đó (và kiểm tra available)
                    // Nếu không có seatNumber, backend sẽ tự động chọn ghế trống đầu tiên
                    const bookingFlightData = {
                        bookingId: bookingId,
                        flightId: Number(depFlight.flightId), // Đảm bảo là number
                        travelClass: departureTravelClass,
                        baggageAllowance: departureBaggageAllowance,
                        seatNumber: seatNumber, // Truyền ghế đã chọn (nếu có)
                        passengerId: passenger.passengerId
                    };

                    // GỌI API TẠO BOOKING FLIGHT
                    // Backend sẽ:
                    // - Nếu có seatNumber: Kiểm tra ghế đó có available không, nếu có thì sử dụng
                    // - Nếu không có seatNumber: Tự động chọn ghế trống đầu tiên
                    await bookingFlightsService.create(bookingFlightData);

                } catch (error) {
                    // Tiếp tục với passenger tiếp theo
                }
            }

            // 4b. Nếu có chuyến về → tạo tiếp bookingFlight cho chuyến về
            if (retFlight && retFlight.flightId) {
                // Kiểm tra travelClass cho chuyến về - map từ fare name sang database enum
                const returnTravelClass = mapTravelClass(retFlight.travelClass || depFlight.travelClass || '');
                const returnBaggageAllowance = getBaggageAllowance(returnTravelClass);

                const returnSeats = selectedSeats.return || [];
                for (let i = 0; i < passengers.length; i++) {
                    const passenger = passengers[i];
                    try {
                        // Lấy ghế đã chọn cho passenger này (theo thứ tự)
                        // Nếu có ghế đã chọn và flightId khớp, sử dụng ghế đó
                        // Nếu không, để backend tự động chọn
                        let seatNumber: string | undefined = undefined;
                        if (returnSeats.length > i && returnSeats[i].flightId === Number(retFlight.flightId)) {
                            seatNumber = returnSeats[i].seatNumber;
                        }

                        // Tạo bookingFlight cho chuyến về
                        // Nếu có seatNumber, backend sẽ sử dụng ghế đó
                        // Nếu không, backend sẽ tự động chọn ghế từ FlightSeats của chuyến về (độc lập với chuyến đi)
                        const bookingFlightData = {
                            bookingId: bookingId,
                            flightId: Number(retFlight.flightId),
                            travelClass: returnTravelClass,
                            baggageAllowance: returnBaggageAllowance,
                            seatNumber: seatNumber, // Truyền ghế đã chọn (nếu có)
                            passengerId: passenger.passengerId
                        };
                        // GỌI API TẠO BOOKING FLIGHT cho chuyến về
                        // Mỗi chuyến bay có FlightSeats riêng, không bị ảnh hưởng lẫn nhau
                        await bookingFlightsService.create(bookingFlightData);
                    } catch (error) {
                    }
                }
            }

            // 5. Xóa flight data và ghế đã chọn khỏi localStorage sau khi đã sử dụng
            localStorage.removeItem('selectedFlight');
            localStorage.removeItem('selectedDepartureFlight');
            localStorage.removeItem('selectedReturnFlight');
            localStorage.removeItem('selectedSeats'); // Xóa ghế đã chọn sau khi đã áp dụng

        } catch (error) {
        }
    };

    const updatePaymentStatus = async (bookingId: number) => {
        try {
            // Lấy payments theo bookingId
            const payments = await paymentsService.getPaymentsByBooking(bookingId);

            if (payments && payments.length > 0) {
                // Tìm payment đang pending (thanh toán vừa thành công)
                const pendingPayment = payments.find(p => p.paymentStatus === 'Pending');

                if (pendingPayment && pendingPayment.paymentId) {

                    // Bước 1: Cập nhật payment status thành Completed
                    const result = await paymentsService.updatePaymentStatus(
                        pendingPayment.paymentId,
                        'Completed'
                    );

                    // Bước 2: Tạo bookingFlights và seatAllocations
                    // QUAN TRỌNG: Chỉ tạo BookingFlight SAU KHI thanh toán thành công
                    // Backend sẽ:
                    // - Tìm FlightSeat available cho flight này
                    // - Tạo SeatAllocation (liên kết passenger với ghế)
                    // - Cập nhật FlightSeat.isAvailable = false (đánh dấu ghế đã được đặt)
                    // - Giảm availableSeats trong Flight
                    // Tất cả trong một transaction để đảm bảo atomicity
                    await createBookingFlightsAndSeatAllocations(bookingId);

                    // Redirect to confirm page after successful update
                    window.location.href = `/confirm?bookingId=${bookingId}`;
                    return;
                } else {
                }
            } else {
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    const formatVnd = (n: number) => {
        return new Intl.NumberFormat('vi-VN').format(n) + ' VND';
    };

    const isSuccess = paymentData?.resultCode === 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto">
                    {loading ? (
                        <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tải thông tin...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-8 shadow-xl">
                            {isSuccess ? (
                                <>
                                    <div className="text-center mb-8">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg
                                                className="w-12 h-12 text-green-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        </div>
                                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                            Thanh toán thành công!
                                        </h1>
                                        <p className="text-gray-600">
                                            Cảm ơn bạn đã sử dụng dịch vụ của FlyGo
                                        </p>
                                    </div>

                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                                            Thông tin giao dịch
                                        </h2>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Mã đơn hàng:</span>
                                                <span className="font-semibold text-gray-800">
                                                    {paymentData?.orderId}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Số tiền đã thanh toán:</span>
                                                <span className="font-bold text-green-600 text-xl">
                                                    {formatVnd(paymentData?.amount)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Trạng thái:</span>
                                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                                                    Hoàn tất
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Thời gian:</span>
                                                <span className="font-semibold text-gray-800">
                                                    {new Date().toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                                        <h3 className="text-lg font-bold text-blue-800 mb-3">
                                            📧 Email xác nhận
                                        </h3>
                                        <p className="text-gray-700">
                                            Chúng tôi đã gửi email xác nhận về đơn đặt vé của bạn. Vui lòng
                                            kiểm tra hộp thư đến (kể cả thư mục spam).
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Link
                                            href="/"
                                            className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 text-center transform hover:scale-105"
                                        >
                                            Về trang chủ
                                        </Link>
                                        <button
                                            onClick={() => window.print()}
                                            className="block w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-4 px-6 rounded-xl transition-all duration-200 text-center"
                                        >
                                            In hóa đơn
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-center mb-8">
                                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg
                                                className="w-12 h-12 text-red-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </div>
                                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                            Thanh toán thất bại
                                        </h1>
                                        <p className="text-gray-600">
                                            Giao dịch không thể hoàn tất
                                        </p>
                                    </div>

                                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                                            Thông tin giao dịch
                                        </h2>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Mã đơn hàng:</span>
                                                <span className="font-semibold text-gray-800">
                                                    {paymentData?.orderId}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Trạng thái:</span>
                                                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium">
                                                    Thất bại
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Link
                                            href="/book-plane/payment"
                                            className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 text-center transform hover:scale-105"
                                        >
                                            Thử lại thanh toán
                                        </Link>
                                        <Link
                                            href="/"
                                            className="block w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-4 px-6 rounded-xl transition-all duration-200 text-center"
                                        >
                                            Về trang chủ
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

