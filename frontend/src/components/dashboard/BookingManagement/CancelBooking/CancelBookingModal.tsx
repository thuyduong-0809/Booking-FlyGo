'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { requestApi } from '@/lib/api';
import { useNotification } from '@/components/Notification';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getCookie } from '@/utils/cookies';

interface BookingInfo {
    bookingId: string;
    bookingReference: string;
    totalAmount: number;
    paymentStatus: string;
    bookingStatus?: string;
    status?: string;
    departureTime?: string;
    bookingFlights?: Array<{
        bookingFlightId: number;
        seatNumber?: string;
        flightNumber?: string;
        travelClass?: string;
        fare?: number;
        baggageAllowance?: string;
        flight?: {
            flightId: number;
            flightNumber: string;
            departureTime: string;
            arrivalTime: string;
            status: string;
            departureAirport?: {
                airportCode: string;
                airportName: string;
                city: string;
            };
            arrivalAirport?: {
                airportCode: string;
                airportName: string;
                city: string;
            };
        };
        seatAllocations?: Array<{
            allocationId: number;
            flightSeat?: {
                flightSeatId: number;
                isAvailable: boolean;
                seat?: {
                    seatId: number;
                    seatNumber: string;
                    travelClass: string;
                };
            };
            passenger?: {
                passengerId: number;
                firstName: string;
                lastName: string;
                passengerType: string;
                dateOfBirth?: string;
            };
        }>;
    }>;
    passengers?: Array<{
        passengerId: number;
        firstName: string;
        lastName: string;
        passengerType: string;
        dateOfBirth?: string;
        passportNumber?: string;
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
    const [mounted, setMounted] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        fetchCurrentUser();
        return () => setMounted(false);
    }, []);

    // Lấy thông tin user đang đăng nhập
    const fetchCurrentUser = async () => {
        try {
            const token = getCookie("access_token");
            if (!token) return;

            const payload = JSON.parse(atob(token.split(".")[1]));
            const userId = payload.userId;

            if (!userId) return;

            const response = await requestApi(`users/${userId}`, "GET");
            if (response.success && response.data) {
                setCurrentUser(response.data);
            }
        } catch (error) {
            console.error("Error fetching current user:", error);
        }
    };

    const validateCancellation = (booking: BookingInfo) => {
        const now = new Date();
        const departureTime = new Date(booking.bookingFlights?.[0]?.flight?.departureTime || booking.departureTime || '');
        const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        const bookingStatus = (booking.bookingStatus || booking.status)?.toLowerCase();
        const paymentStatus = booking.paymentStatus?.toLowerCase();

        // Kiểm tra xem chuyến bay đã khởi hành chưa
        if (hoursUntilDeparture < 0) {
            return {
                canCancel: false,
                requiresRefund: false,
                fee: 0,
                refund: 0,
                reason: 'Chuyến bay đã khởi hành. Không thể hủy vé.',
            };
        }

        // Kiểm tra trạng thái booking
        if (bookingStatus === 'cancelled') {
            return {
                canCancel: false,
                requiresRefund: false,
                fee: 0,
                refund: 0,
                reason: 'Vé này đã được hủy trước đó.',
            };
        }

        if (paymentStatus === 'refunded') {
            return {
                canCancel: false,
                requiresRefund: false,
                fee: 0,
                refund: 0,
                reason: 'Vé này đã được hoàn tiền trước đó.',
            };
        }

        // Không cho hủy trong vòng 2 giờ trước giờ khởi hành
        if (hoursUntilDeparture < 2) {
            return {
                canCancel: false,
                requiresRefund: false,
                fee: 0,
                refund: 0,
                reason: 'Không thể hủy vé trong vòng 2 giờ trước giờ khởi hành.',
            };
        }

        // Nếu chưa thanh toán - cho hủy miễn phí
        if (paymentStatus !== 'paid') {
            return {
                canCancel: true,
                requiresRefund: false,
                fee: 0,
                refund: 0,
                reason: 'Đặt chỗ chưa thanh toán. Bạn có thể hủy mà không mất phí.'
            };
        }

        const totalAmount = booking.totalAmount || 0;
        const fareClass = booking.bookingFlights?.[0]?.travelClass?.toLowerCase() || 'economy';
        let feePercentage = 0;

        // Xác định hạng vé
        const isFirst = fareClass.includes('first');
        const isBusiness = fareClass.includes('business');
        const isEconomy = !isFirst && !isBusiness;

        // Tính phí hủy theo hạng vé và thời gian
        if (isFirst) {
            // First Class - Phí thấp nhất
            if (hoursUntilDeparture >= 168) { // >= 7 ngày
                feePercentage = 0; // Miễn phí
            } else if (hoursUntilDeparture >= 48) { // 2-7 ngày
                feePercentage = 0.10; // 10%
            } else if (hoursUntilDeparture >= 24) { // 1-2 ngày
                feePercentage = 0.15; // 15%
            } else { // < 24 giờ
                feePercentage = 0.20; // 20%
            }
        } else if (isBusiness) {
            // Business Class - Phí trung bình
            if (hoursUntilDeparture >= 168) { // >= 7 ngày
                feePercentage = 0.10; // 10%
            } else if (hoursUntilDeparture >= 48) { // 2-7 ngày
                feePercentage = 0.20; // 20%
            } else if (hoursUntilDeparture >= 24) { // 1-2 ngày
                feePercentage = 0.25; // 25%
            } else { // < 24 giờ
                feePercentage = 0.30; // 30%
            }
        } else {
            // Economy Class - Phí cao nhất
            if (hoursUntilDeparture >= 168) { // >= 7 ngày
                feePercentage = 0.30; // 30%
            } else if (hoursUntilDeparture >= 48) { // 2-7 ngày
                feePercentage = 0.40; // 40%
            } else if (hoursUntilDeparture >= 24) { // 1-2 ngày
                feePercentage = 0.50; // 50%
            } else { // < 24 giờ
                feePercentage = 0.60; // 60%
            }
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
            const emailSearch = email.trim().toLowerCase();

            // Validate: require booking code AND email, or just passenger name
            if (!code && !name) {
                showNotification('error', 'Vui lòng nhập mã đặt vé hoặc tên hành khách.');
                return;
            }

            if (code && !emailSearch) {
                showNotification('error', 'Vui lòng nhập email để xác thực mã đặt vé.');
                return;
            }

            const bookingsRes = await requestApi('bookings', 'GET');
            const bookings = bookingsRes?.data || bookingsRes || [];

            // Find booking by criteria
            const target = Array.isArray(bookings)
                ? bookings.find((b: any) => {
                    // If searching by booking code, MUST match both code AND email
                    if (code) {
                        const codeMatch = b.bookingReference?.toUpperCase() === code;
                        const emailMatch = b.user?.email?.toLowerCase() === emailSearch;
                        return codeMatch && emailMatch;
                    }

                    // If searching by passenger name only
                    if (name) {
                        const userFullName = `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.toLowerCase();
                        if (userFullName.includes(name)) return true;

                        // Also check passengers if available
                        if (b.passengers && Array.isArray(b.passengers)) {
                            return b.passengers.some((p: any) => {
                                const passengerFullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
                                return passengerFullName.includes(name);
                            });
                        }
                    }

                    return false;
                })
                : null;

            if (!target) {
                showNotification('error', 'Không tìm thấy đặt chỗ. Vui lòng kiểm tra lại mã đặt vé và email.');
                return;
            }

            const detailRes = await requestApi(`bookings/${target.bookingId}`, 'GET');
            const bookingDetail = detailRes?.data || detailRes;

            if (!bookingDetail) {
                showNotification('error', 'Không thể lấy thông tin chi tiết booking.');
                return;
            }

            const validation = validateCancellation(bookingDetail);

            if (!validation.canCancel) {
                showNotification('warning', validation.reason);
                return;
            }

            setBookingInfo(bookingDetail);
            setCancellationFee(validation.fee || 0);
            setRefundAmount(validation.refund || 0);
            setShowConfirmation(true);

            if (!validation.requiresRefund) {
                showNotification('info', 'Đặt chỗ chưa thanh toán. Bạn có thể hủy mà không mất phí.');
            } else {
                showNotification('success', 'Tìm thấy booking! Vui lòng chọn lý do hủy vé.');
            }
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
            const finalReason = selectedReason === 'other' ? customReason : selectedReason;

            // Get current user's full name
            const userName = currentUser
                ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
                : '';
            const cancelledByName = userName ? `Admin ${userName}` : 'Admin';

            const cancelRes = await requestApi(`bookings/${bookingInfo.bookingId}`, 'DELETE', {
                reason: finalReason,
                cancellationFee,
                cancelledBy: cancelledByName,
                refundAmount,
            });

            if (cancelRes?.success === false) {
                showNotification('error', cancelRes?.message || 'Hủy đặt vé thất bại. Vui lòng thử lại.');
                return;
            }

            const refundMsg = refundAmount > 0
                ? `Số tiền ${refundAmount.toLocaleString('vi-VN')}đ sẽ được hoàn lại trong 3-5 ngày làm việc.`
                : 'Đặt chỗ đã được hủy thành công.';

            showNotification(
                'success',
                'Hủy vé thành công!',
                [
                    `Mã đặt chỗ: ${bookingInfo.bookingReference}`,
                    refundAmount > 0 ? `Số tiền hoàn lại: ${refundAmount.toLocaleString('vi-VN')}đ` : 'Không có hoàn tiền',
                    refundAmount > 0 ? 'Thời gian xử lý: 3-5 ngày làm việc' : ''
                ].filter(Boolean),
                5000
            );

            handleClose();
            if (onSuccess) onSuccess();
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


    // Auto-fill passenger name when booking code and email are entered
    useEffect(() => {
        const autoFillPassengerName = async () => {
            const code = bookingCode.trim().toUpperCase();
            const emailSearch = email.trim().toLowerCase();

            // Only auto-fill if both fields are filled and we haven't shown confirmation yet
            if (!code || !emailSearch || showConfirmation) {
                return;
            }

            try {
                const bookingsRes = await requestApi('bookings', 'GET');
                const bookings = bookingsRes?.data || bookingsRes || [];

                const target = Array.isArray(bookings)
                    ? bookings.find((b: any) => {
                        const codeMatch = b.bookingReference?.toUpperCase() === code;
                        const emailMatch = b.user?.email?.toLowerCase() === emailSearch;
                        return codeMatch && emailMatch;
                    })
                    : null;

                if (target && target.user) {
                    const firstName = target.user.firstName || '';
                    const lastName = target.user.lastName || '';
                    const fullName = `${firstName} ${lastName}`.trim();

                    if (fullName && fullName !== passengerName) {
                        setPassengerName(fullName);
                    }
                }
            } catch (error) {
                // Silently fail - user can still manually enter name
                console.log('Auto-fill failed:', error);
            }
        };

        // Debounce the auto-fill to avoid too many API calls
        const timeoutId = setTimeout(() => {
            autoFillPassengerName();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [bookingCode, email, showConfirmation, passengerName]);

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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-gray-100 cursor-not-allowed"

                                            readOnly
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
                        <div className="space-y-4">
                            {/* Booking Info */}
                            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-1">Mã đặt chỗ</p>
                                        <p className="text-3xl font-bold text-gray-900">{bookingInfo?.bookingReference}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${bookingInfo?.bookingStatus === 'Confirmed' || bookingInfo?.status === 'Confirmed'
                                            ? 'bg-green-100 text-green-700'
                                            : bookingInfo?.bookingStatus === 'Pending' || bookingInfo?.status === 'Pending'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {bookingInfo?.bookingStatus || bookingInfo?.status}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${bookingInfo?.paymentStatus === 'Paid'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {bookingInfo?.paymentStatus || 'Pending'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                                    <span className="text-base text-gray-600">Tổng tiền</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-blue-600">
                                            {Math.floor(bookingInfo?.totalAmount || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                        </span>
                                        <span className="text-lg font-semibold text-blue-600">VND</span>
                                    </div>
                                </div>
                            </div>

                            {/* Flight Details */}
                            {bookingInfo?.bookingFlights && bookingInfo.bookingFlights.length > 0 && (
                                <div className="space-y-3">
                                    {bookingInfo.bookingFlights.map((bf, idx) => (
                                        <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                            {bf.flight && (
                                                <div>
                                                    <div className="bg-blue-600 px-4 py-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-2xl font-bold text-white">
                                                                    Máy bay :
                                                                </span>
                                                                <span className="text-white font-bold text-xl">{bf.flight.flightNumber}</span>
                                                            </div>
                                                            <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                                                                {bf.travelClass || 'Economy'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1">
                                                                <p className="text-4xl font-bold text-gray-900">{bf.flight.departureAirport?.airportCode}</p>
                                                                <p className="text-base font-medium text-gray-700 mt-1">{bf.flight.departureAirport?.city}</p>
                                                                <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    <span className="font-medium">
                                                                        {new Date(bf.flight.departureTime).toLocaleString('vi-VN', {
                                                                            day: '2-digit',
                                                                            month: '2-digit',
                                                                            year: 'numeric'
                                                                        })}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    <span className="font-bold text-gray-700">
                                                                        {new Date(bf.flight.departureTime).toLocaleString('vi-VN', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col items-center px-2">
                                                                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                                </svg>
                                                                <span className="text-sm text-gray-400 mt-1">
                                                                    {(() => {
                                                                        const dep = new Date(bf.flight.departureTime);
                                                                        const arr = new Date(bf.flight.arrivalTime);
                                                                        const diff = Math.abs(arr.getTime() - dep.getTime());
                                                                        const hours = Math.floor(diff / (1000 * 60 * 60));
                                                                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                                                        return `${hours}h ${minutes}m`;
                                                                    })()}
                                                                </span>
                                                            </div>

                                                            <div className="flex-1 text-right">
                                                                <p className="text-4xl font-bold text-gray-900">{bf.flight.arrivalAirport?.airportCode}</p>
                                                                <p className="text-base font-medium text-gray-700 mt-1">{bf.flight.arrivalAirport?.city}</p>
                                                                <div className="flex items-center justify-end gap-1 mt-2 text-sm text-gray-500">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    <span className="font-medium">
                                                                        {new Date(bf.flight.arrivalTime).toLocaleString('vi-VN', {
                                                                            day: '2-digit',
                                                                            month: '2-digit',
                                                                            year: 'numeric'
                                                                        })}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center justify-end gap-1 mt-1 text-sm text-gray-500">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    <span className="font-bold text-gray-700">
                                                                        {new Date(bf.flight.arrivalTime).toLocaleString('vi-VN', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Seat Allocations */}
                                                        {bf.seatAllocations && bf.seatAllocations.length > 0 && (
                                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                                                    </svg>
                                                                    <span className="text-base font-semibold text-gray-700">Hành khách & Ghế ngồi</span>
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    {bf.seatAllocations.map((sa, saIdx) => (
                                                                        <div key={saIdx} className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3 border border-gray-200">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-lg font-semibold text-gray-900">
                                                                                        {sa.passenger?.firstName} {sa.passenger?.lastName}
                                                                                    </p>
                                                                                    <p className="text-sm text-gray-500 capitalize">{sa.passenger?.passengerType}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-blue-200 shadow-sm">
                                                                                <span className="text-xl font-bold text-blue-600">
                                                                                    {sa.flightSeat?.seat?.seatNumber || 'N/A'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

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
