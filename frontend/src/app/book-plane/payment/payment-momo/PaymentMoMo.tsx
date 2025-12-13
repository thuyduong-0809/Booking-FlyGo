"use client";

import { useState, useEffect } from 'react';
import { paymentsService } from '@/services/payments.service';

interface PaymentMoMoProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: () => void; // Optional vì không cần nữa
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

    useEffect(() => {
        // Reset khi modal đóng
        if (!isOpen) {
            setError(null);
            setPayUrl(null);
            return;
        }

        // Tự động tạo thanh toán khi modal mở
        if (isOpen && bookingId && totalAmount > 0 && !loading) {
            createMoMoPayment();
        }
    }, [isOpen]);

    const createMoMoPayment = async () => {
        setLoading(true);
        setError(null);

        try {
            // Thêm bookingId vào redirectUrl để success page có thể update status  
            const redirectUrl = `${window.location.origin}/book-plane/payment/success?bookingId=${bookingId}`;
            const ipnUrl = `http://localhost:3001/payments/momo/callback`;

            const response = await paymentsService.createMoMoPayment({
                amount: totalAmount,
                bookingId: parseInt(bookingId),
                orderInfo: orderInfo,
                redirectUrl: redirectUrl,
                ipnUrl: ipnUrl,
            });

            if (response && response.payUrl) {
                setPayUrl(response.payUrl);
                // Redirect trực tiếp đến MoMo (đóng trang cũ)
                // MoMo sẽ tự động redirect về success page sau khi thanh toán
                window.location.href = response.payUrl;
            } else {
                setError('Không thể tạo liên kết thanh toán: ' + (response?.message || 'Không có response'));
                setLoading(false);
            }
        } catch (err: any) {
            setError(err.message || err.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán');
            setLoading(false);
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
                        <p className="text-sm text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
                    </div>
                )}

                {error && (
                    <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                            <p className="text-red-800 font-medium">{error}</p>
                        </div>
                        <button
                            onClick={createMoMoPayment}
                            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
                        >
                            Thử lại
                        </button>
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

