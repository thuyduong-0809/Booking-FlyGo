'use client';

import React, { useEffect, useState } from 'react';
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
import { requestApi } from '@/lib/api';
import { set } from 'date-fns';
import { Dialog } from '@headlessui/react';
import {XMarkIcon } from '@heroicons/react/24/outline';

// Extended interfaces for local state management
// interface ExtendedBooking extends Booking {
//   customerName: string;
//   flightNumber: string;
//   route: string;
//   departureTime: string;
//   bookingDate: string;
// }

interface ExtendedPassenger extends Passenger {
  bookingReference: string;
}

interface ExtendedPayment extends Payment {
  bookingReference: string;
}

interface BookingManagementProps { activeSubTab?: string }

export default function BookingManagement({ activeSubTab = 'bookings' }: BookingManagementProps) {
  // const [bookings, setBookings] = useState<ExtendedBooking[]>([
  //   {
  //     BookingID: 1,
  //     BookingReference: 'FG240115001',
  //     UserID: 1,
  //     TotalAmount: 5000000,
  //     PaymentStatus: 'Paid',
  //     BookingStatus: 'Confirmed',
  //     ContactEmail: 'nguyenvana@email.com',
  //     ContactPhone: '0901234567',
  //     SpecialRequests: '',
  //     BookedAt: '2024-01-15T08:30:00Z',
  //     customerName: 'Nguyễn Văn A',
  //     flightNumber: 'VN001',
  //     route: 'SGN → HAN',
  //     departureTime: '08:30',
  //     bookingDate: '2024-01-15'
  //   },
  //   {
  //     BookingID: 2,
  //     BookingReference: 'FG240115002',
  //     UserID: 2,
  //     TotalAmount: 2500000,
  //     PaymentStatus: 'Pending',
  //     BookingStatus: 'Reserved',
  //     ContactEmail: 'tranthib@email.com',
  //     ContactPhone: '0901234568',
  //     SpecialRequests: '',
  //     BookedAt: '2024-01-15T11:45:00Z',
  //     customerName: 'Trần Thị B',
  //     flightNumber: 'VN002',
  //     route: 'HAN → DAD',
  //     departureTime: '11:45',
  //     bookingDate: '2024-01-15'
  //   },
  //   {
  //     BookingID: 3,
  //     BookingReference: 'FG240115003',
  //     UserID: 3,
  //     TotalAmount: 7500000,
  //     PaymentStatus: 'Paid',
  //     BookingStatus: 'Confirmed',
  //     ContactEmail: 'levanc@email.com',
  //     ContactPhone: '0901234569',
  //     SpecialRequests: 'Vegetarian meal',
  //     BookedAt: '2024-01-15T14:00:00Z',
  //     customerName: 'Lê Văn C',
  //     flightNumber: 'VN003',
  //     route: 'DAD → SGN',
  //     departureTime: '14:00',
  //     bookingDate: '2024-01-15'
  //   }
  // ]);

  const [bookings,setBookings] = useState([])

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

  useEffect(()=>{
    loadBookingSummary()
    loadBookingSearchData()
  },[])

    const loadBookingSummary = async () => {
  
      await requestApi(`bookings/summary`, "GET").then((res: any) => {
        if (res.success) {
           setBookings(res.data)
        } else {
           setBookings([])
        }
      }).catch((error: any) => {
        console.error(error)
      });
    }

  const [selectedBooking, setSelectedBooking] =useState({
  bookingId: 0,
  bookingReference: '',
  bookedAt: '',
  totalAmount: '',
  bookingStatus: '',
  paymentStatus: '',
  customer: {
    name: '',
    email: '',
  },
  flights: [
    {
      flightNumber: '',
      route: '',
      departureTime: '',
      arrivalTime: '',
      travelClass: '',
      baggage: 0,
      seatAllocations: [
        {
          seatNumber: '',
          passengerName: '',
          passengerType: '',
          passengerDob: '',
        },
      ],
    },
  ],
});
const [hasSelected, setHasSelected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
    const handleViewDetail = async (bookingId:number)=>{
      await requestApi(`bookings/${String(bookingId)}/detail`, "GET").then((res: any) => {
        if (res.success) {
            setSelectedBooking(res.data)
            setIsModalOpen(true);
            setHasSelected(true);  
        } else {
            setIsModalOpen(false)
        }
      }).catch((error: any) => {
        console.error(error)
      });
    }

  const [bookingSearchData,setBookingSearchData] = useState([]);

  const loadBookingSearchData = async ()=>{
      
      await requestApi(`bookings`, "GET").then((res: any) => {
        if (res.success) {
            setBookingSearchData(res.data)
            setIsModalOpen(true);
        } else {
            // setSelectedBooking()
        }
      }).catch((error: any) => {
        console.error(error)
      });
    }



    

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

  const filteredBookings = bookings.filter((booking:any) => {
    const matchesSearch = booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.flightNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || booking.bookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });
 const confirmDelete = (bookingId: number) => {
    setBookingToDelete(bookingId);
    setIsDeleteConfirmOpen(true);
  };

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);

    const deleteBooking = (id: string): void => {
      requestApi(`bookings/${id}`, "DELETE").then((res: any) => {
        if (res.success) {
           loadBookingSummary();
            setIsDeleteConfirmOpen(false);
            setBookingToDelete(null);
        } else {
          alert("Xóa thất bại");
        }
      }).catch((error: any) => console.log(error))
    }


  const [searchFields, setSearchFields] = useState({
  bookingReference: "",
  phone: "",
  email: "",
  passengerName: ""
  });

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
                {bookings.filter((booking: any) => Array.isArray(booking.flights) && booking.flights.length > 0).map((booking:any) => (
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
                              onClick={()=>handleViewDetail(booking.bookingId)}>
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button onClick={()=>confirmDelete(booking.bookingId)} className="text-red-600 hover:text-red-900">
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
                <p  className='text-gray-800'><strong>Người đặt vé:</strong> {selectedBooking.customer.name}</p>
                <p className='text-gray-800'><strong >Email:</strong> {selectedBooking.customer.email}</p>
                <p className='text-gray-800'><strong className='text-gray-800'>Tổng tiền:</strong> ₫{selectedBooking.totalAmount.toLocaleString()}</p>
                <p className='text-gray-800'><strong >Trạng thái:</strong> {selectedBooking.bookingStatus}</p>
                <hr className="my-4" />

                <h4 className="font-semibold text-gray-800 mb-2">Chuyến bay</h4>
                <ul className="space-y-2">
                  {selectedBooking.flights.map((f:any, idx:any) => (
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
                    {selectedBooking.flights.flatMap((flight) =>
                      flight.seatAllocations.map((sa, i) => (
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
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Mã đặt chỗ</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Người đặt vé</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Tổng tiền</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Thanh toán</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking:any) => (
                      <tr key={booking.bookingId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-800">{booking.bookingReference}</div>
                              <div className="text-sm  text-gray-800">{booking.bookedAt}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap  text-gray-800">{booking.customerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap  text-gray-800">₫{booking.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap  text-gray-800">{booking.paymentStatus}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                                {getStatusText(booking.bookingStatus)}
                              </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <button className="text-blue-600 hover:text-blue-900"
                                  onClick={()=>handleViewDetail(booking.bookingId)}>
                                    <EyeIcon className="h-5 w-5" />
                                  </button>
                                  <button className="text-green-600 hover:text-green-900">
                                    <PencilIcon className="h-5 w-5" />
                                  </button>
                                  <button className="text-red-600 hover:text-red-900"
                                  onClick={()=>confirmDelete(booking.bookingId)}>
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              </td>
                      </tr>
                    ))}
                                                      {/* Dialog xác nhận xóa */}
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
                <p  className='text-gray-800'><strong>Người đặt vé:</strong> {selectedBooking.customer.name}</p>
                <p className='text-gray-800'><strong >Email:</strong> {selectedBooking.customer.email}</p>
                <p className='text-gray-800'><strong className='text-gray-800'>Tổng tiền:</strong> ₫{selectedBooking.totalAmount.toLocaleString()}</p>
                <p className='text-gray-800'><strong >Trạng thái:</strong> {selectedBooking.bookingStatus}</p>
                <hr className="my-4" />

                <h4 className="font-semibold text-gray-800 mb-2">Chuyến bay</h4>
                <ul className="space-y-2">
                  {selectedBooking.flights.map((f:any, idx:any) => (
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
                    {selectedBooking.flights.flatMap((flight) =>
                      flight.seatAllocations.map((sa, i) => (
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