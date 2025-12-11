'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { requestApi } from '@/lib/api';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useNotification } from '@/components/Notification';
import { getCookie } from '@/utils/cookies';

interface CreateRefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const REFUND_REASONS = [
    { value: 'AIRLINE_SCHEDULE_CHANGE', label: 'Hãng thay đổi giờ bay / hủy chuyến', requiresDocument: false },
    { value: 'CUSTOMER_CANCELLATION', label: 'Khách muốn hủy', requiresDocument: false },
    { value: 'WRONG_INFORMATION', label: 'Sai thông tin', requiresDocument: false },
    { value: 'PAYMENT_ERROR', label: 'Lỗi thanh toán', requiresDocument: false },
    { value: 'HEALTH_ISSUE', label: 'Vấn đề sức khỏe', requiresDocument: true },
    { value: 'OTHER', label: 'Lý do khác', requiresDocument: false },
];

export default function CreateRefundModal({ isOpen, onClose, onSuccess }: CreateRefundModalProps) {
    const { showNotification } = useNotification();
    const [mounted, setMounted] = useState(false);
    const [bookingInfo, setBookingInfo] = useState<any>(null);
    const [showBookingInfo, setShowBookingInfo] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [searchingBooking, setSearchingBooking] = useState(false);
    const [processingAction, setProcessingAction] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Create form
    const [createForm, setCreateForm] = useState({
        bookingReference: '',
        refundReason: '',
        refundAmount: '',
        passengerName: '',
        email: '',
        customReason: '', // For OTHER reason
    });
    const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Lấy thông tin user đang đăng nhập
    useEffect(() => {
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

        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (!isOpen) {
            // Reset form when modal closes
            setCreateForm({
                bookingReference: '',
                refundReason: '',
                refundAmount: '',
                passengerName: '',
                email: '',
                customReason: '',
            });
            setBookingInfo(null);
            setShowBookingInfo(false);
            setShowConfirmation(false);
            setCreateErrors({});
            setUploadedFiles([]);
        }
    }, [isOpen]);

    // Auto-fill passenger name when booking code and email are entered
    useEffect(() => {
        const autoFillPassengerName = async () => {
            const code = createForm.bookingReference.trim().toUpperCase();
            const emailSearch = createForm.email.trim().toLowerCase();

            // Only auto-fill if both fields are filled and we haven't shown booking info yet
            if (!code || !emailSearch || showBookingInfo) {
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

                    if (fullName && fullName !== createForm.passengerName) {
                        setCreateForm(prev => ({
                            ...prev,
                            passengerName: fullName
                        }));
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
    }, [createForm.bookingReference, createForm.email, showBookingInfo]);

    const calculateRefund = (booking: any) => {
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

    const validateRefundEligibility = (booking: any): { eligible: boolean; reason: string } => {
        const bookingStatus = booking.bookingStatus || booking.status;

        // Check 1: Booking must be cancelled
        const isCancelled = bookingStatus === 'Cancelled';

        // Check 2: Check if any flight is cancelled or significantly delayed by airline
        let hasAirlineIssue = false;
        let airlineIssueReason = '';

        if (booking.bookingFlights && booking.bookingFlights.length > 0) {
            for (const bf of booking.bookingFlights) {
                if (bf.flight) {
                    const flightStatus = bf.flight.status;

                    // Flight cancelled by airline
                    if (flightStatus === 'Cancelled') {
                        hasAirlineIssue = true;
                        airlineIssueReason = `Chuyến bay ${bf.flight.flightNumber} đã bị hủy bởi hãng`;
                        break;
                    }

                    // Flight delayed significantly
                    if (flightStatus === 'Delayed') {
                        hasAirlineIssue = true;
                        airlineIssueReason = `Chuyến bay ${bf.flight.flightNumber} bị delay`;
                        break;
                    }
                }
            }
        }

        // Eligible if booking is cancelled OR there's an airline issue
        if (isCancelled || hasAirlineIssue) {
            return {
                eligible: true,
                reason: hasAirlineIssue ? airlineIssueReason : 'Booking đã được hủy'
            };
        }

        // Not eligible
        return {
            eligible: false,
            reason: 'Chỉ có thể yêu cầu hoàn tiền cho vé đã hủy hoặc chuyến bay bị hủy/delay bởi hãng.'
        };
    };

    const handleSearchBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setSearchingBooking(true);
        setCreateErrors({});

        try {
            const code = createForm.bookingReference.trim().toUpperCase();
            const emailSearch = createForm.email.trim().toLowerCase();

            // Validate: require BOTH booking code AND email
            if (!code || !emailSearch) {
                showNotification('error', 'Vui lòng nhập cả mã đặt chỗ và email.');
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
                showNotification('error', 'Không tìm thấy đặt chỗ. Vui lòng kiểm tra lại mã đặt chỗ và email.');
                return;
            }

            const detailRes = await requestApi(`bookings/${target.bookingId}`, 'GET');
            const bookingDetail = detailRes?.data || detailRes;

            if (!bookingDetail) {
                showNotification('error', 'Không thể lấy thông tin chi tiết booking.');
                return;
            }

            // Validate if booking is eligible for refund
            const validation = validateRefundEligibility(bookingDetail);
            if (!validation.eligible) {
                showNotification('error', validation.reason);
                return;
            }

            // Auto-fill passenger name from booking
            let passengerFullName = '';
            if (bookingDetail.user?.firstName || bookingDetail.user?.lastName) {
                const firstName = bookingDetail.user?.firstName || '';
                const lastName = bookingDetail.user?.lastName || '';
                passengerFullName = `${firstName} ${lastName}`.trim();
            }

            const refund = calculateRefund(bookingDetail);

            setBookingInfo(bookingDetail);
            setCreateForm({
                ...createForm,
                passengerName: passengerFullName || createForm.passengerName,
                refundAmount: refund.toString(),
            });
            setShowBookingInfo(true);

            showNotification('success', 'Tìm thấy đặt chỗ', 'Vui lòng chọn lý do hoàn tiền và gửi yêu cầu.');
        } catch (error: any) {
            showNotification('error', error?.message || 'Có lỗi xảy ra khi tìm kiếm booking');
        } finally {
            setSearchingBooking(false);
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
        if (!createForm.refundReason) {
            showNotification('error', 'Vui lòng chọn lý do hoàn tiền');
            return;
        }

        // Check if custom reason is required
        if (createForm.refundReason === 'OTHER' && !createForm.customReason.trim()) {
            showNotification('error', 'Vui lòng nhập chi tiết lý do hoàn tiền');
            return;
        }

        // Check if document is required for health issues
        const selectedReason = REFUND_REASONS.find(r => r.value === createForm.refundReason);
        if (selectedReason?.requiresDocument && uploadedFiles.length === 0) {
            showNotification('warning', 'Cần chứng từ', 'Vui lòng tải lên giấy tờ chứng minh cho lý do sức khỏe.');
            return;
        }

        setShowConfirmation(true);
    };

    const handleConfirmSubmit = async () => {
        if (!bookingInfo) return;

        setProcessingAction(true);

        try {
            // Prepare documents as JSON string
            const documentsJson = uploadedFiles.length > 0
                ? JSON.stringify(uploadedFiles.map(f => f.name))
                : undefined;

            // Determine final reason (use custom reason if OTHER is selected)
            const finalReason = createForm.refundReason === 'OTHER' ? createForm.customReason : createForm.refundReason;

            // Get current user's full name
            const processedByName = currentUser
                ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
                : 'Admin';

            const res = await requestApi('refund-history', 'POST', {
                bookingId: Number(bookingInfo.bookingId),
                bookingReference: createForm.bookingReference,
                refundReason: finalReason,
                refundAmount: Number(createForm.refundAmount),
                requestedAt: new Date(),
                processedBy: processedByName,
                passengerName: createForm.passengerName,
                email: createForm.email,
                documents: documentsJson,
            });

            if (res?.success) {
                showNotification(
                    'success',
                    'Flygo đã nhận yêu cầu của bạn!',
                    [
                        `Mã đặt chỗ: ${bookingInfo.bookingReference}`,
                        `Số tiền dự kiến hoàn lại: ${Number(createForm.refundAmount).toLocaleString('vi-VN')}đ`,
                        'Chúng tôi sẽ xử lý yêu cầu trong thời gian quy định.',
                        'Bạn sẽ nhận email xác nhận trong thời gian sớm nhất.'
                    ],
                    8000
                );
                onSuccess();
                onClose();
            } else {
                showNotification('error', res?.message || 'Có lỗi xảy ra');
            }
        } catch (error: any) {
            showNotification('error', error?.message || 'Có lỗi xảy ra khi tạo yêu cầu');
        } finally {
            setProcessingAction(false);
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto relative z-[100000]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Tạo yêu cầu hoàn tiền</h3>
                    <button onClick={onClose}>
                        <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                {!showBookingInfo ? (
                    /* Step 1: Search Booking */
                    <form onSubmit={handleSearchBooking} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mã đặt chỗ (PNR) *</label>
                                <input
                                    type="text"
                                    value={createForm.bookingReference}
                                    onChange={(e) => setCreateForm({ ...createForm, bookingReference: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black uppercase"
                                    placeholder="BK1A2B3C"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    value={createForm.email}
                                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                                    placeholder="email@example.com"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Bắt buộc để xác thực mã đặt chỗ</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên hành khách </label>
                                <input
                                    type="text"
                                    value={createForm.passengerName}
                                    onChange={(e) => setCreateForm({ ...createForm, passengerName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-gray-100 cursor-not-allowed"
                                    readOnly
                                />
                            </div>

                        </div>
                        <button
                            type="submit"
                            disabled={searchingBooking}
                            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {searchingBooking ? 'Đang tra cứu...' : 'Tra cứu'}
                        </button>
                    </form>
                ) : !showConfirmation ? (
                    /* Step 2: Create Refund Request */
                    <div className="space-y-4">
                        {/* Booking Info Display */}
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-1">Mã đặt chỗ</p>
                                    <p className="text-2xl font-bold text-gray-900">{bookingInfo?.bookingReference}</p>
                                </div>
                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                                    Đã hủy
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                                <span className="text-sm text-gray-600">Số tiền dự kiến hoàn lại</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-bold text-green-600">
                                        {Number(createForm.refundAmount).toLocaleString('vi-VN')}
                                    </span>
                                    <span className="text-sm font-semibold text-green-600">VND</span>
                                </div>
                            </div>
                        </div>

                        {/* Flight Details */}
                        {bookingInfo?.bookingFlights && bookingInfo.bookingFlights.length > 0 && (
                            <div className="space-y-2">
                                {bookingInfo.bookingFlights.map((bf: any, idx: number) => (
                                    <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        {bf.flight && (
                                            <div>
                                                <div className="bg-blue-600 px-3 py-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-white font-bold text-sm">{bf.flight.flightNumber}</span>
                                                        <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                            {bf.travelClass || 'Economy'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <div className="flex-1">
                                                            <p className="text-2xl font-bold text-gray-900">{bf.flight.departureAirport?.airportCode}</p>
                                                            <p className="text-xs text-gray-600">{bf.flight.departureAirport?.city}</p>
                                                        </div>
                                                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                        </svg>
                                                        <div className="flex-1 text-right">
                                                            <p className="text-2xl font-bold text-gray-900">{bf.flight.arrivalAirport?.airportCode}</p>
                                                            <p className="text-xs text-gray-600">{bf.flight.arrivalAirport?.city}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do hoàn tiền *</label>
                                <select
                                    value={createForm.refundReason}
                                    onChange={(e) => setCreateForm({ ...createForm, refundReason: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                                    required
                                >
                                    <option value="">-- Chọn lý do --</option>
                                    {REFUND_REASONS.map(reason => (
                                        <option key={reason.value} value={reason.value}>{reason.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Reason */}
                            {createForm.refundReason === 'OTHER' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Chi tiết lý do *</label>
                                    <textarea
                                        value={createForm.customReason}
                                        onChange={(e) => setCreateForm({ ...createForm, customReason: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                                        rows={3}
                                        placeholder="Vui lòng mô tả chi tiết lý do hoàn tiền..."
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên hành khách *</label>
                                <input
                                    type="text"
                                    value={createForm.passengerName}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-gray-100 cursor-not-allowed"
                                    readOnly
                                />
                            </div>

                            {/* Document Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Upload chứng từ {REFUND_REASONS.find(r => r.value === createForm.refundReason)?.requiresDocument && <span className="text-red-500">*</span>}
                                </label>
                                <p className="text-xs text-gray-500 mb-2">Bắt buộc cho: Vấn đề sức khỏe</p>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                                    <input
                                        type="file"
                                        id="fileUpload"
                                        className="hidden"
                                        multiple
                                        accept="image/jpeg,image/png,application/pdf"
                                        onChange={handleFileUpload}
                                    />
                                    <label htmlFor="fileUpload" className="cursor-pointer">
                                        <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="mt-1 text-sm text-gray-600">
                                            <span className="font-semibold text-blue-600">Click để chọn file</span> hoặc kéo thả
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF (tối đa 5MB)</p>
                                    </label>
                                </div>

                                {uploadedFiles.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {uploadedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
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
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowBookingInfo(false);
                                    setBookingInfo(null);
                                    setCreateForm({
                                        ...createForm,
                                        refundReason: '',
                                        customReason: '',
                                    });
                                    setUploadedFiles([]);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Quay lại
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmitRefund}
                                disabled={!createForm.refundReason}
                                className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                Gửi yêu cầu
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Step 3: Confirmation */
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Xác nhận yêu cầu hoàn tiền</h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Mã đặt chỗ:</span>
                                    <span className="font-semibold text-gray-900">{bookingInfo?.bookingReference}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Hành khách:</span>
                                    <span className="font-semibold text-gray-900">{createForm.passengerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Lý do hoàn tiền:</span>
                                    <span className="font-semibold text-gray-900">
                                        {REFUND_REASONS.find(r => r.value === createForm.refundReason)?.label}
                                    </span>
                                </div>
                                {createForm.refundReason === 'OTHER' && createForm.customReason && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Chi tiết:</span>
                                        <span className="font-semibold text-gray-900 text-right max-w-xs">{createForm.customReason}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-3 border-t border-blue-200">
                                    <span className="text-gray-900 font-semibold">Số tiền hoàn lại:</span>
                                    <span className="font-bold text-lg text-green-600">
                                        {Number(createForm.refundAmount).toLocaleString('vi-VN')}đ
                                    </span>
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

                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xs text-yellow-800">
                                    <strong>Lưu ý:</strong> Flygo đã nhận yêu cầu của bạn và sẽ xử lý trong thời gian quy định.
                                    Bạn sẽ nhận email xác nhận trong thời gian sớm nhất.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirmation(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Quay lại
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSubmit}
                                disabled={processingAction}
                                className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {processingAction ? 'Đang gửi...' : 'Xác nhận gửi yêu cầu'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

