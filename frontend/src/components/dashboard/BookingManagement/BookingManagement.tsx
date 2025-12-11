'use client';

import React, { useEffect, useState } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { requestApi } from '@/lib/api';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import BookingManagementTab from './BookingManagementTab';
import RefundManagementTab from './RefundManagement/RefundManagementTab';
import CancelBookingTab from './CancelBooking/CancelBookingTab';

interface BookingManagementProps {
  activeSubTab?: string
}

export default function BookingManagement({ activeSubTab = 'bookings' }: BookingManagementProps) {
  const [bookings, setBookings] = useState([]);
  const [bookingSearchData, setBookingSearchData] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [hasSelected, setHasSelected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);
  const [searchFields, setSearchFields] = useState({
    bookingReference: "",
    phone: "",
    email: "",
    passengerName: ""
  });

  useEffect(() => {
    loadBookingSummary();
    loadBookingSearchData();
  }, []);

  const loadBookingSummary = async () => {
    try {
      const res = await requestApi(`bookings/summary`, "GET");
      setBookings(res?.success ? res.data : []);
    } catch (error) {
      console.error(error);
      setBookings([]);
    }
  };

  const loadBookingSearchData = async () => {
    try {
      const res = await requestApi(`bookings`, "GET");
      if (res?.success) {
        setBookingSearchData(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewDetail = async (bookingId: number) => {
    try {
      const res = await requestApi(`bookings/${String(bookingId)}/detail`, "GET");
      if (res?.success) {
        setSelectedBooking(res.data);
        setIsModalOpen(true);
        setHasSelected(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const confirmDelete = (bookingId: number) => {
    setBookingToDelete(bookingId);
    setIsDeleteConfirmOpen(true);
  };

  const deleteBooking = async (id: string) => {
    try {
      const res = await requestApi(`bookings/${id}`, "DELETE");
      if (res?.success) {
        loadBookingSummary();
        setIsDeleteConfirmOpen(false);
        setBookingToDelete(null);
      } else {
        alert("Xóa thất bại");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    const filtered = bookingSearchData.filter((b: any) => {
      const fullName = `${b.user.firstName || ""} ${b.user.lastName || ""}`.toLowerCase();
      return (
        (!searchFields.bookingReference ||
          b.bookingReference.toLowerCase().includes(searchFields.bookingReference.toLowerCase())) &&
        (!searchFields.phone || b.contactPhone?.includes(searchFields.phone)) &&
        (!searchFields.email ||
          b.contactEmail?.toLowerCase().includes(searchFields.email.toLowerCase())) &&
        (!searchFields.passengerName ||
          fullName.includes(searchFields.passengerName.toLowerCase()))
      );
    });
    setBookings(filtered);
  };

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
                    name="bookingReference"
                    value={searchFields.bookingReference}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="FG240115001"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    value={searchFields.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="0901234567"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={searchFields.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="customer@email.com"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Tên hành khách</label>
                  <input
                    type="text"
                    name="passengerName"
                    value={searchFields.passengerName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    setSearchFields({ bookingReference: "", phone: "", email: "", passengerName: "" });
                    loadBookingSummary(); // load lại tất cả
                  }}
                >
                  Xóa
                </button>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>

            {/* BẢNG BOOKING */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Kết quả tìm kiếm</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Mã đặt chỗ</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Khách hàng</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Tổng tiền</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Thanh toán</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.filter((booking: any) => Array.isArray(booking.flights) && booking.flights.length > 0).map((booking: any) => (
                      <tr key={booking.bookingId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{booking.bookingReference}</div>
                              <div className="text-sm text-gray-500">{booking.bookedAt}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{booking.customerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">₫{booking.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{booking.paymentStatus}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                            {getStatusText(booking.bookingStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900"
                              onClick={() => handleViewDetail(booking.bookingId)}>
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => confirmDelete(booking.bookingId)} className="text-red-600 hover:text-red-900">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {/* 🧾 Dialog xác nhận xóa */}
                    <Dialog
                      open={isDeleteConfirmOpen}
                      onClose={() => setIsDeleteConfirmOpen(false)}
                      className="relative z-50"
                    >
                      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                      <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel className="bg-white rounded-lg shadow-lg w-[320px] p-5">
                          <div className="flex justify-between items-center mb-3">
                            <Dialog.Title className="text-lg font-semibold text-gray-800">
                              Xác nhận xóa
                            </Dialog.Title>
                            <button onClick={() => setIsDeleteConfirmOpen(false)}>
                              <XMarkIcon className="h-5 w-5 text-gray-500" />
                            </button>
                          </div>

                          <p className="text-gray-600 mb-5">
                            Bạn có chắc muốn xóa đặt chỗ này không?
                          </p>

                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => setIsDeleteConfirmOpen(false)}
                              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => bookingToDelete && deleteBooking(bookingToDelete.toString())}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Xóa
                            </button>
                          </div>
                        </Dialog.Panel>
                      </div>
                    </Dialog>

                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL CHI TIẾT */}
            {isModalOpen && hasSelected && selectedBooking.bookingId !== 0 && (
              <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                  <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 md:p-8 overflow-y-auto max-h-[90vh]">


                    {selectedBooking && (
                      <>
                        <div className="flex justify-between items-center mb-4">

                          <Dialog.Title className="text-lg font-semibold text-gray-800">
                            Chi tiết đặt chỗ {selectedBooking?.bookingReference}
                          </Dialog.Title>
                          <button onClick={() => setIsModalOpen(false)}>
                            <XMarkIcon className="h-6 w-6 text-gray-800" />
                          </button>
                        </div>
                        <p className='text-gray-800'><strong>Người đặt vé:</strong> {selectedBooking.customer.name}</p>
                        <p className='text-gray-800'><strong >Email:</strong> {selectedBooking.customer.email}</p>
                        <p className='text-gray-800'><strong className='text-gray-800'>Tổng tiền:</strong> ₫{selectedBooking.totalAmount.toLocaleString()}</p>
                        <p className='text-gray-800'><strong >Trạng thái:</strong> {selectedBooking.bookingStatus}</p>
                        <hr className="my-4" />

                        <h4 className="font-semibold text-gray-800 mb-2">Chuyến bay</h4>
                        <ul className="space-y-2">
                          {selectedBooking.flights.map((f: any, idx: any) => (
                            <li key={idx} className="border p-2 rounded-md text-gray-800 ">
                              ✈️ {f.flightNumber} - {f.route}<br />
                              Ghế: {f.seatNumber} ({f.travelClass}) | Hành lý: {f.baggage}kg<br />
                              Giờ đi: {new Date(f.departureTime).toLocaleString()} <br />
                              Giờ đến: {new Date(f.arrivalTime).toLocaleString()}
                            </li>
                          ))}
                        </ul>

                        {selectedBooking.flights?.length > 0 && (
                          <>
                            <hr className="my-4" />
                            <h4 className="font-semibold text-gray-800 mb-2">Hành khách</h4>
                            <ul className="space-y-1 text-gray-800">
                              {selectedBooking.flights.flatMap((flight: any) =>
                                flight.seatAllocations.map((sa: any, i: number) => (
                                  <li key={`${flight.flightNumber}-${i}`}>
                                    👤 {sa.passengerName} ({sa.passengerType}) –{' '}
                                    {new Date(sa.passengerDob).toLocaleDateString()} – Ghế: {sa.seatNumber}
                                  </li>
                                ))
                              )}
                            </ul>
                          </>
                        )}
                      </>
                    )}
                  </Dialog.Panel>
                </div>
              </Dialog>
            )}
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
        return <CancelBookingTab />;

      case 'bookings':
        return <BookingManagementTab />;

      case 'bookings-refund':
        return <RefundManagementTab />;

      default:
        return <BookingManagementTab />;
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
                activeSubTab === 'bookings-cancel' ? 'Nhập mã đặt chỗ để kiểm tra điều kiện hủy vé' :
                  activeSubTab === 'bookings-refund' ? 'Xử lý yêu cầu hoàn tiền' :
                    'Quản lý toàn bộ đặt chỗ và thanh toán'}
          </p>
        </div>
      </div>

      {/* Render sub-content */}
      {renderSubContent()}
    </div>
  );
}