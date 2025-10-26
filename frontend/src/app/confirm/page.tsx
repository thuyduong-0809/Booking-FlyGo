"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { paymentsService } from '@/services/payments.service';

export default function ConfirmPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [paymentData, setPaymentData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const bookingId = searchParams.get('bookingId');

        console.log('🚀 Confirm page loaded with bookingId:', bookingId);

        if (bookingId) {
            fetchPaymentInfo(parseInt(bookingId));
        } else {
            setLoading(false);
        }
    }, [searchParams]);

    const fetchPaymentInfo = async (bookingId: number) => {
        try {
            console.log('🔍 Fetching payment info for bookingId:', bookingId);
            setLoading(true);

            const payments = await paymentsService.getPaymentsByBooking(bookingId);
            console.log('📋 All payments:', payments);

            if (payments && payments.length > 0) {
                const latestPayment = payments.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )[0];

                console.log('📝 Latest payment:', latestPayment);

                setPaymentData({
                    orderId: latestPayment.paymentDetails?.momoOrderId || 'N/A',
                    resultCode: latestPayment.paymentStatus === 'Completed' ? 0 : -1,
                    amount: latestPayment.amount,
                    bookingId: bookingId,
                    paymentStatus: latestPayment.paymentStatus,
                });
            }

            setLoading(false);
        } catch (error) {
            console.error('❌ Error fetching payment info:', error);
            setLoading(false);
        }
    };

    const formatVnd = (n: number) => {
        return new Intl.NumberFormat('vi-VN').format(n) + ' VND';
    };

    const isSuccess = paymentData?.paymentStatus === 'Completed';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto">
                    {loading ? (
                        <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tải thông tin xác nhận...</p>
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
                                            Đặt chỗ thành công!
                                        </h1>
                                        <p className="text-gray-600">
                                            Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn
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
                                            Chúng tôi đã gửi email xác nhận chi tiết về đơn đặt vé của bạn (bao gồm mã đặt chỗ, thông tin chuyến bay và voucher).
                                            Vui lòng kiểm tra hộp thư đến (kể cả thư mục spam).
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Link
                                            href="/"
                                            className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 text-center transform hover:scale-105"
                                        >
                                            Về trang chủ
                                        </Link>
                                        <Link
                                            href="/my-bookings"
                                            className="block w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-4 px-6 rounded-xl transition-all duration-200 text-center"
                                        >
                                            Xem đơn đặt của tôi
                                        </Link>
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
                                            Thanh toán chưa hoàn tất
                                        </h1>
                                        <p className="text-gray-600">
                                            Vui lòng hoàn tất thanh toán để xác nhận đặt chỗ
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Link
                                            href="/book-plane/payment"
                                            className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 text-center transform hover:scale-105"
                                        >
                                            Quay lại thanh toán
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

