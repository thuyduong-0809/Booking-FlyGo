'use client';

import { useEffect, useState } from 'react';
import { requestApi } from '@/lib/api';
import { MagnifyingGlassIcon, FunnelIcon, EyeIcon, XMarkIcon, CurrencyDollarIcon, DocumentTextIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Booking {
    bookingId: number;
    bookingReference: string;
    bookingStatus: string;
    paymentStatus: string;
    totalAmount: number;
    bookingDate: string;
    user: {
        userId: number;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
    };
    bookingFlights: Array<{
        bookingFlightId: number;
        seatNumber: string;
        flight: {
            flightNumber: string;
            departureTime: string;
            arrivalTime: string;
            departureAirport: {
                airportCode: string;
                city: string;
            };
            arrivalAirport: {
                airportCode: string;
                city: string;
            };
        };
    }>;
}

export default function BookingManagementTab() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        setLoading(true);
        try {
            const res = await requestApi('bookings', 'GET');
            if (res?.success) {
                setBookings(res.data || []);
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'text-green-600 bg-green-100';
            case 'Pending': return 'text-yellow-600 bg-yellow-100';
            case 'Cancelled': return 'text-red-600 bg-red-100';
            case 'Completed': return 'text-blue-600 bg-blue-100';
            case 'Refunded': return 'text-purple-600 bg-purple-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'Paid': return 'Đã thanh toán';
            case 'Pending': return 'Chờ thanh toán';
            case 'Cancelled': return 'Đã hủy';
            case 'Completed': return 'Hoàn thành';
            case 'Refunded': return 'Đã hoàn tiền';
            default: return status;
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${booking.user.firstName} ${booking.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || booking.bookingStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Statistics
    const stats = {
        total: bookings.length,
        revenue: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
        cancelled: bookings.filter(b => b.bookingStatus === 'Cancelled').length,
        pending: bookings.filter(b => b.paymentStatus === 'Pending').length,
    };

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tổng đặt chỗ</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                            <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                            <p className="text-2xl font-bold text-gray-900">₫{(stats.revenue / 1000000).toFixed(1)}M</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                            <XMarkIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Đã hủy</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                            <ClockIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Chờ thanh toán</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã đặt chỗ, tên, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="Paid">Đã thanh toán</option>
                        <option value="Pending">Chờ thanh toán</option>
                        <option value="Cancelled">Đã hủy</option>
                        <option value="Completed">Hoàn thành</option>
                    </select>
                    <button
                        onClick={loadBookings}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Danh sách đặt chỗ ({filteredBookings.length})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Đang tải...</div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Không có đặt chỗ nào</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Mã đặt chỗ</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Hành khách</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Chuyến bay</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Ngày đặt</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Tổng tiền</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.bookingId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {booking.bookingReference}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{booking.user.firstName} {booking.user.lastName}</div>
                                            <div className="text-xs text-gray-500">{booking.user.email}</div>
                                            <div className="text-xs text-gray-500">{booking.user.phoneNumber}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.bookingFlights?.map((bf, idx) => (
                                                <div key={idx} className="text-sm text-gray-900">
                                                    {bf.flight.flightNumber}: {bf.flight.departureAirport.airportCode} → {bf.flight.arrivalAirport.airportCode}
                                                </div>
                                            )) || <span className="text-gray-400">—</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ₫{booking.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                                                {getStatusText(booking.bookingStatus)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setShowDetailsModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Xem chi tiết"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Chi tiết đặt chỗ</h3>
                            <button onClick={() => setShowDetailsModal(false)}>
                                <XMarkIcon className="h-6 w-6 text-gray-500" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Mã đặt chỗ</p>
                                <p className="text-lg font-semibold text-gray-900">{selectedBooking.bookingReference}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Hành khách</p>
                                <p className="text-gray-900">{selectedBooking.user.firstName} {selectedBooking.user.lastName}</p>
                                <p className="text-sm text-gray-500">{selectedBooking.user.email}</p>
                                <p className="text-sm text-gray-500">{selectedBooking.user.phoneNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Chuyến bay</p>
                                {selectedBooking.bookingFlights?.map((bf, idx) => (
                                    <div key={idx} className="mt-2 p-3 bg-gray-50 rounded-lg">
                                        <p className="font-medium">{bf.flight.flightNumber}</p>
                                        <p className="text-sm">{bf.flight.departureAirport.city} ({bf.flight.departureAirport.airportCode}) → {bf.flight.arrivalAirport.city} ({bf.flight.arrivalAirport.airportCode})</p>
                                        <p className="text-sm text-gray-600">Ghế: {bf.seatNumber}</p>
                                    </div>
                                )) || <p className="text-gray-400">Không có thông tin chuyến bay</p>}
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
