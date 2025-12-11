'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { requestApi } from '@/lib/api';
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon, CheckIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useNotification } from '@/components/Notification';

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

export function RefundManagementTab() {
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

    // Create modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRefundId, setSelectedRefundId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [processingAction, setProcessingAction] = useState(false);

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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadRefundRequests();
    }, []);

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

    const handleCreateRefund = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateErrors({});

        // Validation
        const errors: Record<string, string> = {};
        if (!createForm.bookingReference) errors.bookingReference = 'Vui lòng nhập mã đặt chỗ';
        if (!createForm.refundReason) errors.refundReason = 'Vui lòng chọn lý do';
        if (createForm.refundReason === 'OTHER' && !createForm.customReason.trim()) {
            errors.customReason = 'Vui lòng nhập lý do cụ thể';
        }
        if (!createForm.refundAmount) errors.refundAmount = 'Vui lòng nhập số tiền';
        if (!createForm.passengerName) errors.passengerName = 'Vui lòng nhập tên hành khách';
        if (!createForm.email) errors.email = 'Vui lòng nhập email';

        if (Object.keys(errors).length > 0) {
            setCreateErrors(errors);
            return;
        }

        setProcessingAction(true);
        try {
            const res = await requestApi('refund-history', 'POST', {
                bookingReference: createForm.bookingReference,
                refundReason: createForm.refundReason,
                refundAmount: Number(createForm.refundAmount),
                passengerName: createForm.passengerName,
                email: createForm.email,
            });

            if (res?.success) {
                showNotification('success', 'Tạo yêu cầu hoàn tiền thành công!');
                setShowCreateModal(false);
                setCreateForm({
                    bookingReference: '',
                    refundReason: '',
                    refundAmount: '',
                    passengerName: '',
                    email: '',
                    customReason: '',
                });
                loadRefundRequests();
            } else {
                showNotification('error', res?.message || 'Có lỗi xảy ra');
            }
        } catch (error: any) {
            showNotification('error', error?.message || 'Có lỗi xảy ra khi tạo yêu cầu');
        } finally {
            setProcessingAction(false);
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
                    const res = await requestApi(`refund-history/${refundHistoryId}`, 'PATCH', {
                        status: 'Approved',
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
            const res = await requestApi(`refund-history/${selectedRefundId}`, 'PATCH', {
                status: 'Rejected',
                adminNotes: rejectReason,
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
                req.email.toLowerCase().includes(search) ||
                req.phone.includes(search);
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
            {/* Header with Create Button */}
            <div className="flex justify-between items-center">

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Tạo yêu cầu hoàn tiền
                </button>
            </div>

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

            {/* Create Refund Modal */}
            {showCreateModal && mounted && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto relative z-[100000]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Tạo yêu cầu hoàn tiền</h3>
                            <button onClick={() => setShowCreateModal(false)}>
                                <XMarkIcon className="h-6 w-6 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateRefund} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã đặt chỗ *</label>
                                    <input
                                        type="text"
                                        value={createForm.bookingReference}
                                        onChange={(e) => setCreateForm({ ...createForm, bookingReference: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${createErrors.bookingReference ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Nhập mã đặt chỗ (VD: BK1A2B3C4D)"
                                    />
                                    {createErrors.bookingReference && <p className="text-red-500 text-sm mt-1">{createErrors.bookingReference}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lý do hoàn tiền *</label>
                                    <select
                                        value={createForm.refundReason}
                                        onChange={(e) => setCreateForm({ ...createForm, refundReason: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${createErrors.refundReason ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Chọn lý do</option>
                                        {Object.entries(REFUND_REASON_LABELS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                    {createErrors.refundReason && <p className="text-red-500 text-sm mt-1">{createErrors.refundReason}</p>}
                                </div>
                                {/* Custom Reason Textarea - Only show when OTHER is selected */}
                                {createForm.refundReason === 'OTHER' && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Lý do cụ thể *</label>
                                        <textarea
                                            value={createForm.customReason}
                                            onChange={(e) => setCreateForm({ ...createForm, customReason: e.target.value })}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${createErrors.customReason ? 'border-red-500' : 'border-gray-300'}`}
                                            rows={3}
                                            placeholder="Nhập lý do cụ thể cho yêu cầu hoàn tiền..."
                                        />
                                        {createErrors.customReason && <p className="text-red-500 text-sm mt-1">{createErrors.customReason}</p>}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền hoàn (₫) *</label>
                                    <input
                                        type="number"
                                        value={createForm.refundAmount}
                                        onChange={(e) => setCreateForm({ ...createForm, refundAmount: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${createErrors.refundAmount ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {createErrors.refundAmount && <p className="text-red-500 text-sm mt-1">{createErrors.refundAmount}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên hành khách *</label>
                                    <input
                                        type="text"
                                        value={createForm.passengerName}
                                        onChange={(e) => setCreateForm({ ...createForm, passengerName: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${createErrors.passengerName ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {createErrors.passengerName && <p className="text-red-500 text-sm mt-1">{createErrors.passengerName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        value={createForm.email}
                                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${createErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {createErrors.email && <p className="text-red-500 text-sm mt-1">{createErrors.email}</p>}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    disabled={processingAction}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    disabled={processingAction}
                                >
                                    {processingAction ? 'Đang xử lý...' : 'Tạo yêu cầu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

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
