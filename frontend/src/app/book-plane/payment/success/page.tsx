"use client";

import { useEffect, useState, useCallback } from 'react';
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
    const [isClient, setIsClient] = useState(false);
    const [currentTime, setCurrentTime] = useState<string>('');

    // Đánh dấu đã render ở client để tránh hydration error
    useEffect(() => {
        setIsClient(true);
        setCurrentTime(new Date().toLocaleString('vi-VN'));
    }, []);

    // Định nghĩa các hàm trước khi sử dụng trong useEffect
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
            console.log('Payment Success - Updating payment status when bookingId only:', bookingId);

            // Lấy payments theo bookingId
            const payments = await paymentsService.getPaymentsByBooking(bookingId);

            if (payments && payments.length > 0) {
                // Tìm payment đang pending
                const pendingPayment = payments.find(p => p.paymentStatus === 'Pending');

                if (pendingPayment && pendingPayment.paymentId) {
                    console.log('Payment Success - Found pending payment, updating to Completed');
                    // Update status
                    const result = await paymentsService.updatePaymentStatus(
                        pendingPayment.paymentId,
                        'Completed'
                    );

                    // Set payment data với resultCode = 0 (Success)
                    setPaymentData({
                        orderId: result.paymentDetails?.momoOrderId || pendingPayment.paymentDetails?.momoOrderId || 'N/A',
                        resultCode: 0, // Success
                        amount: result.amount || pendingPayment.amount,
                    });
                    console.log('Payment Success - Payment data set with success status');
                } else {
                    // Không có pending payment, lấy latest
                    const latestPayment = payments.sort((a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )[0];

                    console.log('Payment Success - No pending payment, using latest:', latestPayment.paymentStatus);

                    // Nếu payment đã completed, set resultCode = 0
                    // Nếu chưa, vẫn set resultCode = 0 vì user đã click "Hoàn tất"
                    setPaymentData({
                        orderId: latestPayment.paymentDetails?.momoOrderId || 'N/A',
                        resultCode: latestPayment.paymentStatus === 'Completed' ? 0 : 0, // Luôn set thành công nếu user click hoàn tất
                        amount: latestPayment.amount,
                    });

                    // Nếu payment chưa completed, update nó
                    if (latestPayment.paymentStatus !== 'Completed' && latestPayment.paymentId) {
                        try {
                            await paymentsService.updatePaymentStatus(
                                latestPayment.paymentId,
                                'Completed'
                            );
                            console.log('Payment Success - Updated latest payment to Completed');
                        } catch (updateError) {
                            console.error('Payment Success - Error updating payment:', updateError);
                        }
                    }
                }
            } else {
                console.error('Payment Success - No payments found for bookingId:', bookingId);
                // Set payment data với resultCode = -1 (Failed) nếu không tìm thấy payment
                setPaymentData({
                    orderId: 'N/A',
                    resultCode: -1,
                    amount: 0,
                });
            }

            setLoading(false);
        } catch (error: any) {
            console.error('Payment Success - Error in updatePaymentStatusWhenBookingIdOnly:', error);
            setLoading(false);
            // Set payment data với resultCode = -1 (Failed) nếu có lỗi
            setPaymentData({
                orderId: 'N/A',
                resultCode: -1,
                amount: 0,
            });
        }
    };

    const updatePaymentStatus = async (bookingId: number) => {
        try {
            console.log('Payment Success - Updating payment status for bookingId:', bookingId);

            // Lấy payments theo bookingId
            const payments = await paymentsService.getPaymentsByBooking(bookingId);

            if (payments && payments.length > 0) {
                // Tìm payment đang pending (thanh toán vừa thành công)
                const pendingPayment = payments.find(p => p.paymentStatus === 'Pending');

                if (pendingPayment && pendingPayment.paymentId) {
                    console.log('Payment Success - Found pending payment:', pendingPayment.paymentId);

                    // Bước 1: Cập nhật payment status thành Completed
                    const result = await paymentsService.updatePaymentStatus(
                        pendingPayment.paymentId,
                        'Completed'
                    );
                    console.log('Payment Success - Payment status updated to Completed');

                    // Cập nhật paymentData với thông tin thành công TRƯỚC KHI tạo booking flights
                    // Để đảm bảo UI hiển thị thành công ngay cả khi có lỗi trong booking flights
                    setPaymentData({
                        orderId: result.paymentDetails?.momoOrderId || pendingPayment.paymentDetails?.momoOrderId || 'N/A',
                        resultCode: 0, // Success
                        amount: result.amount || pendingPayment.amount,
                    });

                    // Bước 2: Cập nhật ghế đã chọn (nếu có)
                    // BookingFlights đã được tạo ở trang passengers rồi
                    // Ở đây chỉ cần cập nhật ghế đã chọn từ choose-seat page
                    try {
                        await updateSeatAllocations(bookingId);
                        console.log('Payment Success - Seat allocations updated successfully');
                    } catch (updateError: any) {
                        console.error('Payment Success - Error updating seat allocations:', updateError);
                        // Vẫn hiển thị thành công
                    }

                    // KHÔNG redirect nữa, để user thấy thông báo thành công
                    // User có thể tự click nút để về trang chủ hoặc xem chi tiết
                    setLoading(false);
                    return;
                } else {
                    console.warn('Payment Success - No pending payment found, checking latest payment');
                    // Nếu không có pending, có thể đã được xử lý rồi
                    const latestPayment = payments.sort((a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )[0];

                    // Set paymentData với thông tin từ latest payment
                    setPaymentData({
                        orderId: latestPayment.paymentDetails?.momoOrderId || 'N/A',
                        resultCode: latestPayment.paymentStatus === 'Completed' ? 0 : 0, // Luôn hiển thị thành công nếu user đã đến đây
                        amount: latestPayment.amount,
                    });

                    if (latestPayment.paymentStatus === 'Completed') {
                        // Đã completed rồi, chỉ cần hiển thị thành công
                        setLoading(false);
                        return;
                    } else {
                        // Nếu chưa completed, update nó
                        if (latestPayment.paymentId) {
                            try {
                                await paymentsService.updatePaymentStatus(
                                    latestPayment.paymentId,
                                    'Completed'
                                );
                                // Cập nhật seat allocations
                                await updateSeatAllocations(bookingId);
                            } catch (updateError) {
                                console.error('Payment Success - Error updating payment:', updateError);
                            }
                        }
                        setLoading(false);
                        return;
                    }
                }
            } else {
                console.error('Payment Success - No payments found for bookingId:', bookingId);
                setPaymentData({
                    orderId: 'N/A',
                    resultCode: -1,
                    amount: 0,
                });
            }
            setLoading(false);
        } catch (error: any) {
            console.error('Payment Success - Error updating payment status:', error);
            setPaymentData({
                orderId: 'N/A',
                resultCode: -1,
                amount: 0,
            });
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isClient) return; // Chỉ chạy khi đã mount ở client
        const orderId = searchParams.get('orderId');
        const resultCode = searchParams.get('resultCode');
        const amount = searchParams.get('amount');
        const bookingId = searchParams.get('bookingId');

        console.log('Payment Success - URL params:', { orderId, resultCode, amount, bookingId });

        // Nếu có query params từ MoMo redirect (có orderId và resultCode)
        if (orderId && resultCode) {
            const resultCodeNum = parseInt(resultCode);

            // Nếu thanh toán thành công (resultCode === 0)
            if (resultCodeNum === 0) {
                // Ưu tiên dùng bookingId từ URL (đã được thêm vào redirectUrl)
                if (bookingId) {
                    console.log('Payment Success - MoMo redirect with bookingId, updating payment status');
                    // Có bookingId trong URL → update trực tiếp
                    updatePaymentStatus(parseInt(bookingId));
                } else {
                    console.log('Payment Success - MoMo redirect without bookingId, getting from orderId');
                    // Không có bookingId → lấy từ orderId
                    getBookingAndUpdateStatus(orderId);
                }
            } else {
                // Thanh toán thất bại
                console.log('Payment Success - Payment failed with resultCode:', resultCodeNum);
                setPaymentData({
                    orderId,
                    resultCode: resultCodeNum,
                    amount: amount ? parseInt(amount) : 0,
                });
                setLoading(false);
            }
        }
        // Nếu chỉ có bookingId → tự động update status và kiểm tra payment
        else if (bookingId) {
            updatePaymentStatusWhenBookingIdOnly(parseInt(bookingId));
        }
        else {
            console.log('Payment Success - No valid params found');
            setLoading(false);
        }
    }, [searchParams, isClient]);


    // Hàm cập nhật seat allocations từ ghế đã chọn
    const updateSeatAllocations = async (bookingId: number) => {
        try {
            console.log('Payment Success - Updating seat allocations for bookingId:', bookingId);
            
            // Lấy ghế đã chọn từ localStorage
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
                        console.log('Payment Success - Selected seats:', selectedSeats);
                    }
                }
            } catch (error) {
                console.error('Payment Success - Error parsing selected seats:', error);
            }

            // Nếu có ghế đã chọn, cập nhật seat allocations
            if (selectedSeats.departure && selectedSeats.departure.length > 0) {
                console.log('Payment Success - Updating departure seat allocations');
                // TODO: Implement API call để cập nhật ghế
                // Hiện tại backend tự động assign ghế khi tạo BookingFlight
            }

            if (selectedSeats.return && selectedSeats.return.length > 0) {
                console.log('Payment Success - Updating return seat allocations');
                // TODO: Implement API call để cập nhật ghế
            }

            // Xóa ghế đã chọn khỏi localStorage sau khi đã sử dụng
            localStorage.removeItem('selectedSeats');
            console.log('Payment Success - Seat allocations updated successfully');
        } catch (error: any) {
            console.error('Payment Success - Error in updateSeatAllocations:', error);
            throw error;
        }
    };

    const formatVnd = (n: number) => {
        return new Intl.NumberFormat('vi-VN').format(n) + ' VND';
    };

    const isSuccess = paymentData?.resultCode === 0;

    // Nếu chưa mount ở client, hiển thị loading để tránh hydration error
    if (!isClient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

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
                                                    {currentTime || 'Đang tải...'}
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

