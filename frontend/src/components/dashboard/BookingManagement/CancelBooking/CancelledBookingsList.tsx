'use client';

import React, { useState, useEffect } from 'react';
import { requestApi } from '@/lib/api';
import { useNotification } from '@/components/Notification';
import { ArrowUpIcon, ArrowDownIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface CancelledBooking {
    cancelHistoryId: number;
    bookingId: number;
    bookingReference: string;
    cancellationFee: number;
    refundAmount: number;
    totalAmount: number;
    reason: string;
    cancelledAt: string;
    cancelledBy?: string;
    booking?: {
        user?: {
            firstName: string;
            lastName: string;
            email: string;
        };
        contactEmail?: string;
        paymentStatus?: string;
        bookingFlights?: Array<{
            travelClass?: string;
            flight?: {
                flightNumber: string;
                departureTime: string;
            };
        }>;
    };
}

export default function CancelledBookingsList() {
    const { showNotification } = useNotification();
    const [bookings, setBookings] = useState<CancelledBooking[]>([]);
    const [loading, setLoading] = useState(false);
    const [sortField, setSortField] = useState<string>('cancelledAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Filter state
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Load cancelled bookings from cancel-history API
    const loadCancelledBookings = async () => {
        setLoading(true);
        try {
            const res = await requestApi('cancel-history', 'GET');
            const cancelHistory = Array.isArray(res) ? res : (res?.data || []);
            setBookings(cancelHistory);
        } catch (error: any) {

            showNotification('error', 'Không thể tải danh sách booking đã hủy');
        } finally {
            setLoading(false);
        }
    };

    // Sort handler
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    // Sort icon component
    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) {
            return <ArrowUpIcon className="h-4 w-4 text-gray-400" />;
        }
        return sortDirection === 'asc'
            ? <ArrowUpIcon className="h-4 w-4 text-blue-600" />
            : <ArrowDownIcon className="h-4 w-4 text-blue-600" />;
    };

    // Filter bookings
    const filteredBookings = bookings.filter((booking) => {
        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            const matchesSearch =
                booking.bookingReference.toLowerCase().includes(search) ||
                booking.reason?.toLowerCase().includes(search) ||
                booking.booking?.user?.firstName?.toLowerCase().includes(search) ||
                booking.booking?.user?.lastName?.toLowerCase().includes(search) ||
                booking.booking?.contactEmail?.toLowerCase().includes(search);

            if (!matchesSearch) return false;
        }

        // Status filter
        if (filterStatus !== 'all') {
            if (filterStatus === 'refunded' && booking.booking?.paymentStatus !== 'Refunded') return false;
            if (filterStatus === 'pending' && booking.booking?.paymentStatus === 'Refunded') return false;
        }

        return true;
    });

    // Sort bookings
    const sortedBookings = [...filteredBookings].sort((a, b) => {
        if (!sortField) return 0;

        let aVal: any = a[sortField as keyof CancelledBooking];
        let bVal: any = b[sortField as keyof CancelledBooking];

        // Handle date fields
        if (sortField === 'cancelledAt') {
            aVal = new Date(aVal || 0).getTime();
            bVal = new Date(bVal || 0).getTime();
        }

        // Handle numeric fields
        if (sortField === 'totalAmount' || sortField === 'cancellationFee' || sortField === 'refundAmount') {
            aVal = Number(aVal || 0);
            bVal = Number(bVal || 0);
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // Load on mount
    useEffect(() => {
        loadCancelledBookings();
    }, []);

    // Status badge color
    const getPaymentStatusColor = (status?: string) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-700';
            case 'Refunded': return 'bg-blue-100 text-blue-700';
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Danh sách booking đã hủy</h3>
                    <p className="text-sm text-gray-600">Tổng số: {filteredBookings.length}/{bookings.length} booking</p>
                </div>
                <button
                    onClick={loadCancelledBookings}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={loading}
                >
                    {loading ? 'Đang tải...' : 'Làm mới'}
                </button>
            </div>

            {/* Filters - Always visible */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                        <input
                            type="text"
                            placeholder="Mã đặt chỗ, tên hành khách, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái hoàn tiền</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        >
                            <option value="all">Tất cả</option>
                            <option value="refunded">Đã hoàn tiền</option>
                            <option value="pending">Chưa hoàn tiền</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Đang tải...</div>
                ) : sortedBookings.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        {searchTerm || filterStatus !== 'all'
                            ? 'Không tìm thấy booking nào phù hợp'
                            : 'Không có booking đã hủy nào'
                        }
                    </div>
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
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                                    Hành khách
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                                    Chuyến bay
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                                    Lý do hủy
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSort('totalAmount')}
                                >
                                    <div className="flex items-center gap-1">
                                        Tổng tiền
                                        <SortIcon field="totalAmount" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSort('cancellationFee')}
                                >
                                    <div className="flex items-center gap-1">
                                        Phí hủy
                                        <SortIcon field="cancellationFee" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSort('refundAmount')}
                                >
                                    <div className="flex items-center gap-1">
                                        Số tiền hoàn
                                        <SortIcon field="refundAmount" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">
                                    Trạng thái
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => handleSort('cancelledAt')}
                                >
                                    <div className="flex items-center gap-1">
                                        Ngày hủy
                                        <SortIcon field="cancelledAt" />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedBookings.map((booking) => (
                                <tr key={booking.cancelHistoryId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {booking.bookingReference}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {booking.booking?.user?.firstName} {booking.booking?.user?.lastName}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {booking.booking?.contactEmail || booking.booking?.user?.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {booking.booking?.bookingFlights && booking.booking.bookingFlights.length > 0 ? (
                                            <div>
                                                <div className="text-sm text-gray-900">
                                                    {booking.booking.bookingFlights[0].flight?.flightNumber}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {booking.booking.bookingFlights[0].travelClass}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate" title={booking.reason}>
                                            {booking.reason || 'Không rõ'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {booking.totalAmount.toLocaleString('vi-VN')}đ
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                        {booking.cancellationFee.toLocaleString('vi-VN')}đ
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                        {booking.refundAmount.toLocaleString('vi-VN')}đ
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.booking?.paymentStatus)}`}>
                                            {booking.booking?.paymentStatus || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(booking.cancelledAt).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
