'use client';

import React, { useState } from 'react';
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  RocketLaunchIcon,
  DocumentTextIcon,
  BellIcon,
  Cog6ToothIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  PresentationChartLineIcon,
  ArrowRightStartOnRectangleIcon
} from '@heroicons/react/24/outline';
import {
  DashboardStats,
  RecentFlight,
  PopularRoute,
  FlightWithDetails,
  BookingWithDetails,
  Aircraft,
  Airline,
  Airport,
  Terminal
} from '../../types/database';

// Import các component dashboard
import AircraftManagement from '../../components/dashboard/AircraftManagement';
import FlightManagement from '../../components/dashboard/FlightManagement';
import BookingManagement from '../../components/dashboard/BookingManagement';
import CheckinManagement from '../../components/dashboard/CheckinManagement';
import CustomerManagement from '../../components/dashboard/CustomerManagement';
import LoyaltyProgram from '../../components/dashboard/LoyaltyProgram';
import Reports from '../../components/dashboard/Reports';
import Button from '@/shared/Button';
import { useAppDispatch, useAppSelector } from 'stores/hookStore';
import { logout } from 'stores/features/masterSlice';
import { requestApi } from 'lib/api';
import { getCookie } from '@/utils/cookies';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isClient, setIsClient] = useState(false);
  // Trạng thái mở/đóng cho từng nhóm navigation
  const [aircraftOpen, setAircraftOpen] = useState(false);
  const [flightsOpen, setFlightsOpen] = useState(false);
  const [bookingsOpen, setBookingsOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const dispatch = useAppDispatch();
  const masterStore = useAppSelector((state) => state.master);

  // Đảm bảo component render nhất quán
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Lấy thông tin user từ API
  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getCookie("access_token");
        if (!token) return;

        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.userId;

        if (!userId) return;

        const response = await requestApi(`users/${userId}`, "GET");
        if (response.success && response.data) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Hàm lấy initials từ tên
  const getUserInitials = () => {
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
    }
    return 'AD';
  };

  // Hàm lấy tên đầy đủ
  const getFullName = () => {
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }
    return 'Admin User';
  };
  const handleLogout = () => {
    dispatch(logout());
    document.cookie = "access_token=; path=/; max-age=0";
    // Nếu muốn redirect về trang login:
    window.location.href = "/login";
  };
  // Helper function để xử lý click navigation
  const handleNavClick = (tab: string, submenu?: string) => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setActiveTab(tab);
      if (submenu) {
        switch (submenu) {
          case 'aircraft': setAircraftOpen(true); break;
          case 'flights': setFlightsOpen(true); break;
          case 'bookings': setBookingsOpen(true); break;
          case 'checkin': setCheckinOpen(true); break;
          case 'loyalty': setLoyaltyOpen(true); break;
          case 'reports': setReportsOpen(true); break;
        }
      }
    } else {
      setActiveTab(tab);
      if (submenu) {
        switch (submenu) {
          case 'aircraft': setAircraftOpen(!aircraftOpen); break;
          case 'flights': setFlightsOpen(!flightsOpen); break;
          case 'bookings': setBookingsOpen(!bookingsOpen); break;
          case 'checkin': setCheckinOpen(!checkinOpen); break;
          case 'loyalty': setLoyaltyOpen(!loyaltyOpen); break;
          case 'reports': setReportsOpen(!reportsOpen); break;
        }
      }
    }
  };

  // Dữ liệu thống kê dựa trên cấu trúc database
  const dashboardStats: DashboardStats = {
    totalFlightsToday: 24,
    totalBookings: 1247,
    monthlyRevenue: 2400000000, // 2.4B VND
    loadFactor: 87.5
  };

  const flightStats = [
    {
      title: 'Chuyến bay hôm nay',
      value: dashboardStats.totalFlightsToday.toString(),
      change: '+12%',
      changeType: 'increase' as const,
      icon: RocketLaunchIcon,
      color: 'blue'
    },
    {
      title: 'Vé đã bán',
      value: isClient ? dashboardStats.totalBookings.toLocaleString('vi-VN') : dashboardStats.totalBookings.toString(),
      change: '+8.2%',
      changeType: 'increase' as const,
      icon: DocumentTextIcon,
      color: 'green'
    },
    {
      title: 'Doanh thu tháng',
      value: `₫${(dashboardStats.monthlyRevenue / 1000000000).toFixed(1)}B`,
      change: '+15.3%',
      changeType: 'increase' as const,
      icon: CurrencyDollarIcon,
      color: 'purple'
    },
    {
      title: 'Tỷ lệ lấp đầy',
      value: `${dashboardStats.loadFactor}%`,
      change: '+3.1%',
      changeType: 'increase' as const,
      icon: ChartBarIcon,
      color: 'orange'
    }
  ];

  // Dữ liệu chuyến bay gần đây dựa trên cấu trúc database
  const recentFlights: RecentFlight[] = [
    {
      flightNumber: 'VN001',
      route: 'SGN → HAN',
      time: '08:30 - 10:15',
      status: 'Boarding',
      passengers: 180,
      statusColor: 'blue'
    },
    {
      flightNumber: 'VN002',
      route: 'HAN → DAD',
      time: '11:45 - 13:20',
      status: 'Delayed',
      passengers: 156,
      statusColor: 'yellow'
    },
    {
      flightNumber: 'VN003',
      route: 'DAD → SGN',
      time: '14:00 - 15:45',
      status: 'Scheduled',
      passengers: 168,
      statusColor: 'green'
    },
    {
      flightNumber: 'VN004',
      route: 'SGN → PQC',
      time: '16:30 - 17:45',
      status: 'Departed',
      passengers: 142,
      statusColor: 'blue'
    }
  ];

  // Dữ liệu tuyến phổ biến dựa trên cấu trúc database
  const popularRoutes: PopularRoute[] = [
    { route: 'Sài Gòn - Hà Nội', bookings: 1247, revenue: '₫1.2B' },
    { route: 'Hà Nội - Đà Nẵng', bookings: 892, revenue: '₫856M' },
    { route: 'Sài Gòn - Phú Quốc', bookings: 743, revenue: '₫678M' },
    { route: 'Đà Nẵng - Hà Nội', bookings: 621, revenue: '₫598M' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'text-green-600 bg-green-100';
      case 'Boarding': return 'text-blue-600 bg-blue-100';
      case 'Departed': return 'text-blue-600 bg-blue-100';
      case 'Arrived': return 'text-green-600 bg-green-100';
      case 'Delayed': return 'text-yellow-600 bg-yellow-100';
      case 'Canceled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'green': return 'text-green-600 bg-green-100';
      case 'purple': return 'text-purple-600 bg-purple-100';
      case 'orange': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'aircraft':
      case 'aircraft-add':
      case 'aircraft-edit':
      case 'aircraft-seats':
      case 'aircraft-maintenance':
      case 'aircraft-status':
      case 'aircraft-search':
        return <AircraftManagement activeSubTab={activeTab} />;
      case 'flights':
      case 'flights-create':
      case 'flights-edit':
      case 'flights-schedule':
      case 'flights-status':
        return <FlightManagement activeSubTab={activeTab} />;
      case 'bookings':
      case 'bookings-search':
      case 'bookings-create':
      case 'bookings-cancel':
      case 'bookings-refund':
        return <BookingManagement activeSubTab={activeTab} />;
      case 'checkin':
      case 'checkin-online':
      case 'checkin-airport':
      case 'checkin-baggage':
      case 'checkin-boarding':
        return <CheckinManagement activeSubTab={activeTab} />;
      case 'customers':
        return <CustomerManagement />;
      case 'loyalty':
      case 'loyalty-earn':
      case 'loyalty-redeem':
      case 'loyalty-status':
        return <LoyaltyProgram activeSubTab={activeTab} />;
      case 'reports':
      case 'reports-by-date':
      case 'reports-by-flight':
      case 'reports-revenue':
        return <Reports activeSubTab={activeTab} />;
      case 'overview':
      default:
        return (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {flightStats.map((stat) => (
                <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-md font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${getStatIconColor(stat.color)}`}>
                      <stat.icon className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    {stat.changeType === 'increase' ? (
                      <ArrowUpIcon className="h-5 w-5 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-5 w-5 text-red-500 mr-1" />
                    )}
                    <span className={`text-md font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {stat.change}
                    </span>
                    <span className="text-md text-gray-500 ml-2">so với tháng trước</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Flights */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Chuyến bay gần đây</h3>
                    <button className="text-blue-600 hover:text-blue-700 text-md font-medium">
                      Xem tất cả
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentFlights.map((flight) => (
                      <div key={flight.flightNumber} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                            <RocketLaunchIcon className="h-7 w-7 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-md font-semibold text-gray-900">{flight.flightNumber}</p>
                            <p className="text-md text-gray-600">{flight.route}</p>
                            <p className="text-sm text-gray-500">{flight.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-md font-medium ${getStatusColor(flight.status)}`}>
                            {flight.status}
                          </span>
                          <p className="text-md text-gray-600 mt-1">{flight.passengers} hành khách</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Popular Routes */}
              <div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Tuyến phổ biến</h3>
                    <MapPinIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    {popularRoutes.map((route, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-md font-medium text-gray-900">{route.route}</p>
                          <p className="text-md text-gray-600">{route.bookings} vé</p>
                        </div>
                        <div className="text-right">
                          <p className="text-md font-semibold text-gray-900">{route.revenue}</p>
                          <div className="flex items-center mt-1">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(route.bookings / 1247) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Thao tác nhanh</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <button
                    onClick={() => setActiveTab('aircraft')}
                    className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <RocketLaunchIcon className="h-10 w-10 text-blue-600 mb-2" />
                    <span className="text-md font-medium text-blue-900">Thêm máy bay</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('flights')}
                    className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <ClockIcon className="h-10 w-10 text-green-600 mb-2" />
                    <span className="text-md font-medium text-green-900">Tạo chuyến bay</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <DocumentTextIcon className="h-10 w-10 text-purple-600 mb-2" />
                    <span className="text-md font-medium text-purple-900">Đặt chỗ</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('checkin')}
                    className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <UserGroupIcon className="h-10 w-10 text-orange-600 mb-2" />
                    <span className="text-md font-medium text-orange-900">Check-in</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('loyalty')}
                    className="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <CurrencyDollarIcon className="h-10 w-10 text-red-600 mb-2" />
                    <span className="text-md font-medium text-red-900">Khuyến mãi</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChartBarIcon className="h-10 w-10 text-gray-600 mb-2" />
                    <span className="text-md font-medium text-gray-900">Báo cáo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-[325px]' : 'w-[101px]'} transition-all duration-300 bg-white shadow-lg flex flex-col border-r border-gray-200`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <RocketLaunchIcon className="h-7 w-7 text-white" />
              </div>
              {sidebarOpen && (
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">FlyGo</h1>
                  <p className="text-md text-gray-500">Admin Dashboard</p>
                </div>
              )}
            </div>
            {/* Toggle Button - bên phải logo */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bars3Icon className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-2 px-4">
            {/* Main Navigation */}
            <div className={`space-y-1 ${!sidebarOpen ? 'space-y-2' : ''}`}>
              <button
                onClick={() => {
                  setActiveTab('overview');
                  if (!sidebarOpen) setSidebarOpen(true);
                }}
                className={`w-full flex items-center ${sidebarOpen ? 'px-3 py-2' : 'px-2 py-2'} text-md font-medium rounded-lg transition-colors ${activeTab === 'overview'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <HomeIcon className={`${sidebarOpen ? 'h-6 w-6 mr-3' : 'h-7 w-7 mx-auto'}`} />
                {sidebarOpen && 'Tổng quan'}
              </button>

              <button
                onClick={() => {
                  if (!sidebarOpen) {
                    setSidebarOpen(true);
                    setActiveTab('aircraft');
                    setAircraftOpen(true);
                  } else {
                    setAircraftOpen(!aircraftOpen);
                    if (!['aircraft', 'aircraft-add', 'aircraft-edit', 'aircraft-seats', 'aircraft-maintenance'].includes(activeTab)) {
                      setActiveTab('aircraft');
                    }
                  }
                }}
                className={`w-full flex items-center ${sidebarOpen ? 'px-3 py-2' : 'px-2 py-2'} text-md font-medium rounded-lg transition-colors ${(activeTab === 'aircraft' || activeTab === 'aircraft-add' || activeTab === 'aircraft-edit' || activeTab === 'aircraft-seats' || activeTab === 'aircraft-maintenance')
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <RocketLaunchIcon className={`${sidebarOpen ? 'h-6 w-6 mr-3' : 'h-7 w-7 mx-auto'}`} />
                {sidebarOpen && 'Quản lý máy bay'}
              </button>

              {/* Aircraft Management Sub-menu */}
              {aircraftOpen && sidebarOpen && (
                <div className="ml-4 space-y-1">
                  <button
                    onClick={() => setActiveTab('aircraft-add')}
                    className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'aircraft-add'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Thêm máy bay
                  </button>
                  <button
                    onClick={() => setActiveTab('aircraft-edit')}
                    className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'aircraft-edit'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Sửa thông tin máy bay
                  </button>
                  <button
                    onClick={() => setActiveTab('aircraft-seats')}
                    className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'aircraft-seats'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Quản lý chỗ ngồi
                  </button>
                  <button
                    onClick={() => setActiveTab('aircraft-maintenance')}
                    className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'aircraft-maintenance'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Theo dõi bảo trì
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  if (!sidebarOpen) {
                    setSidebarOpen(true);
                    setActiveTab('flights');
                    setFlightsOpen(true);
                  } else {
                    setFlightsOpen(!flightsOpen);
                    if (!['flights', 'flights-create', 'flights-edit', 'flights-schedule', 'flights-status'].includes(activeTab)) {
                      setActiveTab('flights');
                    }
                  }
                }}
                className={`w-full flex items-center ${sidebarOpen ? 'px-3 py-2' : 'px-2 py-2'} text-md font-medium rounded-lg transition-colors ${(activeTab === 'flights' || activeTab === 'flights-create' || activeTab === 'flights-edit' || activeTab === 'flights-schedule' || activeTab === 'flights-status')
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <ClockIcon className={`${sidebarOpen ? 'h-6 w-6 mr-3' : 'h-7 w-7 mx-auto'}`} />
                {sidebarOpen && 'Quản lý chuyến bay'}
              </button>

              {/* Flight Management Sub-menu */}
              {flightsOpen && sidebarOpen && (
                <div className="ml-4 space-y-1">
                  <button
                    onClick={() => setActiveTab('flights-create')}
                    className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'flights-create'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Tạo chuyến bay
                  </button>
                  <button
                    onClick={() => setActiveTab('flights-edit')}
                    className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'flights-edit'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Sửa chuyến bay
                  </button>
                  <button
                    onClick={() => setActiveTab('flights-schedule')}
                    className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'flights-schedule'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Xem lịch bay
                  </button>
                  <button
                    onClick={() => setActiveTab('flights-status')}
                    className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'flights-status'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Cập nhật trạng thái
                  </button>
                </div>
              )}


              <button
                onClick={() => handleNavClick('bookings', 'bookings')}
                className={`w-full flex items-center ${sidebarOpen ? 'px-3 py-2' : 'px-2 py-2'} text-md font-medium rounded-lg transition-colors ${activeTab === 'bookings'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <DocumentTextIcon className={`${sidebarOpen ? 'h-6 w-6 mr-3' : 'h-7 w-7 mx-auto'}`} />
                {sidebarOpen && 'Quản lý đặt chỗ'}
              </button>

              {/* Bookings Sub-menu */}
              {bookingsOpen && sidebarOpen && (
                <div className="ml-4 space-y-1">
                  <button onClick={() => setActiveTab('bookings-search')} className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'bookings-search' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Tìm kiếm đặt chỗ
                  </button>
                  <button onClick={() => setActiveTab('bookings-create')} className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'bookings-create' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Tạo đặt chỗ
                  </button>
                  <button onClick={() => setActiveTab('bookings-cancel')} className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'bookings-cancel' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Hủy đặt chỗ
                  </button>
                  <button onClick={() => setActiveTab('bookings-refund')} className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'bookings-refund' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Yêu cầu hoàn tiền
                  </button>
                </div>
              )}

              <button
                onClick={() => handleNavClick('checkin', 'checkin')}
                className={`w-full flex items-center ${sidebarOpen ? 'px-3 py-2' : 'px-2 py-2'} text-md font-medium rounded-lg transition-colors ${activeTab === 'checkin'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <UserGroupIcon className={`${sidebarOpen ? 'h-6 w-6 mr-3' : 'h-7 w-7 mx-auto'}`} />
                {sidebarOpen && 'Check-in & Boarding'}
              </button>

              {/* Check-in Sub-menu */}
              {checkinOpen && sidebarOpen && (
                <div className="ml-4 space-y-1">
                  <button onClick={() => setActiveTab('checkin-airport')} className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'checkin-airport' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Check-in tại sân bay
                  </button>
                  <button onClick={() => setActiveTab('checkin-online')} className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'checkin-online' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Check-in trực tuyến
                  </button>
                  <button onClick={() => setActiveTab('checkin-baggage')} className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'checkin-baggage' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Quản lý hành lý
                  </button>
                  <button onClick={() => setActiveTab('checkin-boarding')} className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'checkin-boarding' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Lên máy bay
                  </button>
                </div>
              )}

              <button
                onClick={() => handleNavClick('customers')}
                className={`w-full flex items-center ${sidebarOpen ? 'px-3 py-2' : 'px-2 py-2'} text-md font-medium rounded-lg transition-colors ${activeTab === 'customers'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <UserGroupIcon className={`${sidebarOpen ? 'h-6 w-6 mr-3' : 'h-7 w-7 mx-auto'}`} />
                {sidebarOpen && 'Quản lý khách hàng'}
              </button>

              <button
                onClick={() => handleNavClick('loyalty', 'loyalty')}
                className={`w-full flex items-center ${sidebarOpen ? 'px-3 py-2' : 'px-2 py-2'} text-md font-medium rounded-lg transition-colors ${activeTab === 'loyalty'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <CurrencyDollarIcon className={`${sidebarOpen ? 'h-6 w-6 mr-3' : 'h-7 w-7 mx-auto'}`} />
                {sidebarOpen && 'Chương trình khuyến mãi'}
              </button>

              {/* Loyalty Sub-menu */}
              {loyaltyOpen && sidebarOpen && (
                <div className="ml-4 space-y-1">
                  <button onClick={() => setActiveTab('loyalty-earn')} className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'loyalty-earn' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Tích điểm
                  </button>
                  <button onClick={() => setActiveTab('loyalty-redeem')} className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'loyalty-redeem' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Đổi điểm thưởng
                  </button>
                  <button onClick={() => setActiveTab('loyalty-status')} className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'loyalty-status' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Xem trạng thái
                  </button>
                </div>
              )}

              <button
                onClick={() => handleNavClick('reports', 'reports')}
                className={`w-full flex items-center ${sidebarOpen ? 'px-3 py-2' : 'px-2 py-2'} text-md font-medium rounded-lg transition-colors ${activeTab === 'reports'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <PresentationChartLineIcon className={`${sidebarOpen ? 'h-6 w-6 mr-3' : 'h-7 w-7 mx-auto'}`} />
                {sidebarOpen && 'Báo cáo thống kê'}
              </button>

              {/* Reports Sub-menu */}
              {reportsOpen && sidebarOpen && (
                <div className="ml-4 space-y-1">
                  <button onClick={() => setActiveTab('reports-by-date')} className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'reports-by-date' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Thống kê theo ngày/tháng/năm
                  </button>
                  <button onClick={() => setActiveTab('reports-by-flight')} className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'reports-by-flight' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Thống kê từng chuyến bay
                  </button>
                  <button onClick={() => setActiveTab('reports-revenue')} className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'reports-revenue' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Thống kê doanh thu
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            {sidebarOpen && <div className="border-t border-gray-200 my-4"></div>}

            {/* Secondary Navigation */}
            {sidebarOpen && (
              <div className="space-y-1">
                <h3 className="px-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Hệ thống
                </h3>
                <button
                  onClick={() => setActiveTab('user-management')}
                  className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'user-management'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <UserGroupIcon className="h-6 w-6 mr-3" />
                  Quản lý người dùng
                </button>
                <button
                  onClick={() => setActiveTab('roles')}
                  className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'roles'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Cog6ToothIcon className="h-6 w-6 mr-3" />
                  Phân quyền
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'notifications'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <BellIcon className="h-6 w-6 mr-3" />
                  Thông báo hệ thống
                </button>
                <button
                  onClick={() => setActiveTab('support')}
                  className={`w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors ${activeTab === 'support'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <ChatBubbleLeftRightIcon className="h-6 w-6 mr-3" />
                  Hỗ trợ khách hàng
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-md rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <ArrowRightStartOnRectangleIcon className="h-6 w-6 mr-3" />
                  Đăng xuất
                </button>

              </div>
            )}
          </nav>
        </div>


        {/* User Profile - ở cuối sidebar */}
        <div className="mt-auto p-4 border-t border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-md">{getUserInitials()}</span>
              </div>
              <div className="flex-1">
                <p className="text-md font-medium text-gray-900">{getFullName()}</p>
                <p className="text-sm text-gray-500">{userData?.email || 'admin@gmail.com'}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-md">{getUserInitials()}</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-md text-gray-600">Chào mừng trở lại, Admin!</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <BellIcon className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

