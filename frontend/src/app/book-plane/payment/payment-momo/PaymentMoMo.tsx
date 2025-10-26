"use client";

import { useState, useEffect } from 'react';
import { paymentsService } from '@/services/payments.service';

interface PaymentMoMoProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
    bookingId: string;
    totalAmount: number;
    orderInfo: string;
}

export default function PaymentMoMo({
    isOpen,
    onClose,
    onComplete,
    bookingId,
    totalAmount,
    orderInfo,
}: PaymentMoMoProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [payUrl, setPayUrl] = useState<string | null>(null);
    const [hasOpenedWindow, setHasOpenedWindow] = useState(false);

    useEffect(() => {
        // Reset khi modal đóng
        if (!isOpen) {
            setPayUrl(null);
            setError(null);
            setHasOpenedWindow(false);
            return;
        }

        // Chỉ tạo thanh toán một lần khi modal mở
        if (isOpen && bookingId && totalAmount > 0 && !payUrl && !loading && !hasOpenedWindow) {
            createMoMoPayment();
        }
    }, [isOpen]);

    const createMoMoPayment = async () => {
        setLoading(true);
        setError(null);

        try {
            // Thêm bookingId vào redirectUrl để success page có thể update status  
            const redirectUrl = `${window.location.origin}/book-plane/payment/success?bookingId=${bookingId}`;
            console.log('📍 Redirect URL with bookingId:', redirectUrl);
            const ipnUrl = `http://localhost:3001/payments/momo/callback`;

            console.log('Creating MoMo payment with data:', {
                amount: totalAmount,
                bookingId: bookingId,
                orderInfo: orderInfo,
                redirectUrl: redirectUrl,
            });

            const response = await paymentsService.createMoMoPayment({
                amount: totalAmount,
                bookingId: parseInt(bookingId),
                orderInfo: orderInfo,
                redirectUrl: redirectUrl,
                ipnUrl: ipnUrl,
            });

            console.log('MoMo payment response:', response);

            if (response && response.payUrl) {
                setPayUrl(response.payUrl);
                setHasOpenedWindow(true);
                // Tự động mở cửa sổ thanh toán CHỈ MỘT LẦN
                if (!hasOpenedWindow) {
                    window.open(response.payUrl, '_blank');
                    setHasOpenedWindow(true);
                }
            } else {
                setError('Không thể tạo liên kết thanh toán: ' + (response?.message || 'Không có response'));
            }
        } catch (err: any) {
            console.error('Error creating MoMo payment:', err);
            setError(err.message || err.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckPayment = async () => {
        // Xác nhận với user trước khi hoàn tất
        const confirmed = confirm(
            'Bạn có chắc chắn đã hoàn tất thanh toán trên MoMo chưa?\n\nNhấn OK để xác nhận đã thanh toán và hoàn tất đơn hàng.'
        );

        if (confirmed) {
            console.log('User confirmed payment completed');
            onComplete();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Thanh toán MoMo</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mb-4"></div>
                        <p className="text-gray-600 text-lg">Đang tạo liên kết thanh toán...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {payUrl && !loading && (
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <p className="text-green-800 font-medium text-center">
                                Cửa sổ thanh toán đã được mở
                            </p>
                            <p className="text-sm text-green-600 text-center mt-2">
                                Vui lòng hoàn tất thanh toán trong cửa sổ mới
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-gray-700">Thông tin giao dịch:</p>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Số tiền:</span>
                                    <span className="font-semibold text-gray-800">
                                        {new Intl.NumberFormat('vi-VN').format(totalAmount)} VND
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Mã đặt chỗ:</span>
                                    <span className="font-semibold text-gray-800">{bookingId}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => window.open(payUrl, '_blank')}
                                className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                            >
                                Mở lại cửa sổ thanh toán
                            </button>
                            <button
                                onClick={handleCheckPayment}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
                            >
                                Hoàn tất
                            </button>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-center text-sm text-yellow-800">
                                ⚠️ Sau khi thanh toán thành công trên MoMo, nhấn nút <strong>"Hoàn tất"</strong> để cập nhật trạng thái đơn hàng.
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
}

