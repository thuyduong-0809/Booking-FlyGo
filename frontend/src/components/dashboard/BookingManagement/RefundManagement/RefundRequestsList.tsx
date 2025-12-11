'use client';

import { useEffect, useState } from 'react';
import { requestApi } from '@/lib/api';
import { MagnifyingGlassIcon, CheckIcon, XMarkIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useNotification } from '@/components/Notification';
import { createPortal } from 'react-dom';
import { getCookie } from '@/utils/cookies';

interface RefundRequest {
    refundHistoryId: number;
    bookingReference: string;
    refundReason: string;
    refundAmount: number;
    passengerName: string;
    email: string;
    phone: string;
    documents: string | null;
    status: string;
    requestedAt: string;
    processedAt: string | null;
    booking: {
        bookingId: number;
        bookingStatus: string;
        totalAmount: number;
    };
}

const REFUND_REASON_LABELS: Record<string, string> = {
    'AIRLINE_SCHEDULE_CHANGE': 'Hãng thay đổi giờ bay / hủy chuyến',
    'CUSTOMER_CANCELLATION': 'Khách muốn hủy',
    'WRONG_INFORMATION': 'Sai thông tin',
    'PAYMENT_ERROR': 'Lỗi thanh toán',
    'HEALTH_ISSUE': 'Vấn đề sức khỏe',
    'OTHER': 'Lý do khác',
};

