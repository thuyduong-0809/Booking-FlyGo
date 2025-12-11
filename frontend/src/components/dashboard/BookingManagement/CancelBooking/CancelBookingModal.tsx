'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { requestApi } from '@/lib/api';
import { useNotification } from '@/components/Notification';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface BookingInfo {
    bookingId: string;
    bookingReference: string;
    totalAmount: number;
    paymentStatus: string;
    bookingStatus?: string;
    status?: string;
    departureTime?: string;
    bookingFlights?: Array<{
        travelClass?: string;
        flight?: {
            flightNumber: string;
            departureTime: string;
            arrivalTime: string;
            departureAirport?: {
                airportCode: string;
                city: string;
            };
            arrivalAirport?: {
                airportCode: string;
                city: string;
            };
        };
        seat?: {
            seatNumber: string;
        };
    }>;
    flight?: {
        departureTime: string;
    };
}

interface CancelBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CancelBookingModal({ isOpen, onClose, onSuccess }: CancelBookingModalProps) {
    const { showNotification, showConfirmModal } = useNotification();
    const [bookingCode, setBookingCode] = useState('');
    const [passengerName, setPassengerName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [cancellationFee, setCancellationFee] = useState(0);
    const [refundAmount, setRefundAmount] = useState(0);

    const validateCancellation = (booking: BookingInfo) => {
        const now = new Date();
        const departureTime = new Date(booking.bookingFlights?.[0]?.flight?.departureTime || booking.departureTime || '');
        const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        const bookingStatus = (booking.bookingStatus || booking.status)?.toLowerCase();
        const paymentStatus = booking.paymentStatus?.toLowerCase();

        if (bookingStatus === 'cancelled') {
            return {
                canCancel: false,
                requiresRefund: false,
                fee: 0,
                refund: 0,
                reason: 'Booking này đã được hủy trước đó.',
            };
        }

        if (hoursUntilDeparture < 3) {
            return {
                canCancel: false,
                requiresRefund: false,
                fee: 0,
                refund: 0,
                reason: 'Không thể hủy vé trong vòng 3 giờ trước giờ khởi hành.',
            };
        }

        const fareClass = booking.bookingFlights?.[0]?.travelClass?.toLowerCase() || 'economy';
        const totalAmount = booking.totalAmount || 0;

        let feePercentage = 0;
        if (fareClass === 'business' || fareClass === 'first') {
            if (hoursUntilDeparture >= 24) feePercentage = 0;
            else if (hoursUntilDeparture >= 12) feePercentage = 0.1;
            else feePercentage = 0.2;
        } else {
            if (hoursUntilDeparture >= 24) feePercentage = 0.1;
            else if (hoursUntilDeparture >= 12) feePercentage = 0.2;
            else feePercentage = 0.3;
        }

        const fee = totalAmount * feePercentage;
        const refund = Math.max(0, totalAmount - fee);

        return {
            canCancel: true,
            requiresRefund: paymentStatus === 'paid',
            fee: Math.round(fee),
            refund: Math.round(refund),
            reason: `Phí hủy: ${Math.round(fee).toLocaleString('vi-VN')}đ (${(feePercentage * 100).toFixed(0)}%). Số tiền hoàn lại: ${Math.round(refund).toLocaleString('vi-VN')}đ`,
        };
    };

    const handleSearchBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setBookingInfo(null);
        setShowConfirmation(false);

        try {
            const code = bookingCode.trim().toUpperCase();
            const name = passengerName.trim().toLowerCase();
            const emailValue = email.trim().toLowerCase();

            if (!code && !name) {
                showNotification('error', 'Vui lòng nhập ít nhất mã đặt chỗ hoặc tên hành khách');
                return;
            }

            if (code && !emailValue) {
                showNotification('error', 'Vui lòng nhập email khi tìm theo mã đặt chỗ');
                return;
            }

            const res = await requestApi('bookings/lookup', 'POST', {
                bookingReference: code || undefined,
                passengerName: name || undefined,
                email: emailValue || undefined,
            });

            if (!res || !res.data) {
                showNotification('error', 'Không tìm thấy booking với thông tin đã nhập');
                return;
            }

            const booking = res.data;
            const validation = validateCancellation(booking);

            if (!validation.canCancel) {
                showNotification('error', validation.reason);
                return;
            }

            setBookingInfo(booking);
            setCancellationFee(validation.fee);
            setRefundAmount(validation.refund);
            setShowConfirmation(true);
            showNotification('success', 'Tìm thấy booking! Vui lòng chọn lý do hủy vé.');
        } catch (error: any) {
            showNotification('error', error.message || 'Có lỗi xảy ra khi tìm kiếm booking');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmCancel = () => {
        if (!selectedReason || (selectedReason === 'other' && !customReason.trim())) {
            showNotification('error', 'Vui lòng chọn lý do hủy vé');
            return;
        }

        const reason = selectedReason === 'other' ? customReason : selectedReason;

        showConfirmModal({
            title: 'Xác nhận hủy vé',
            message: `Bạn có chắc chắn muốn hủy vé ${bookingInfo?.bookingReference}?\n\nPhí hủy: ${cancellationFee.toLocaleString('vi-VN')}đ\nSố tiền hoàn lại: ${refundAmount.toLocaleString('vi-VN')}đ\n\nThao tác này không thể hoàn tác.`,
            confirmText: 'Xác nhận hủy',
            cancelText: 'Quay lại',
            confirmButtonColor: 'red',
            onConfirm: () => processCancellation(reason),
        });
    };

    const processCancellation = async (reason: string) => {
        if (!bookingInfo) return;

        setLoading(true);
        try {
            const res = await requestApi(`bookings/${bookingInfo.bookingId}/cancel`, 'POST', {
                reason,
                cancellationFee,
                refundAmount,
            });

            if (res && res.success) {
                showNotification('success', 'Hủy vé thành công!');
                handleClose();
                if (onSuccess) onSuccess();
            } else {
                showNotification('error', res?.message || 'Có lỗi xảy ra khi hủy vé');
            }
        } catch (error: any) {
            showNotification('error', error.message || 'Có lỗi xảy ra khi hủy vé');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setBookingCode('');
        setPassengerName('');
        setEmail('');
        setSelectedReason('');
        setCustomReason('');
        setBookingInfo(null);
        setShowConfirmation(false);
        setCancellationFee(0);
        setRefundAmount(0);
        onClose();
    };

    // Handle mounting for Portal
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    // Use Portal to render outside of the current component tree
    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative z-[100000]">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-gray-900">Hủy đặt chỗ</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {!showConfirmation ? (
                        /* Search Form */
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tìm kiếm đặt chỗ</h3>
                            <form onSubmit={handleSearchBooking} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mã đặt chỗ
                                        </label>
                                        <div className="relative">
                                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={bookingCode}
                                                onChange={(e) => setBookingCode(e.target.value)}
                                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black uppercase"
                                                placeholder="VD: BK1A2B3C4D"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Họ tên hành khách
                                        </label>
                                        <input
                                            type="text"
                                            value={passengerName}
                                            onChange={(e) => setPassengerName(e.target.value)}
                                            className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                                            placeholder="Nguyễn Văn A"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                                            placeholder="email@example.com"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Bắt buộc khi tìm theo mã đặt chỗ</p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Đang kiểm tra...' : 'Kiểm tra điều kiện hủy vé'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* Confirmation View */
                        <div className="space-y-6">
                            {/* Booking Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Mã đặt chỗ</p>
                                        <p className="text-2xl font-bold text-gray-900">{bookingInfo?.bookingReference}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${bookingInfo?.paymentStatus === 'Paid'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {bookingInfo?.paymentStatus || 'Pending'}
                                    </span>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tổng tiền</span>
                                        <span className="text-xl font-bold text-gray-900">
                                            ₫{bookingInfo?.totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Cancellation Fee */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div className="text-base text-yellow-800">
                                        <p className="text-lg font-semibold mb-2">Chi phí hủy vé</p>
                                        <div className="space-y-1">
                                            <p>Phí hủy: <strong>{cancellationFee.toLocaleString('vi-VN')}đ</strong></p>
                                            <p>Số tiền hoàn lại: <strong className="text-green-700">{refundAmount.toLocaleString('vi-VN')}đ</strong></p>
                                            <p className="text-sm mt-2">Thời gian hoàn tiền: 3-5 ngày làm việc</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reason Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lý do hủy vé *
                                </label>
                                <select
                                    value={selectedReason}
                                    onChange={(e) => {
                                        setSelectedReason(e.target.value);
                                        if (e.target.value !== 'other') setCustomReason('');
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black mb-3"
                                    required
                                >
                                    <option value="">Chọn lý do hủy vé</option>
                                    <option value="Thay đổi kế hoạch cá nhân">Thay đổi kế hoạch cá nhân</option>
                                    <option value="Bận công việc đột xuất">Bận công việc đột xuất</option>
                                    <option value="Lý do sức khỏe">Lý do sức khỏe</option>
                                    <option value="Sự cố gia đình">Sự cố gia đình</option>
                                    <option value="Đặt nhầm thông tin chuyến bay">Đặt nhầm thông tin chuyến bay</option>
                                    <option value="other">Lý do khác</option>
                                </select>

                                {selectedReason === 'other' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Lý do cụ thể *
                                        </label>
                                        <textarea
                                            value={customReason}
                                            onChange={(e) => setCustomReason(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-black"
                                            rows={3}
                                            placeholder="Nhập lý do hủy vé của bạn..."
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    onClick={() => {
                                        setShowConfirmation(false);
                                        setBookingInfo(null);
                                        setSelectedReason('');
                                        setCustomReason('');
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Quay lại
                                </button>
                                <button
                                    onClick={handleConfirmCancel}
                                    disabled={loading || !selectedReason || (selectedReason === 'other' && !customReason.trim())}
                                    className="flex-1 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Đang xử lý...' : 'Xác nhận hủy vé'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
