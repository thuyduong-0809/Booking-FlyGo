'use client';

import React, { useState } from 'react';
import { requestApi } from '@/lib/api';
import { useNotification } from '@/components/Notification';

interface BookingInfo {
    bookingId: string;
    bookingReference: string;
    status: string;
    bookingStatus?: string;
    totalAmount: number;
    departureTime?: string;
    fareClass?: string;
    paymentStatus?: string;
    contactEmail?: string;
    contactPhone?: string;
    bookedAt?: string;
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
    }>;
}

const REFUND_REASONS = [
    { value: 'AIRLINE_SCHEDULE_CHANGE', label: 'Hãng thay đổi giờ bay / hủy chuyến' },
    { value: 'CUSTOMER_CANCELLATION', label: 'Khách muốn hủy' },
    { value: 'WRONG_INFORMATION', label: 'Sai thông tin' },
    { value: 'PAYMENT_ERROR', label: 'Lỗi thanh toán' },
    { value: 'HEALTH_ISSUE', label: 'Vấn đề sức khỏe', requiresDocument: true },
    { value: 'OTHER', label: 'Lý do khác' },
];

const RequestRefundPage = () => {
    const { showNotification } = useNotification();

    // Form states
    const [bookingCode, setBookingCode] = useState('');
    const [passengerName, setPassengerName] = useState(''); // Auto-filled from booking
    const [email, setEmail] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    // UI states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [refundAmount, setRefundAmount] = useState(0);

    const calculateRefund = (booking: BookingInfo) => {
        const now = new Date();
        const departureTime = new Date(booking.bookingFlights?.[0]?.flight?.departureTime || '');
        const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        const totalAmount = booking.totalAmount || 0;
        const fareClass = booking.bookingFlights?.[0]?.travelClass?.toLowerCase() || 'economy';
        let feePercentage = 0;

        const isFirst = fareClass.includes('first');
        const isBusiness = fareClass.includes('business');

        if (isFirst) {
            if (hoursUntilDeparture >= 168) feePercentage = 0;
            else if (hoursUntilDeparture >= 48) feePercentage = 0.10;
            else if (hoursUntilDeparture >= 24) feePercentage = 0.15;
            else feePercentage = 0.20;
        } else if (isBusiness) {
            if (hoursUntilDeparture >= 168) feePercentage = 0.10;
            else if (hoursUntilDeparture >= 48) feePercentage = 0.20;
            else if (hoursUntilDeparture >= 24) feePercentage = 0.25;
            else feePercentage = 0.30;
        } else {
            if (hoursUntilDeparture >= 168) feePercentage = 0.30;
            else if (hoursUntilDeparture >= 48) feePercentage = 0.40;
            else if (hoursUntilDeparture >= 24) feePercentage = 0.50;
            else feePercentage = 0.60;
        }

        const fee = totalAmount * feePercentage;
        const refund = Math.max(0, totalAmount - fee);

        return Math.round(refund);
    };

    const validateRefundEligibility = (booking: BookingInfo): { eligible: boolean; reason: string } => {
        const bookingStatus = booking.bookingStatus || booking.status;

        console.log('🔍 Validating refund eligibility:', {
            bookingReference: booking.bookingReference,
            bookingStatus,
            rawBookingStatus: booking.bookingStatus,
            rawStatus: booking.status,
            hasFlights: booking.bookingFlights?.length || 0
        });

        // Check 1: Booking must be cancelled
        const isCancelled = bookingStatus === 'Cancelled';
        console.log('✅ Is Cancelled?', isCancelled);

        // Check 2: Check if any flight is cancelled or significantly delayed by airline
        let hasAirlineIssue = false;
        let airlineIssueReason = '';

        if (booking.bookingFlights && booking.bookingFlights.length > 0) {
            for (const bf of booking.bookingFlights) {
                if (bf.flight) {
                    const flightStatus = bf.flight.status;
                    console.log(`🛫 Flight ${bf.flight.flightNumber} status:`, flightStatus);

                    // Flight cancelled by airline
                    if (flightStatus === 'Cancelled') {
                        hasAirlineIssue = true;
                        airlineIssueReason = `Chuyến bay ${bf.flight.flightNumber} đã bị hủy bởi hãng`;
                        break;
                    }

                    // Flight delayed significantly (≥ 3 hours)
                    if (flightStatus === 'Delayed') {
                        // Note: We're assuming delayed flights qualify
                        // In a real system, you'd check the actual delay duration
                        hasAirlineIssue = true;
                        airlineIssueReason = `Chuyến bay ${bf.flight.flightNumber} bị delay`;
                        break;
                    }
                }
            }
        }

        console.log('✈️ Has Airline Issue?', hasAirlineIssue, airlineIssueReason);

        // Eligible if booking is cancelled OR there's an airline issue
        if (isCancelled || hasAirlineIssue) {
            console.log('✅ ELIGIBLE for refund');
            return {
                eligible: true,
                reason: hasAirlineIssue ? airlineIssueReason : 'Booking đã được hủy'
            };
        }

        // Not eligible
        console.log('❌ NOT ELIGIBLE for refund');
        return {
            eligible: false,
            reason: 'Chỉ có thể yêu cầu hoàn tiền cho vé đã hủy hoặc chuyến bay bị hủy/delay bởi hãng. Vui lòng hủy vé trước tại trang "Hủy đặt vé hoàn tiền".'
        };
    };

    const handleSearchBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setBookingInfo(null);
        setShowConfirmation(false);

        try {
            const code = bookingCode.trim().toUpperCase();
            const emailSearch = email.trim().toLowerCase();

            // Validate: require BOTH booking code AND email
            if (!code || !emailSearch) {
                const errorMsg = 'Vui lòng nhập cả mã đặt chỗ và email.';
                setError(errorMsg);
                showNotification('error', errorMsg);
                return;
            }

            const bookingsRes = await requestApi('bookings', 'GET');
            const bookings = bookingsRes?.data || bookingsRes || [];

            // Find booking by BOTH code AND email
            const target = Array.isArray(bookings)
                ? bookings.find((b: any) => {
                    const codeMatch = b.bookingReference?.toUpperCase() === code;
                    const emailMatch = b.user?.email?.toLowerCase() === emailSearch;
                    return codeMatch && emailMatch;
                })
                : null;

            if (!target) {
                const errorMsg = 'Không tìm thấy đặt chỗ. Vui lòng kiểm tra lại mã đặt chỗ và email.';
                setError(errorMsg);
                showNotification('error', errorMsg);
                return;
            }

            const detailRes = await requestApi(`bookings/${target.bookingId}`, 'GET');
            const bookingDetail = detailRes?.data || detailRes;

            if (!bookingDetail) {
                const errorMsg = 'Không thể lấy thông tin chi tiết booking.';
                setError(errorMsg);
                showNotification('error', errorMsg);
                return;
            }

            // Auto-fill passenger name from booking
            // If user is logged in → auto-fill (but still editable)
            // If guest booking → leave empty for manual input
            let passengerFullName = '';

            if (bookingDetail.user?.firstName || bookingDetail.user?.lastName) {
                // User is logged in - auto-fill their name (editable)
                const firstName = bookingDetail.user?.firstName || '';
                const lastName = bookingDetail.user?.lastName || '';
                passengerFullName = `${firstName} ${lastName}`.trim();
            }
            // For guest bookings, leave empty for manual input

            setPassengerName(passengerFullName);

            setBookingInfo(bookingDetail);

            // Validate if booking is eligible for refund
            const validation = validateRefundEligibility(bookingDetail);
            if (!validation.eligible) {
                const errorMsg = validation.reason;
                setError(errorMsg);
                showNotification('error', 'Không đủ điều kiện hoàn tiền', errorMsg);
                setBookingInfo(null);
                return;
            }

            const refund = calculateRefund(bookingDetail);
            setRefundAmount(refund);

            showNotification('success', 'Tìm thấy đặt chỗ', 'Vui lòng chọn lý do hoàn tiền và gửi yêu cầu. Hệ thống sẽ xem xét yêu cầu của bạn.');
        } catch (err: any) {
            const errorMsg = err?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
            setError(errorMsg);
            showNotification('error', 'Lỗi tra cứu', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            const validFiles = newFiles.filter(file => {
                const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
                const maxSize = 5 * 1024 * 1024; // 5MB

                if (!validTypes.includes(file.type)) {
                    showNotification('error', 'Định dạng file không hợp lệ', 'Chỉ chấp nhận file JPG, PNG, hoặc PDF.');
                    return false;
                }

                if (file.size > maxSize) {
                    showNotification('error', 'File quá lớn', `File ${file.name} vượt quá 5MB.`);
                    return false;
                }

                return true;
            });

            setUploadedFiles(prev => [...prev, ...validFiles]);
        }
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitRefund = () => {
        if (!refundReason) {
            showNotification('error', 'Vui lòng chọn lý do hoàn tiền');
            return;
        }

        // Check if custom reason is required
        if (refundReason === 'OTHER' && !customReason.trim()) {
            showNotification('error', 'Vui lòng nhập chi tiết lý do hoàn tiền');
            return;
        }

        // Check if document is required for health issues
        const selectedReason = REFUND_REASONS.find(r => r.value === refundReason);
        if (selectedReason?.requiresDocument && uploadedFiles.length === 0) {
            showNotification('warning', 'Cần chứng từ', 'Vui lòng tải lên giấy tờ chứng minh cho lý do sức khỏe.');
            return;
        }

        setShowConfirmation(true);
    };

    const handleConfirmSubmit = async () => {
        if (!bookingInfo) return;

        setLoading(true);
        setError('');

        try {
            // Prepare documents as JSON string
            const documentsJson = uploadedFiles.length > 0
                ? JSON.stringify(uploadedFiles.map(f => f.name))
                : undefined;

            // Determine final reason (use custom reason if OTHER is selected)
            const finalReason = refundReason === 'OTHER' ? customReason : refundReason;

            // Call the new refund-history API
            const refundRes = await requestApi('refund-history', 'POST', {
                bookingId: Number(bookingInfo.bookingId),
                bookingReference: bookingInfo.bookingReference,
                refundReason: finalReason,
                refundAmount,
                passengerName,
                email,
                documents: documentsJson,
            });

            if (refundRes?.success === false) {
                const errorMsg = refundRes?.message || 'Gửi yêu cầu hoàn tiền thất bại. Vui lòng thử lại.';
                setError(errorMsg);
                showNotification('error', 'Gửi yêu cầu thất bại', errorMsg);
                return;
            }

            showNotification(
                'success',
                'Flygo đã nhận yêu cầu của bạn!',
                [
                    `Mã đặt chỗ: ${bookingInfo.bookingReference}`,
                    `Số tiền dự kiến hoàn lại: ${refundAmount.toLocaleString('vi-VN')}đ`,
                    'Chúng tôi sẽ xử lý yêu cầu trong thời gian quy định.',
                    'Bạn sẽ nhận email xác nhận trong thời gian sớm nhất.'
                ],
                8000
            );

            // Reset form
            setBookingCode('');
            setPassengerName('');
            setEmail('');
            setCustomReason('');
            setRefundReason('');
            setUploadedFiles([]);
            setBookingInfo(null);
            setShowConfirmation(false);
        } catch (err: any) {
            const errorMsg = err?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
            setError(errorMsg);
            showNotification('error', 'Lỗi gửi yêu cầu', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Yêu Cầu Hoàn Tiền</h1>
                    <p className="text-lg text-gray-600">Gửi yêu cầu hoàn tiền cho vé đã hủy</p>
                    <p className="text-sm text-yellow-600 mt-2">⚠️ Chỉ áp dụng cho vé đã hủy. Vui lòng hủy vé trước tại trang "Hủy đặt vé hoàn tiền"</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-blue-600 px-6 py-4">
                        <h2 className="text-2xl font-bold text-white">Thông tin yêu cầu</h2>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <svg className="w-6 h-6 text-red-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-base text-red-800">{error}</p>
                                </div>
                            </div>
                        )}

                        {!bookingInfo ? (
                            <form onSubmit={handleSearchBooking} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="bookingCode" className="block text-base font-semibold text-gray-700 mb-2">
                                            Mã đặt chỗ (PNR) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="bookingCode"
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg text-gray-900 placeholder-gray-400 uppercase"
                                            value={bookingCode}
                                            onChange={e => setBookingCode(e.target.value)}
                                            placeholder="BK1A2B3C"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="passengerName" className="block text-base font-semibold text-gray-700 mb-2">
                                            Họ tên hành khách <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="passengerName"
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg text-gray-900 placeholder-gray-400"
                                            value={passengerName}
                                            onChange={e => setPassengerName(e.target.value)}
                                            placeholder="Nguyễn Văn A"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Tự động điền nếu đã đăng nhập, có thể chỉnh sửa</p>
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg text-gray-900 placeholder-gray-400"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="email@example.com"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Bắt buộc để xác thực mã đặt chỗ</p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang tra cứu...
                                        </span>
                                    ) : (
                                        'Tra cứu'
                                    )}
                                </button>
                            </form>
                        ) : !showConfirmation ? (
                            <div className="space-y-6">
                                {/* Booking Info Display */}
                                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-1">Mã đặt chỗ</p>
                                            <p className="text-3xl font-bold text-gray-900">{bookingInfo.bookingReference}</p>
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                                            Đã hủy
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                                        <span className="text-base text-gray-600">Số tiền dự kiến hoàn lại</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-green-600">
                                                {refundAmount.toLocaleString('vi-VN')}
                                            </span>
                                            <span className="text-lg font-semibold text-green-600">VND</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Flight Details */}
                                {bookingInfo.bookingFlights && bookingInfo.bookingFlights.length > 0 && (
                                    <div className="space-y-3">
                                        {bookingInfo.bookingFlights.map((bf, idx) => (
                                            <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                                {bf.flight && (
                                                    <div>
                                                        <div className="bg-blue-600 px-4 py-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-white font-bold text-xl">{bf.flight.flightNumber}</span>
                                                                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                                                                    {bf.travelClass || 'Economy'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1">
                                                                    <p className="text-3xl font-bold text-gray-900">{bf.flight.departureAirport?.airportCode}</p>
                                                                    <p className="text-base font-medium text-gray-700 mt-1">{bf.flight.departureAirport?.city}</p>
                                                                </div>

                                                                <div className="flex flex-col items-center px-2">
                                                                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                                    </svg>
                                                                </div>

                                                                <div className="flex-1 text-right">
                                                                    <p className="text-3xl font-bold text-gray-900">{bf.flight.arrivalAirport?.airportCode}</p>
                                                                    <p className="text-base font-medium text-gray-700 mt-1">{bf.flight.arrivalAirport?.city}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Refund Reason */}
                                <div>
                                    <label htmlFor="refundReason" className="block text-base font-semibold text-gray-700 mb-2">
                                        Lý do hoàn tiền <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="refundReason"
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base text-gray-900"
                                        value={refundReason}
                                        onChange={e => setRefundReason(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Chọn lý do --</option>
                                        {REFUND_REASONS.map(reason => (
                                            <option key={reason.value} value={reason.value}>
                                                {reason.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Custom Reason Input (shown when OTHER is selected) */}
                                {refundReason === 'OTHER' && (
                                    <div>
                                        <label htmlFor="customReason" className="block text-base font-semibold text-gray-700 mb-2">
                                            Chi tiết lý do <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="customReason"
                                            rows={4}
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base text-gray-900 placeholder-gray-400"
                                            value={customReason}
                                            onChange={e => setCustomReason(e.target.value)}
                                            placeholder="Vui lòng mô tả chi tiết lý do hoàn tiền của bạn..."
                                            required
                                        />
                                    </div>
                                )}

                                {/* Document Upload */}
                                <div>
                                    <label className="block text-base font-semibold text-gray-700 mb-2">
                                        Upload chứng từ {REFUND_REASONS.find(r => r.value === refundReason)?.requiresDocument && <span className="text-red-500">*</span>}
                                    </label>
                                    <p className="text-sm text-gray-500 mb-2">Bắt buộc cho: Vấn đề sức khỏe</p>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                        <input
                                            type="file"
                                            id="fileUpload"
                                            className="hidden"
                                            multiple
                                            accept="image/jpeg,image/png,application/pdf"
                                            onChange={handleFileUpload}
                                        />
                                        <label htmlFor="fileUpload" className="cursor-pointer">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className="mt-2 text-sm text-gray-600">
                                                <span className="font-semibold text-blue-600">Click để chọn file</span> hoặc kéo thả vào đây
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF (tối đa 5MB mỗi file)</p>
                                        </label>
                                    </div>

                                    {uploadedFiles.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {uploadedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-sm text-gray-700">{file.name}</span>
                                                        <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="text-red-600 hover:text-red-800 transition-colors"
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setBookingInfo(null);
                                            setRefundReason('');
                                            setCustomReason('');
                                            setUploadedFiles([]);
                                        }}
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmitRefund}
                                        disabled={!refundReason}
                                        className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Gửi yêu cầu
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Confirmation Dialog */}
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận yêu cầu hoàn tiền</h3>

                                    <div className="space-y-3 text-base">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Mã đặt chỗ:</span>
                                            <span className="font-semibold text-gray-900">{bookingInfo.bookingReference}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Lý do hoàn tiền:</span>
                                            <span className="font-semibold text-gray-900">
                                                {REFUND_REASONS.find(r => r.value === refundReason)?.label}
                                            </span>
                                        </div>
                                        <div className="flex justify-between pt-3 border-t border-blue-200">
                                            <span className="text-gray-900 font-semibold">Số tiền hoàn lại:</span>
                                            <span className="font-bold text-xl text-green-600">{refundAmount.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        {uploadedFiles.length > 0 && (
                                            <div className="pt-3 border-t border-blue-200">
                                                <span className="text-gray-600">Chứng từ đính kèm:</span>
                                                <ul className="mt-2 space-y-1">
                                                    {uploadedFiles.map((file, index) => (
                                                        <li key={index} className="text-sm text-gray-700">• {file.name}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Lưu ý:</strong> Flygo đã nhận yêu cầu của bạn và sẽ xử lý trong thời gian quy định.
                                            Bạn sẽ nhận email xác nhận trong thời gian sớm nhất.
                                        </p>
                                    </div>
                                </div>

                                {/* Confirmation Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmation(false)}
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmSubmit}
                                        disabled={loading}
                                        className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Đang gửi...' : 'Xác nhận gửi yêu cầu'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestRefundPage;