export default function RefundRequestsList() {
    const { showNotification, showConfirmModal } = useNotification();
    const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('Pending');
    const [reasonFilter, setReasonFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Sorting
    const [sortField, setSortField] = useState<string>('requestedAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Reject modal
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRefundId, setSelectedRefundId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [processingAction, setProcessingAction] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        loadRefundRequests();
        fetchCurrentUser();
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

    const loadRefundRequests = async () => {
        setLoading(true);
        try {
            const res = await requestApi('refund-history', 'GET');
            if (res?.success) {
                setRefundRequests(res.data || []);
            }
        } catch (error) {
            console.error('Error loading refund requests:', error);
            showNotification('error', 'Không thể tải danh sách yêu cầu hoàn tiền');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (refundHistoryId: number) => {
        showConfirmModal({
            title: 'Xác nhận duyệt',
            message: 'Bạn có chắc muốn duyệt yêu cầu hoàn tiền này?',
            confirmText: 'Duyệt',
            cancelText: 'Hủy',
            confirmButtonColor: 'green',
            onConfirm: async () => {
                setProcessingAction(true);
                try {
                    // Get current user's full name
                    const processedByName = currentUser
                        ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
                        : 'Admin';

                    const res = await requestApi(`refund-history/${refundHistoryId}`, 'PATCH', {
                        status: 'Approved',
                        processedBy: processedByName,
                        processedAt: new Date().toISOString(),
                    });
                    if (res?.success) {
                        showNotification('success', 'Đã duyệt yêu cầu hoàn tiền');
                        loadRefundRequests();
                    } else {
                        showNotification('error', 'Có lỗi xảy ra khi duyệt yêu cầu');
                    }
                } catch (error) {
                    showNotification('error', 'Có lỗi xảy ra khi duyệt yêu cầu');
                } finally {
                    setProcessingAction(false);
                }
            }
        });
    };

    const handleRejectClick = (refundHistoryId: number) => {
        setSelectedRefundId(refundHistoryId);
        setShowRejectModal(true);
        setRejectReason('');
    };

    const handleReject = async () => {
        if (!selectedRefundId || !rejectReason.trim()) {
            showNotification('warning', 'Vui lòng nhập lý do từ chối');
            return;
        }

        setProcessingAction(true);
        try {
            // Get current user's full name
            const processedByName = currentUser
                ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
                : 'Admin';

            const res = await requestApi(`refund-history/${selectedRefundId}`, 'PATCH', {
                status: 'Rejected',
                adminNotes: rejectReason,
                processedBy: processedByName,
                processedAt: new Date().toISOString(),
            });
            if (res?.success) {
                showNotification('success', 'Đã từ chối yêu cầu hoàn tiền');
                setShowRejectModal(false);
                setSelectedRefundId(null);
                setRejectReason('');
                loadRefundRequests();
            } else {
                showNotification('error', 'Có lỗi xảy ra khi từ chối yêu cầu');
            }
        } catch (error) {
            showNotification('error', 'Có lỗi xảy ra khi từ chối yêu cầu');
        } finally {
            setProcessingAction(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'text-yellow-600 bg-yellow-100';
            case 'Approved': return 'text-green-600 bg-green-100';
            case 'Rejected': return 'text-red-600 bg-red-100';
            case 'Completed': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'Pending': return 'Chờ xử lý';
            case 'Approved': return 'Đã duyệt';
            case 'Rejected': return 'Đã từ chối';
            case 'Completed': return 'Hoàn thành';
            default: return status;
        }
    };

    // Handle sorting
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Sort icon component
    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) {
            return <ChevronUpIcon className="h-4 w-4 text-gray-400" />;
        }
        return sortDirection === 'asc'
            ? <ChevronUpIcon className="h-4 w-4 text-blue-600" />
            : <ChevronDownIcon className="h-4 w-4 text-blue-600" />;
    };

    // Advanced filtering
    const filteredRequests = refundRequests.filter(req => {
        // Status filter
        if (statusFilter !== 'all' && req.status !== statusFilter) return false;

        // Reason filter
        if (reasonFilter !== 'all' && req.refundReason !== reasonFilter) return false;

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            const matchesSearch =
                req.bookingReference.toLowerCase().includes(search) ||
                req.passengerName.toLowerCase().includes(search) ||
                req.email.toLowerCase().includes(search)
            if (!matchesSearch) return false;
        }

        // Date range filter
        if (dateFrom) {
            const requestDate = new Date(req.requestedAt);
            const fromDate = new Date(dateFrom);
            if (requestDate < fromDate) return false;
        }
        if (dateTo) {
            const requestDate = new Date(req.requestedAt);
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            if (requestDate > toDate) return false;
        }

        return true;
    }).sort((a, b) => {
        // Sorting logic
        let aValue: any;
        let bValue: any;

        switch (sortField) {
            case 'bookingReference':
                aValue = a.bookingReference;
                bValue = b.bookingReference;
                break;
            case 'passengerName':
                aValue = a.passengerName;
                bValue = b.passengerName;
                break;
            case 'refundAmount':
                aValue = a.refundAmount;
                bValue = b.refundAmount;
                break;
            case 'status':
                aValue = a.status;
                bValue = b.status;
                break;
            case 'requestedAt':
                aValue = new Date(a.requestedAt).getTime();
                bValue = new Date(b.requestedAt).getTime();
                break;
            default:
                return 0;
        }

        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    return (
        <div className="space-y-6">
            {/* Advanced Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm mã đặt chỗ, tên, email, SĐT..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="Pending">Chờ xử lý</option>
                            <option value="Approved">Đã duyệt</option>
                            <option value="Rejected">Đã từ chối</option>
                            <option value="Completed">Hoàn thành</option>
                        </select>
                    </div>

                    {/* Reason Filter */}
                    <div>
                        <select
                            value={reasonFilter}
                            onChange={(e) => setReasonFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        >
                            <option value="all">Tất cả lý do</option>
                            {Object.entries(REFUND_REASON_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Refresh Button */}
                    <div>
                        <button
                            onClick={loadRefundRequests}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Làm mới
                        </button>
                    </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                    </div>
                </div>
            </div>

            {/* Refund Requests Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Yêu cầu hoàn tiền ({filteredRequests.length})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Đang tải...</div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Không có yêu cầu hoàn tiền nào</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => handleSort('bookingReference')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Mã đặt chỗ
                                            <SortIcon field="bookingReference" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => handleSort('passengerName')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Hành khách
                                            <SortIcon field="passengerName" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Lý do</th>
                                    <th
                                        className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => handleSort('refundAmount')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Số tiền hoàn
                                            <SortIcon field="refundAmount" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Trạng thái vé</th>
                                    <th
                                        className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Trạng thái
                                            <SortIcon field="status" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => handleSort('requestedAt')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Ngày yêu cầu
                                            <SortIcon field="requestedAt" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRequests.map((request) => (
                                    <tr key={request.refundHistoryId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {request.bookingReference}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{request.passengerName}</div>
                                            <div className="text-xs text-gray-500">{request.email}</div>
                                            <div className="text-xs text-gray-500">{request.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {REFUND_REASON_LABELS[request.refundReason] || request.refundReason}
                                            </div>
                                            {request.documents && (
                                                <div className="text-xs text-blue-600 mt-1">📎 Có chứng từ</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ₫{request.refundAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${request.booking.bookingStatus === 'Cancelled'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-green-100 text-green-700'
                                                }`}>
                                                {request.booking.bookingStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                {getStatusText(request.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(request.requestedAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {request.status === 'Pending' && (
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleApprove(request.refundHistoryId)}
                                                        className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                                                        title="Duyệt"
                                                        disabled={processingAction}
                                                    >
                                                        <CheckIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectClick(request.refundHistoryId)}
                                                        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                                                        title="Từ chối"
                                                        disabled={processingAction}
                                                    >
                                                        <XMarkIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            )}
                                            {request.status !== 'Pending' && (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && mounted && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative z-[100000]">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Từ chối yêu cầu</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lý do từ chối *</label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                                rows={4}
                                placeholder="Nhập lý do từ chối..."
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedRefundId(null);
                                    setRejectReason('');
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                disabled={processingAction}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleReject}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                disabled={processingAction}
                            >
                                {processingAction ? 'Đang xử lý...' : 'Từ chối'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

