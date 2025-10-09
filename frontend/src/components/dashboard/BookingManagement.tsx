'use client';

import React, { useState } from 'react';
import { 
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { 
  Booking, 
  Passenger, 
  BookingFlight, 
  Flight, 
  User,
  Payment 
} from '../../types/database';

// Extended interfaces for local state management
interface ExtendedBooking extends Booking {
  customerName: string;
  flightNumber: string;
  route: string;
  departureTime: string;
  bookingDate: string;
}

interface ExtendedPassenger extends Passenger {
  bookingReference: string;
}

interface ExtendedPayment extends Payment {
  bookingReference: string;
}

interface BookingManagementProps { activeSubTab?: string }

export default function BookingManagement({ activeSubTab = 'bookings' }: BookingManagementProps) {
  const [bookings, setBookings] = useState<ExtendedBooking[]>([
    {
      BookingID: 1,
      BookingReference: 'FG240115001',
      UserID: 1,
      TotalAmount: 5000000,
      PaymentStatus: 'Paid',
      BookingStatus: 'Confirmed',
      ContactEmail: 'nguyenvana@email.com',
      ContactPhone: '0901234567',
      SpecialRequests: '',
      BookedAt: '2024-01-15T08:30:00Z',
      customerName: 'Nguyễn Văn A',
      flightNumber: 'VN001',
      route: 'SGN → HAN',
      departureTime: '08:30',
      bookingDate: '2024-01-15'
    },
    {
      BookingID: 2,
      BookingReference: 'FG240115002',
      UserID: 2,
      TotalAmount: 2500000,
      PaymentStatus: 'Pending',
      BookingStatus: 'Reserved',
      ContactEmail: 'tranthib@email.com',
      ContactPhone: '0901234568',
      SpecialRequests: '',
      BookedAt: '2024-01-15T11:45:00Z',
      customerName: 'Trần Thị B',
      flightNumber: 'VN002',
      route: 'HAN → DAD',
      departureTime: '11:45',
      bookingDate: '2024-01-15'
    },
    {
      BookingID: 3,
      BookingReference: 'FG240115003',
      UserID: 3,
      TotalAmount: 7500000,
      PaymentStatus: 'Paid',
      BookingStatus: 'Confirmed',
      ContactEmail: 'levanc@email.com',
      ContactPhone: '0901234569',
      SpecialRequests: 'Vegetarian meal',
      BookedAt: '2024-01-15T14:00:00Z',
      customerName: 'Lê Văn C',
      flightNumber: 'VN003',
      route: 'DAD → SGN',
      departureTime: '14:00',
      bookingDate: '2024-01-15'
    }
  ]);

  const [passengers, setPassengers] = useState<ExtendedPassenger[]>([
    {
      PassengerID: 1,
      BookingID: 1,
      FirstName: 'Nguyễn Văn',
      LastName: 'A',
      DateOfBirth: '1990-01-01',
      PassportNumber: 'N1234567',
      PassengerType: 'Adult',
      bookingReference: 'FG240115001'
    },
    {
      PassengerID: 2,
      BookingID: 1,
      FirstName: 'Nguyễn Thị',
      LastName: 'B',
      DateOfBirth: '1992-05-15',
      PassportNumber: 'N1234568',
      PassengerType: 'Adult',
      bookingReference: 'FG240115001'
    }
  ]);

  const [payments, setPayments] = useState<ExtendedPayment[]>([
    {
      PaymentID: 1,
      BookingID: 1,
      Amount: 5000000,
      PaymentMethod: 'CreditCard',
      PaymentStatus: 'Completed',
      TransactionID: 'TXN001',
      PaymentDetails: { cardLast4: '1234' },
      PaidAt: '2024-01-15T08:30:00Z',
      bookingReference: 'FG240115001'
    },
    {
      PaymentID: 2,
      BookingID: 2,
      Amount: 2500000,
      PaymentMethod: 'BankTransfer',
      PaymentStatus: 'Pending',
      TransactionID: 'TXN002',
      PaymentDetails: { bankCode: 'VCB' },
      PaidAt: '',
      bookingReference: 'FG240115002'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'text-green-600 bg-green-100';
      case 'Reserved': return 'text-blue-600 bg-blue-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'Paid': return 'text-green-600 bg-green-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Failed': return 'text-red-600 bg-red-100';
      case 'Refunded': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'Đã xác nhận';
      case 'Reserved': return 'Đã đặt chỗ';
      case 'Cancelled': return 'Đã hủy';
      case 'Completed': return 'Hoàn thành';
      case 'Paid': return 'Đã thanh toán';
      case 'Pending': return 'Chờ thanh toán';
      case 'Failed': return 'Thanh toán thất bại';
      case 'Refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.BookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.flightNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || booking.BookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Render content based on active sub-tab
  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'bookings-search':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tìm kiếm đặt chỗ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Mã đặt chỗ</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="FG240115001"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="0901234567"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="customer@email.com"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Tên hành khách</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Xóa
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Tìm kiếm
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Kết quả tìm kiếm</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Mã đặt chỗ</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Chuyến bay</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.BookingID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.BookingReference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.flightNumber} - {booking.route}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₫{booking.TotalAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.BookingStatus)}`}>
                            {getStatusText(booking.BookingStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <PencilIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'bookings-create':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo đặt chỗ mới</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Chuyến bay</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn chuyến bay</option>
                    <option value="VN001">VN001 - SGN → HAN</option>
                    <option value="VN002">VN002 - HAN → DAD</option>
                    <option value="VN003">VN003 - DAD → SGN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Hạng vé</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn hạng vé</option>
                    <option value="Economy">Economy</option>
                    <option value="Business">Business</option>
                    <option value="First">First</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Tên khách hàng</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="customer@email.com"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="0901234567"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số lượng hành khách</label>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="1"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Tạo đặt chỗ
                </button>
              </div>
            </div>
          </div>
        );

      case 'bookings-cancel':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hủy đặt chỗ</h3>
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Việc hủy đặt chỗ có thể áp dụng phí hủy chuyến bay theo quy định.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Mã đặt chỗ</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="FG240115001"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Lý do hủy</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn lý do</option>
                    <option value="Personal">Lý do cá nhân</option>
                    <option value="Emergency">Khẩn cấp</option>
                    <option value="Weather">Thời tiết</option>
                    <option value="Other">Khác</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-md font-medium text-gray-700 mb-1">Ghi chú thêm</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    rows={3}
                    placeholder="Mô tả chi tiết lý do hủy chuyến bay..."
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        );

      case 'bookings-refund':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Yêu cầu hoàn tiền</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Mã đặt chỗ</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="FG240115001"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số tiền hoàn</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="5000000"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Phương thức hoàn tiền</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn phương thức</option>
                    <option value="CreditCard">Thẻ tín dụng</option>
                    <option value="BankTransfer">Chuyển khoản</option>
                    <option value="Cash">Tiền mặt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Lý do hoàn tiền</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn lý do</option>
                    <option value="Cancellation">Hủy chuyến bay</option>
                    <option value="Delay">Chậm chuyến bay</option>
                    <option value="Overbooking">Overbooking</option>
                    <option value="Other">Khác</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-md font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    rows={3}
                    placeholder="Mô tả chi tiết lý do yêu cầu hoàn tiền..."
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Gửi yêu cầu
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử hoàn tiền</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Mã đặt chỗ</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Phương thức</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Ngày yêu cầu</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.PaymentID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.bookingReference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₫{payment.Amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.PaymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.PaymentStatus)}`}>
                            {getStatusText(payment.PaymentStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.PaidAt ? new Date(payment.PaidAt).toLocaleDateString('vi-VN') : 'Chưa xử lý'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm đặt chỗ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Confirmed">Đã xác nhận</option>
                  <option value="Reserved">Đã đặt chỗ</option>
                  <option value="Cancelled">Đã hủy</option>
                  <option value="Completed">Hoàn thành</option>
                </select>
              </div>
            </div>

            {/* Bookings List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách đặt chỗ</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Mã đặt chỗ
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Khách hàng
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Chuyến bay
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Tổng tiền
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.BookingID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{booking.BookingReference}</div>
                              <div className="text-sm text-gray-500">{booking.bookingDate}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.flightNumber} - {booking.route}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₫{booking.TotalAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.BookingStatus)}`}>
                            {getStatusText(booking.BookingStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {activeSubTab === 'bookings-search' ? 'Tìm kiếm đặt chỗ' :
             activeSubTab === 'bookings-create' ? 'Tạo đặt chỗ mới' :
             activeSubTab === 'bookings-cancel' ? 'Hủy đặt chỗ' :
             activeSubTab === 'bookings-refund' ? 'Yêu cầu hoàn tiền' :
             'Quản lý đặt chỗ'}
          </h2>
          <p className="text-gray-600">
            {activeSubTab === 'bookings-search' ? 'Tìm kiếm và xem thông tin đặt chỗ' :
             activeSubTab === 'bookings-create' ? 'Tạo đặt chỗ mới cho khách hàng' :
             activeSubTab === 'bookings-cancel' ? 'Hủy đặt chỗ và xử lý hoàn tiền' :
             activeSubTab === 'bookings-refund' ? 'Xử lý yêu cầu hoàn tiền' :
             'Quản lý toàn bộ đặt chỗ và thanh toán'}
          </p>
        </div>
        {activeSubTab === 'bookings' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tạo đặt chỗ
          </button>
        )}
      </div>

      {/* Render sub-content */}
      {renderSubContent()}

      {/* Add Booking Modal - only show for main bookings tab */}
      {activeSubTab === 'bookings' && showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo đặt chỗ mới</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Chuyến bay</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Chọn chuyến bay</option>
                  <option value="VN001">VN001 - SGN → HAN</option>
                  <option value="VN002">VN002 - HAN → DAD</option>
                  <option value="VN003">VN003 - DAD → SGN</option>
                </select>
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Hạng vé</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Chọn hạng vé</option>
                  <option value="Economy">Economy</option>
                  <option value="Business">Business</option>
                  <option value="First">First</option>
                </select>
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Tên khách hàng</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="customer@email.com"
                />
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="0901234567"
                />
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Số lượng hành khách</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="1"
                />
              </div>
            </form>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tạo đặt chỗ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}