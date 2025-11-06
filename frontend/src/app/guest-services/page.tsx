'use client';

import { useState } from 'react';
import { requestApi } from '@/lib/api';
import { useNotification } from '@/components/Notification';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BookingDetail {
  bookingId: number;
  bookingReference: string;
  contactEmail: string;
  contactPhone: string;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  bookedAt: string;
  bookingFlights: any[];
  passengers: any[];
  payments: any[];
}

export default function GuestServicesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'lookup' | 'checkin'>('lookup');
  const [lookupMethod, setLookupMethod] = useState<'pnr' | 'email'>('pnr');
  
  // For PNR lookup
  const [pnr, setPnr] = useState('');
  const [email, setEmail] = useState('');
  
  // For email/phone lookup
  const [searchEmail, setSearchEmail] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [bookingData, setBookingData] = useState<BookingDetail | null>(null);
  const { showNotification } = useNotification();

  const handlePNRLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pnr.trim() || !email.trim()) {
      showNotification('error', 'Vui lòng nhập đầy đủ mã PNR và email');
      return;
    }

    setIsLoading(true);
    setBookingData(null);

    try {
      const response = await requestApi(
        `bookings/guest/lookup?bookingReference=${pnr.trim()}&email=${email.trim()}`,
        'GET'
      );

      if (response.success && response.data) {
        setBookingData(response.data);
        showNotification('success', 'Tìm thấy thông tin đặt chỗ!');
      } else {
        showNotification('error', response.message || 'Không tìm thấy đặt chỗ');
      }
    } catch (error: any) {
      console.error('Error looking up booking:', error);
      showNotification('error', 'Lỗi khi tra cứu đặt chỗ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'Reserved': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Confirmed': 'bg-green-100 text-green-800 border-green-300',
      'Cancelled': 'bg-red-100 text-red-800 border-red-300',
      'Completed': 'bg-blue-100 text-blue-800 border-blue-300',
      'Pending': 'bg-orange-100 text-orange-800 border-orange-300',
      'Paid': 'bg-green-100 text-green-800 border-green-300',
      'Failed': 'bg-red-100 text-red-800 border-red-300',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const handleDownloadInvoice = () => {
    if (!bookingData) return;
    
    // Generate simple invoice
    const invoiceContent = `
╔════════════════════════════════════════════════╗
║           HÓA ĐƠN ĐẶT VÉ MÁY BAY               ║
╚════════════════════════════════════════════════╝

MÃ ĐẶT CHỖ (PNR): ${bookingData.bookingReference}
NGÀY ĐẶT: ${formatDate(bookingData.bookedAt)}

────────────────────────────────────────────────
THÔNG TIN LIÊN HỆ
────────────────────────────────────────────────
Email: ${bookingData.contactEmail}
Điện thoại: ${bookingData.contactPhone}

────────────────────────────────────────────────
CHI TIẾT CHUYẾN BAY
────────────────────────────────────────────────
${bookingData.bookingFlights.map((bf, idx) => `
Chuyến bay ${idx + 1}: ${bf.flight?.flightNumber || 'N/A'}
Tuyến: ${bf.flight?.departureAirport?.airportCode} → ${bf.flight?.arrivalAirport?.airportCode}
Khởi hành: ${formatDate(bf.flight?.departureTime)}
Hạng vé: ${bf.travelClass || 'Economy'}
`).join('\n')}

────────────────────────────────────────────────
DANH SÁCH HÀNH KHÁCH (${bookingData.passengers.length})
────────────────────────────────────────────────
${bookingData.passengers.map((p, idx) => `
${idx + 1}. ${p.firstName} ${p.lastName} (${p.passengerType})
`).join('')}

────────────────────────────────────────────────
THANH TOÁN
────────────────────────────────────────────────
Tổng tiền: ${formatVnd(bookingData.totalAmount)} VNĐ
Trạng thái: ${bookingData.paymentStatus}
Trạng thái booking: ${bookingData.bookingStatus}

════════════════════════════════════════════════
Cảm ơn quý khách đã sử dụng dịch vụ!
    `;

    // Create and download
    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${bookingData.bookingReference}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('success', 'Hóa đơn đã được tải xuống!');
  };

  const handleCheckIn = () => {
    if (!bookingData) return;
    
    // Navigate to check-in page with booking data
    router.push(`/check-in?pnr=${bookingData.bookingReference}&email=${bookingData.contactEmail}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 py-12 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    Dịch Vụ Khách Hàng
                  </h1>
                  <p className="text-blue-100 text-lg mt-1">
                    Tra cứu & Quản lý đặt vé của bạn
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/"
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Trang Chủ
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg flex gap-2">
            <button
              onClick={() => setActiveTab('lookup')}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                activeTab === 'lookup'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Tra Cứu Đặt Vé
              </div>
            </button>
            <button
              onClick={() => setActiveTab('checkin')}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                activeTab === 'checkin'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Check-in Online
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'lookup' && (
          <div className="max-w-4xl mx-auto">
            {/* Lookup Method Toggle */}
            <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setLookupMethod('pnr')}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                    lookupMethod === 'pnr'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tra cứu bằng Mã PNR
                </button>
                <button
                  onClick={() => setLookupMethod('email')}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                    lookupMethod === 'email'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tra cứu bằng Email/SĐT
                </button>
              </div>

              <form onSubmit={handlePNRLookup} className="space-y-6">
                {lookupMethod === 'pnr' ? (
                  <>
                    <div>
                      <label className="block text-lg font-bold text-gray-800 mb-2">
                        Mã Đặt Chỗ (PNR) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={pnr}
                        onChange={(e) => setPnr(e.target.value.toUpperCase())}
                        placeholder="VD: BK1A2B3C4D"
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all uppercase text-lg"
                        maxLength={10}
                      />
                      <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Mã PNR được gửi qua email sau khi đặt vé thành công
                      </p>
                    </div>

                    <div>
                      <label className="block text-lg font-bold text-gray-800 mb-2">
                        Email Đặt Vé <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-lg font-bold text-gray-800 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg"
                      />
                    </div>

                    <div className="text-center text-gray-500 font-semibold">
                      HOẶC
                    </div>

                    <div>
                      <label className="block text-lg font-bold text-gray-800 mb-2">
                        Số Điện Thoại
                      </label>
                      <input
                        type="tel"
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value)}
                        placeholder="0912345678"
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tra cứu...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Tra Cứu Ngay
                    </span>
                  )}
                </button>
              </form>
            </div>

            {/* Booking Details */}
            {bookingData && (
              <div className="space-y-6 animate-fade-in">
                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Thao Tác Nhanh
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={handleCheckIn}
                      className="bg-white hover:bg-green-50 border-2 border-green-500 text-green-700 font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Check-in Online
                      </div>
                    </button>
                    <button
                      onClick={handleDownloadInvoice}
                      className="bg-white hover:bg-blue-50 border-2 border-blue-500 text-blue-700 font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Tải Hóa Đơn
                      </div>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="bg-white hover:bg-purple-50 border-2 border-purple-500 text-purple-700 font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        In Vé
                      </div>
                    </button>
                  </div>
                </div>

                {/* Rest of booking details (same as before) */}
                <div className="bg-white rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Thông Tin Đặt Chỗ
                    </h2>
                    <div className="flex gap-2">
                      <span className={`px-4 py-2 rounded-lg font-semibold border-2 ${getStatusColor(bookingData.bookingStatus)}`}>
                        {bookingData.bookingStatus}
                      </span>
                      <span className={`px-4 py-2 rounded-lg font-semibold border-2 ${getStatusColor(bookingData.paymentStatus)}`}>
                        {bookingData.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Mã Đặt Chỗ (PNR)</p>
                      <p className="text-2xl font-bold text-blue-600">{bookingData.bookingReference}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Tổng Tiền</p>
                      <p className="text-2xl font-bold text-green-600">{formatVnd(bookingData.totalAmount)} VNĐ</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày Đặt</p>
                      <p className="text-lg font-bold text-gray-800">{formatDate(bookingData.bookedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Liên Hệ</p>
                      <p className="text-lg font-bold text-gray-800">{bookingData.contactEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Flights */}
                {bookingData.bookingFlights && bookingData.bookingFlights.length > 0 && (
                  <div className="bg-white rounded-2xl p-8 shadow-xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Thông Tin Chuyến Bay
                    </h2>
                    <div className="space-y-4">
                      {bookingData.bookingFlights.map((bf, index) => (
                        <div key={index} className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">
                              {bf.flight?.flightNumber || 'N/A'}
                            </h3>
                            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold">
                              {bf.travelClass || 'Economy'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Khởi Hành</p>
                              <p className="font-bold text-lg">{bf.flight?.departureAirport?.airportCode}</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(bf.flight?.departureTime)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Đến</p>
                              <p className="font-bold text-lg">{bf.flight?.arrivalAirport?.airportCode}</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(bf.flight?.arrivalTime)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Passengers */}
                {bookingData.passengers && bookingData.passengers.length > 0 && (
                  <div className="bg-white rounded-2xl p-8 shadow-xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Danh Sách Hành Khách ({bookingData.passengers.length})
                    </h2>
                    <div className="space-y-3">
                      {bookingData.passengers.map((passenger, index) => (
                        <div key={index} className="border-2 border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-blue-300 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-xl font-bold text-blue-600">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-lg">
                                {passenger.firstName} {passenger.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{passenger.passengerType}</p>
                            </div>
                          </div>
                          {passenger.dateOfBirth && (
                            <p className="text-sm text-gray-600">
                              📅 {new Date(passenger.dateOfBirth).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'checkin' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-12 shadow-xl text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Check-in Online
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Vui lòng tra cứu đặt vé trước, sau đó bạn có thể check-in online từ thông tin đặt vé.
              </p>
              <button
                onClick={() => setActiveTab('lookup')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Tra Cứu Đặt Vé Ngay
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

