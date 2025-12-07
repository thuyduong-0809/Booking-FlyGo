'use client';

import React, { useEffect, useState } from 'react';
import { 
  PresentationChartLineIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Flight, Booking, User, Payment } from '../../types/database';
import { requestApi } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ReportData {
  period: string;
  revenue: number;
  bookings: number;
  flights: number;
  passengers: number;
  averageTicketPrice: number;
  occupancyRate: number;
}

// Extended interface for flight reports with database fields
interface FlightReport extends Flight {
  route: string;
  passengers: number;
  capacity: number;
  revenue: number;
  occupancyRate: number;
}

// Extended interface for booking reports
interface BookingReport extends Booking {
  customerName: string;
  flightNumber: string;
  route: string;
  bookingDate: string;
}

interface ReportsProps { activeSubTab?: string }

export default function Reports({ activeSubTab = 'reports' }: ReportsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReportType, setSelectedReportType] = useState('overview');

  const reportData: ReportData[] = [
    {
      period: 'Tháng 1/2024',
      revenue: 2400000000,
      bookings: 1247,
      flights: 156,
      passengers: 18420,
      averageTicketPrice: 1300000,
      occupancyRate: 87.5
    },
    {
      period: 'Tháng 2/2024',
      revenue: 2680000000,
      bookings: 1392,
      flights: 174,
      passengers: 20560,
      averageTicketPrice: 1300000,
      occupancyRate: 89.2
    },
    {
      period: 'Tháng 3/2024',
      revenue: 2950000000,
      bookings: 1534,
      flights: 192,
      passengers: 22680,
      averageTicketPrice: 1300000,
      occupancyRate: 91.8
    }
  ];

  const flightReports: FlightReport[] = [
    {
      FlightID: 1,
      FlightNumber: 'FG001',
      AirlineID: 1,
      DepartureAirportID: 1,
      ArrivalAirportID: 2,
      DepartureTerminalID: 1,
      ArrivalTerminalID: 1,
      DepartureTime: '2024-01-15T08:00:00Z',
      ArrivalTime: '2024-01-15T10:00:00Z',
      AircraftID: 1,
      Duration: 120,
      Status: 'Arrived',
      EconomyPrice: 1500000,
      BusinessPrice: 3000000,
      FirstClassPrice: 5000000,
      AvailableEconomySeats: 20,
      AvailableBusinessSeats: 0,
      AvailableFirstClassSeats: 0,
      route: 'SGN → HAN',
      passengers: 180,
      capacity: 200,
      revenue: 180000000,
      occupancyRate: 90.0
    },
    {
      FlightID: 2,
      FlightNumber: 'FG002',
      AirlineID: 1,
      DepartureAirportID: 2,
      ArrivalAirportID: 3,
      DepartureTerminalID: 1,
      ArrivalTerminalID: 1,
      DepartureTime: '2024-01-15T14:00:00Z',
      ArrivalTime: '2024-01-15T15:30:00Z',
      AircraftID: 2,
      Duration: 90,
      Status: 'Arrived',
      EconomyPrice: 1200000,
      BusinessPrice: 2500000,
      FirstClassPrice: 4000000,
      AvailableEconomySeats: 44,
      AvailableBusinessSeats: 0,
      AvailableFirstClassSeats: 0,
      route: 'HAN → DAD',
      passengers: 156,
      capacity: 200,
      revenue: 156000000,
      occupancyRate: 78.0
    },
    {
      FlightID: 3,
      FlightNumber: 'FG003',
      AirlineID: 1,
      DepartureAirportID: 3,
      ArrivalAirportID: 1,
      DepartureTerminalID: 1,
      ArrivalTerminalID: 1,
      DepartureTime: '2024-01-15T18:00:00Z',
      ArrivalTime: '2024-01-15T19:30:00Z',
      AircraftID: 1,
      Duration: 90,
      Status: 'Arrived',
      EconomyPrice: 1200000,
      BusinessPrice: 2500000,
      FirstClassPrice: 4000000,
      AvailableEconomySeats: 15,
      AvailableBusinessSeats: 5,
      AvailableFirstClassSeats: 0,
      route: 'DAD → SGN',
      passengers: 180,
      capacity: 200,
      revenue: 180000000,
      occupancyRate: 90.0
    }
  ];

  const bookingReports: BookingReport[] = [
    {
      BookingID: 1,
      BookingReference: 'FG240115001',
      UserID: 1,
      TotalAmount: 1500000,
      PaymentStatus: 'Paid',
      BookingStatus: 'Confirmed',
      ContactEmail: 'nguyenvana@email.com',
      ContactPhone: '0901234567',
      SpecialRequests: 'Hành lý đặc biệt',
      BookedAt: '2024-01-15T06:00:00Z',
      customerName: 'Nguyễn Văn A',
      flightNumber: 'FG001',
      route: 'SGN → HAN',
      bookingDate: '2024-01-15'
    },
    {
      BookingID: 2,
      BookingReference: 'FG240115002',
      UserID: 2,
      TotalAmount: 3000000,
      PaymentStatus: 'Paid',
      BookingStatus: 'Confirmed',
      ContactEmail: 'tranthib@email.com',
      ContactPhone: '0907654321',
      SpecialRequests: 'Ghế cửa sổ',
      BookedAt: '2024-01-15T07:30:00Z',
      customerName: 'Trần Thị B',
      flightNumber: 'FG002',
      route: 'HAN → DAD',
      bookingDate: '2024-01-15'
    },
    {
      BookingID: 3,
      BookingReference: 'FG240115003',
      UserID: 3,
      TotalAmount: 2500000,
      PaymentStatus: 'Paid',
      BookingStatus: 'Confirmed',
      ContactEmail: 'levanc@email.com',
      ContactPhone: '0909876543',
      SpecialRequests: 'Bữa ăn đặc biệt',
      BookedAt: '2024-01-15T09:15:00Z',
      customerName: 'Lê Văn C',
      flightNumber: 'FG003',
      route: 'DAD → SGN',
      bookingDate: '2024-01-15'
    }
  ];



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'text-blue-600 bg-blue-100';
      case 'Boarding': return 'text-yellow-600 bg-yellow-100';
      case 'Departed': return 'text-purple-600 bg-purple-100';
      case 'Arrived': return 'text-green-600 bg-green-100';
      case 'Delayed': return 'text-orange-600 bg-orange-100';
      case 'Canceled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'Reserved': return 'text-blue-600 bg-blue-100';
      case 'Confirmed': return 'text-green-600 bg-green-100';
      case 'Canceled': return 'text-red-600 bg-red-100';
      case 'Completed': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Paid': return 'text-green-600 bg-green-100';
      case 'Failed': return 'text-red-600 bg-red-100';
      case 'Refunded': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  useEffect(()=>{
    loadMonthReport()
    loadWeekReport()
    loadQuarterReport()
    loadYearReport()
  },[])

  const getListData = () => {
  switch(selectedPeriod) {
    case 'week': return [weekData];
    case 'month': return [monthData];
    case 'quarter': return [quarterData];
    case 'year': return [yearData];
    default: return [];
  }
};

  const [weekData, setWeekData] = useState<any>(null);
  const [monthData, setMonthData] = useState<any>(null);
  const [quarterData, setQuarterData] = useState<any>(null);
  const [yearData, setYearData] = useState<any>(null);
  const loadMonthReport = async()=>{
    requestApi('bookings/reports/current-month-revenue','GET').then((res:any)=>{
      // console.log('aaa',res)
       if(res.success){
         setMonthData(res)
        //  console.log(res.data)
       }else{
    
       }
    }).catch((err:any)=>{
        console.log(err)
    })
  } 

    const loadWeekReport = async()=>{
    requestApi('bookings/reports/current-week-revenue','GET').then((res:any)=>{
      // console.log('week',res)
       if(res.success){
         setWeekData(res)
       }
    })
  } 

  const loadQuarterReport = async()=>{
    requestApi('bookings/reports/current-quarter-revenue','GET').then((res:any)=>{
      // console.log('quarter',res)
       if(res.success){
         setQuarterData(res)
        //  console.log(res.data)
       }else{
    
       }
    }).catch((err:any)=>{
        console.log(err)
    })
  } 

  const loadYearReport = async()=>{
    requestApi('bookings/reports/current-year-revenue','GET').then((res:any)=>{
      // console.log('year',res)
       if(res.success){
         setYearData(res)
        //  console.log(res.data)
       }else{
    
       }
    }).catch((err:any)=>{
        console.log(err)
    })
  } 
  const selectedReportData = getListData()[0];

  const chartData = [
  {
    name: "Đặt chỗ",
    value: selectedReportData?.totalBookings || 0
  },
  {
    name: "Chuyến bay",
    value: selectedReportData?.flightsDeparted || 0
  },
  {
    name: "Lấp đầy (%)",
    value: selectedReportData?.loadFactor || 0
  }
];



  // Render content based on active sub-tab
  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'reports-financial':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Báo cáo tài chính</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-md font-medium text-green-900">Doanh thu tháng</p>
                      <p className="text-2xl font-bold text-green-600">₫2.95B</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-md font-medium text-blue-900">Tăng trưởng</p>
                      <p className="text-2xl font-bold text-blue-600">+10.1%</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <PresentationChartLineIcon className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-md font-medium text-purple-900">Lợi nhuận</p>
                      <p className="text-2xl font-bold text-purple-600">₫590M</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kỳ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đặt chỗ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chuyến bay</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tỷ lệ lấp đầy</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.map((report) => (
                      <tr key={report.period} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-md font-medium text-gray-900">
                          {report.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₫{(report.revenue / 1000000000).toFixed(1)}B
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.bookings.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.flights}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.occupancyRate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'reports-operations':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Báo cáo hoạt động</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <RocketLaunchIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-md font-medium text-blue-900">Chuyến bay hôm nay</p>
                      <p className="text-2xl font-bold text-blue-600">12</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-md font-medium text-green-900">Hành khách</p>
                      <p className="text-2xl font-bold text-green-600">1,840</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CalendarIcon className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-md font-medium text-purple-900">Tỷ lệ đúng giờ</p>
                      <p className="text-2xl font-bold text-purple-600">94.2%</p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-8 w-8 text-orange-600 mr-3" />
                    <div>
                      <p className="text-md font-medium text-orange-900">Tỷ lệ lấp đầy</p>
                      <p className="text-2xl font-bold text-orange-600">87.5%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chuyến bay</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tuyến</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành khách</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {flightReports.map((flight) => (
                      <tr key={flight.FlightID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-md font-medium text-gray-900">
                          {flight.FlightNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {flight.route}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(flight.DepartureTime).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {flight.passengers}/{flight.capacity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₫{(flight.revenue / 1000000).toFixed(0)}M
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(flight.Status)}`}>
                            {flight.Status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'reports-customers':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Báo cáo khách hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-md font-medium text-blue-900">Khách hàng mới</p>
                      <p className="text-2xl font-bold text-blue-600">156</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-md font-medium text-green-900">Chi tiêu trung bình</p>
                      <p className="text-2xl font-bold text-green-600">₫1.9M</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-md font-medium text-purple-900">Tỷ lệ quay lại</p>
                      <p className="text-2xl font-bold text-purple-600">68.5%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đặt chỗ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chuyến bay</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tuyến</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookingReports.map((booking) => (
                      <tr key={booking.BookingID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-md font-medium text-gray-900">
                          {booking.BookingReference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.flightNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.route}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₫{booking.TotalAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBookingStatusColor(booking.BookingStatus)}`}>
                              {booking.BookingStatus}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.PaymentStatus)}`}>
                              {booking.PaymentStatus}
                            </span>
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

      default:
        return (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {getListData().map((report, idx) => (
              <div key={idx} className="contents">

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-md font-medium text-gray-600">Doanh thu</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {report ? `₫${report.totalRevenue}` : 'Đang tải...'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <UserGroupIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-md font-medium text-gray-600">Đặt chỗ</p>
                      <p className="text-2xl font-bold text-gray-900">{report ? `${report.totalBookings}` : 'Đang tải...'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <RocketLaunchIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-md font-medium text-gray-600">Chuyến bay</p>
                      <p className="text-2xl font-bold text-gray-900">{report ? `${report.flightsDeparted}` : 'Đang tải...'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <ChartBarIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-md font-medium text-gray-600">Tỷ lệ lấp đầy</p>
                      <p className="text-2xl font-bold text-gray-900">{report ? `${report.loadFactor}` : 'Đang tải...'}</p>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>


            {/* Recent Performance */}
            {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiệu suất gần đây</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kỳ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đặt chỗ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chuyến bay</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành khách</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tỷ lệ lấp đầy</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.map((report) => (
                      <tr key={report.period} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-md font-medium text-gray-900">
                          {report.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₫{(report.revenue / 1000000000).toFixed(1)}B
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.bookings.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.flights}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.passengers.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.occupancyRate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div> */}

            {/* Top Performing Flights */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiệu Suất Đặt Chỗ và Chuyến Bay</h3>
              <div className="space-y-4">
               <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
            {activeSubTab === 'reports-financial' ? 'Báo cáo tài chính' :
             activeSubTab === 'reports-operations' ? 'Báo cáo hoạt động' :
             activeSubTab === 'reports-customers' ? 'Báo cáo khách hàng' :
             'Báo cáo thống kê'}
          </h2>
          <p className="text-gray-600">
            {activeSubTab === 'reports-financial' ? 'Phân tích tình hình tài chính' :
             activeSubTab === 'reports-operations' ? 'Theo dõi hiệu suất hoạt động' :
             activeSubTab === 'reports-customers' ? 'Phân tích hành vi khách hàng' :
             'Tổng quan hiệu suất và thống kê'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={selectedPeriod}
            onChange={(e) => {setSelectedPeriod(e.target.value)}}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm nay</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PresentationChartLineIcon className="h-5 w-5 mr-2" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Render sub-content */}
      {renderSubContent()}
    </div>
  );
}