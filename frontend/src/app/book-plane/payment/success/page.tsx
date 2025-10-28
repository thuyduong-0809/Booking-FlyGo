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

        console.log('🚀 Success page loaded with params:', { orderId, resultCode, amount, bookingId });

        // Nếu có query params từ MoMo redirect
        if (orderId && resultCode) {
            setPaymentData({
                orderId,
                resultCode: parseInt(resultCode),
                amount: amount ? parseInt(amount) : 0,
            });

            // Nếu thanh toán thành công (resultCode === '0')
            if (resultCode === '0') {
                console.log('✅ Payment successful from MoMo');

                if (bookingId) {
                    // Có bookingId trong URL → update trực tiếp
                    console.log('📌 bookingId from URL:', bookingId);
                    updatePaymentStatus(parseInt(bookingId));
                } else {
                    // Không có bookingId → lấy từ orderId
                    console.log('🔍 No bookingId in URL, getting from orderId:', orderId);
                    getBookingAndUpdateStatus(orderId);
                }
            } else {
                setLoading(false);
            }
        }
        // Nếu chỉ có bookingId → tự động update status
        else if (bookingId) {
            console.log('🔄 Auto-updating payment status for bookingId:', bookingId);
            updatePaymentStatusWhenBookingIdOnly(parseInt(bookingId));
        }
        else {
            setLoading(false);
        }
    }, [searchParams]);

    const getBookingAndUpdateStatus = async (orderId: string) => {
        try {
            console.log('🔍 Getting bookingId from orderId:', orderId);
            setLoading(true);

            // Lấy bookingId từ orderId
            const bookingId = await paymentsService.getBookingByOrderId(orderId);
            console.log('📌 Found bookingId:', bookingId);

            if (bookingId) {
                // Update status với bookingId này và redirect
                await updatePaymentStatus(bookingId);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('❌ Error getting booking and updating:', error);
            setLoading(false);
        }
    };

    const updatePaymentStatusWhenBookingIdOnly = async (bookingId: number) => {
        try {
            console.log('🔄 Auto-updating payment status for bookingId:', bookingId);
            setLoading(true);

            // Lấy payments theo bookingId
            const payments = await paymentsService.getPaymentsByBooking(bookingId);
            console.log('📋 Found payments:', payments);

            if (payments && payments.length > 0) {
                // Tìm payment đang pending
                const pendingPayment = payments.find(p => p.paymentStatus === 'Pending');
                console.log('⏳ Pending payment:', pendingPayment);

                if (pendingPayment && pendingPayment.paymentId) {
                    console.log(`✅ Updating payment ${pendingPayment.paymentId} to Completed`);

                    // Update status
                    const result = await paymentsService.updatePaymentStatus(
                        pendingPayment.paymentId,
                        'Completed'
                    );
                    console.log('✅ Payment status updated successfully:', result);

                    // Set payment data
                    setPaymentData({
                        orderId: result.paymentDetails?.momoOrderId || 'N/A',
                        resultCode: 0, // Success
                        amount: result.amount,
                    });
                } else {
                    // Không có pending payment, lấy latest
                    const latestPayment = payments[payments.length - 1];
                    console.log('ℹ️ No pending payment, using latest:', latestPayment);
                    setPaymentData({
                        orderId: latestPayment.paymentDetails?.momoOrderId || 'N/A',
                        resultCode: latestPayment.paymentStatus === 'Completed' ? 0 : -1,
                        amount: latestPayment.amount,
                    });
                }
            }

            setLoading(false);
        } catch (error) {
            console.error('❌ Error updating payment status:', error);
            setLoading(false);
        }
    };

    // Hàm tạo bookingFlights và seatAllocations
    const createBookingFlightsAndSeatAllocations = async (bookingId: number) => {
        try {
            console.log('🚀 Creating booking flights and seat allocations for bookingId:', bookingId);

            // 1. Lấy thông tin flight đã chọn từ localStorage
            const savedFlight = localStorage.getItem('selectedFlight');
            if (!savedFlight) {
                console.warn('⚠️ No saved flight data found');
                return;
            }

            const flightData = JSON.parse(savedFlight);
            console.log('✈️ Flight data from localStorage:', flightData);

            // Kiểm tra có flightId không
            if (!flightData.flightId) {
                console.error('❌ Missing flightId in flightData');
                return;
            }

            // 2. Lấy passengers từ booking
            const bookingResponse = await requestApi(`bookings/${bookingId}`, 'GET');
            if (!bookingResponse.success || !bookingResponse.data) {
                console.error('❌ Failed to get booking data');
                return;
            }

            // Chỉ tạo booking flights cho Người lớn và Trẻ em
            const passengers = (bookingResponse.data.passengers || []).filter(
                (p: any) => p.passengerType === 'Adult' || p.passengerType === 'Child'
            );
            console.log('👥 Passengers (Adult & Child only):', passengers);

            if (passengers.length === 0) {
                console.warn('⚠️ No passengers found for booking');
                return;
            }

            // 3. Kiểm tra travelClass - map từ fare name sang database enum
            let travelClass: 'Economy' | 'Business' | 'First' = 'Economy';
            const travelClassName = flightData.travelClass?.toUpperCase();
            if (travelClassName === 'FIRST CLASS' || travelClassName === 'FIST CLASS') {
                travelClass = 'First';
            } else if (travelClassName === 'BUSSINESS' || travelClassName === 'BUSINESS') {
                travelClass = 'Business';
            } else {
                travelClass = 'Economy';
            }
            // 4. Tạo bookingFlight cho mỗi passenger
            for (let i = 0; i < passengers.length; i++) {
                const passenger = passengers[i];

                try {

                    // Tạo bookingFlight với passengerId để backend tự động tạo seatAllocation
                    // Backend sẽ tự động chọn ghế trống đầu tiên (01A, 02A, 03A...)
                    const bookingFlightData = {
                        bookingId: bookingId,
                        flightId: Number(flightData.flightId), // Đảm bảo là number
                        travelClass: travelClass,
                        baggageAllowance: 0,
                        // KHÔNG truyền seatNumber - để backend tự động chọn ghế từ 01A
                        // passengerId để backend tự động tạo seatAllocation
                        passengerId: passenger.passengerId
                    };

                    console.log('📝 Creating booking flight with data:', bookingFlightData);
                    const bookingFlightResult = await bookingFlightsService.create(bookingFlightData);
                    console.log('✅ Booking flight created:', bookingFlightResult);

                    if (bookingFlightResult?.seatNumber) {
                        console.log(`🎫 Ghế được gán: ${bookingFlightResult.seatNumber}`);
                    }

                    // Backend đã tự động:
                    // 1. Tìm ghế trống đầu tiên (order by seatNumber ASC)
                    // 2. Đánh dấu ghế đã được đặt (isAvailable = false)
                    // 3. Set seatNumber vào bookingFlight
                    // 4. Tạo seatAllocation

                } catch (error) {
                    console.error(`❌ Error creating booking flight for passenger ${passenger.passengerId}:`, error);
                    // Tiếp tục với passenger tiếp theo
                }
            }

            console.log(`\n✅ Đã xử lý xong ${passengers.length} passengers`);

            // 5. Xóa flight data khỏi localStorage sau khi đã sử dụng
            localStorage.removeItem('selectedFlight');

            console.log('✅ All booking flights and seat allocations created successfully');
        } catch (error) {
            console.error('❌ Error creating booking flights:', error);
        }
    };

    const updatePaymentStatus = async (bookingId: number) => {
        try {
            console.log('🔄 Updating payment status for bookingId:', bookingId);

            // Lấy payments theo bookingId
            const payments = await paymentsService.getPaymentsByBooking(bookingId);
            console.log('📋 Found payments:', payments);

            if (payments && payments.length > 0) {
                // Tìm payment đang pending (thanh toán vừa thành công)
                const pendingPayment = payments.find(p => p.paymentStatus === 'Pending');
                console.log('⏳ Pending payment:', pendingPayment);

                if (pendingPayment && pendingPayment.paymentId) {
                    console.log(`✅ Updating payment ${pendingPayment.paymentId} to Completed`);

                    // Cập nhật status thành Completed
                    const result = await paymentsService.updatePaymentStatus(
                        pendingPayment.paymentId,
                        'Completed'
                    );
                    console.log('✅ Payment status updated successfully:', result);

                    // Tạo bookingFlights và seatAllocations
                    await createBookingFlightsAndSeatAllocations(bookingId);

                    // Redirect to confirm page after successful update
                    window.location.href = `/confirm?bookingId=${bookingId}`;
                    return;
                } else {
                    console.warn('⚠️ No pending payment found or paymentId is missing');
                }
            } else {
                console.warn('⚠️ No payments found for bookingId:', bookingId);
            }
            setLoading(false);
        } catch (error) {
            console.error('❌ Error updating payment status:', error);
            setLoading(false);
        }
    };

    // const fetchPaymentInfo = async (bookingId: number) => {
    //     try {
    //         console.log('🔍 Fetching payment info for bookingId:', bookingId);

    //         const payments = await paymentsService.getPaymentsByBooking(bookingId);
    //         console.log('📋 All payments:', payments);

    //         if (payments && payments.length > 0) {
    //             const latestPayment = payments[payments.length - 1];
    //             console.log('📝 Latest payment:', latestPayment);

    //             // Nếu payment đang là Pending → Cập nhật thành Completed
    //             if (latestPayment.paymentStatus === 'Pending' && latestPayment.paymentId) {
    //                 console.log('⏳ Found pending payment, auto-updating to Completed...');
    //                 console.log('🔄 PaymentId to update:', latestPayment.paymentId);

    //                 try {
    //                     const updateResult = await paymentsService.updatePaymentStatus(
    //                         latestPayment.paymentId,
    //                         'Completed'
    //                     );
    //                     console.log('✅ Payment status updated successfully:', updateResult);

    //                     // Đợi một chút rồi fetch lại
    //                     await new Promise(resolve => setTimeout(resolve, 500));

    //                     // Cập nhật lại payment để có status mới
    //                     const updatedPayments = await paymentsService.getPaymentsByBooking(bookingId);
    //                     const updatedPayment = updatedPayments.find(p => p.paymentId === latestPayment.paymentId);
    //                     console.log('✅ Updated payment:', updatedPayment);

    //                     setPaymentData({
    //                         orderId: updatedPayment?.paymentDetails?.momoOrderId || 'N/A',
    //                         resultCode: 0, // Success
    //                         amount: updatedPayment?.amount || latestPayment.amount,
    //                     });
    //                 } catch (updateError) {
    //                     console.error('❌ Error updating payment status:', updateError);
    //                     // Vẫn hiển thị thông tin payment dù update fail
    //                     setPaymentData({
    //                         orderId: latestPayment.paymentDetails?.momoOrderId || 'N/A',
    //                         resultCode: 0,
    //                         amount: latestPayment.amount,
    //                     });
    //                 }
    //             } else {
    //                 console.log('ℹ️ Payment already has status:', latestPayment.paymentStatus);
    //                 // Payment đã Completed hoặc Failed
    //                 setPaymentData({
    //                     orderId: latestPayment.paymentDetails?.momoOrderId || 'N/A',
    //                     resultCode: latestPayment.paymentStatus === 'Completed' ? 0 : -1,
    //                     amount: latestPayment.amount,
    //                 });
    //             }
    //         } else {
    //             console.warn('⚠️ No payments found');
    //         }
    //         setLoading(false);
    //     } catch (error) {
    //         console.error('❌ Error fetching payment info:', error);
    //         setLoading(false);
    //     }
    // };

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

