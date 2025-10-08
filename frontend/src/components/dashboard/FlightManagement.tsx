'use client';

import React, { useState } from 'react';
import { 
  RocketLaunchIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

interface Aircraft {
  id: string;
  name: string;
  type: string;
  capacity: number;
  status: 'Active' | 'Maintenance' | 'Inactive';
  registrationNumber: string;
  manufacturer: string;
  model: string;
  yearOfManufacture: number;
}

interface Seat {
  id: string;
  aircraftId: string;
  seatNumber: string;
  class: 'Economy' | 'Business' | 'First';
  row: number;
  column: string;
  status: 'Available' | 'Occupied' | 'Maintenance';
}

interface Maintenance {
  id: string;
  aircraftId: string;
  aircraftName: string;
  type: 'Scheduled' | 'Unscheduled' | 'Emergency';
  description: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  technician: string;
  duration: number;
}

interface FlightManagementProps { activeSubTab?: string }

export default function FlightManagement({ activeSubTab = 'flights' }: FlightManagementProps) {
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([
    {
      id: 'AC001',
      name: 'Boeing 737-800',
      type: 'Narrow-body',
      capacity: 200,
      status: 'Active',
      registrationNumber: 'VN-A001',
      manufacturer: 'Boeing',
      model: '737-800',
      yearOfManufacture: 2018
    },
    {
      id: 'AC002',
      name: 'Airbus A320',
      type: 'Narrow-body',
      capacity: 180,
      status: 'Active',
      registrationNumber: 'VN-A002',
      manufacturer: 'Airbus',
      model: 'A320',
      yearOfManufacture: 2019
    },
    {
      id: 'AC003',
      name: 'Boeing 787-9',
      type: 'Wide-body',
      capacity: 300,
      status: 'Maintenance',
      registrationNumber: 'VN-A003',
      manufacturer: 'Boeing',
      model: '787-9',
      yearOfManufacture: 2020
    }
  ]);

  const [seats, setSeats] = useState<Seat[]>([
    { id: 'S001', aircraftId: 'AC001', seatNumber: '1A', class: 'First', row: 1, column: 'A', status: 'Available' },
    { id: 'S002', aircraftId: 'AC001', seatNumber: '1B', class: 'First', row: 1, column: 'B', status: 'Available' },
    { id: 'S003', aircraftId: 'AC001', seatNumber: '2A', class: 'Business', row: 2, column: 'A', status: 'Occupied' },
    { id: 'S004', aircraftId: 'AC001', seatNumber: '3A', class: 'Economy', row: 3, column: 'A', status: 'Available' }
  ]);

  const [maintenances, setMaintenances] = useState<Maintenance[]>([
    {
      id: 'M001',
      aircraftId: 'AC001',
      aircraftName: 'Boeing 737-800',
      type: 'Scheduled',
      description: 'Kiểm tra định kỳ 6 tháng',
      scheduledDate: '2024-01-20',
      completedDate: '2024-01-20',
      status: 'Completed',
      technician: 'Nguyễn Văn A',
      duration: 8
    },
    {
      id: 'M002',
      aircraftId: 'AC003',
      aircraftName: 'Boeing 787-9',
      type: 'Unscheduled',
      description: 'Sửa chữa động cơ',
      scheduledDate: '2024-01-15',
      status: 'In Progress',
      technician: 'Trần Văn B',
      duration: 24
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'Inactive': return 'text-red-600 bg-red-100';
      case 'Available': return 'text-green-600 bg-green-100';
      case 'Occupied': return 'text-blue-600 bg-blue-100';
      case 'Scheduled': return 'text-blue-600 bg-blue-100';
      case 'In Progress': return 'text-yellow-600 bg-yellow-100';
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active': return 'Hoạt động';
      case 'Maintenance': return 'Bảo trì';
      case 'Inactive': return 'Không hoạt động';
      case 'Available': return 'Trống';
      case 'Occupied': return 'Đã đặt';
      case 'Scheduled': return 'Đã lên lịch';
      case 'In Progress': return 'Đang thực hiện';
      case 'Completed': return 'Hoàn thành';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const filteredAircrafts = aircrafts.filter(aircraft => {
    const matchesSearch = aircraft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aircraft.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aircraft.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || aircraft.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Render content based on active sub-tab
  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'flights-add-aircraft':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm máy bay mới</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên máy bay</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Boeing 737-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số đăng ký</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="VN-A001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hãng sản xuất</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn hãng sản xuất</option>
                    <option value="Boeing">Boeing</option>
                    <option value="Airbus">Airbus</option>
                    <option value="Embraer">Embraer</option>
                    <option value="ATR">ATR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="737-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Năm sản xuất</label>
                  <input
                    type="number"
                    min="1950"
                    max="2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="2018"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại máy bay</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn loại</option>
                    <option value="Narrow-body">Narrow-body</option>
                    <option value="Wide-body">Wide-body</option>
                    <option value="Regional">Regional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="Active">Hoạt động</option>
                    <option value="Maintenance">Bảo trì</option>
                    <option value="Inactive">Không hoạt động</option>
                  </select>
                </div>
              </form>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Thêm máy bay
                </button>
              </div>
            </div>
          </div>
        );

      case 'flights-edit-aircraft':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sửa thông tin máy bay</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn máy bay để chỉnh sửa</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Chọn máy bay</option>
                  {aircrafts.map((aircraft) => (
                    <option key={aircraft.id} value={aircraft.id}>
                      {aircraft.name} - {aircraft.registrationNumber}
                    </option>
                  ))}
                </select>
              </div>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên máy bay</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Boeing 737-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số đăng ký</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="VN-A001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hãng sản xuất</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="Boeing">Boeing</option>
                    <option value="Airbus">Airbus</option>
                    <option value="Embraer">Embraer</option>
                    <option value="ATR">ATR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="737-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Năm sản xuất</label>
                  <input
                    type="number"
                    min="1950"
                    max="2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="2018"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại máy bay</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="Narrow-body">Narrow-body</option>
                    <option value="Wide-body">Wide-body</option>
                    <option value="Regional">Regional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="Active">Hoạt động</option>
                    <option value="Maintenance">Bảo trì</option>
                    <option value="Inactive">Không hoạt động</option>
                  </select>
                </div>
              </form>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Cập nhật thông tin
                </button>
              </div>
            </div>
          </div>
        );

      case 'flights-seat-management':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý chỗ ngồi</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn máy bay</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Chọn máy bay</option>
                  {aircrafts.map((aircraft) => (
                    <option key={aircraft.id} value={aircraft.id}>
                      {aircraft.name} - {aircraft.registrationNumber}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Sơ đồ chỗ ngồi</h4>
                <div className="grid grid-cols-6 gap-2 max-w-md">
                  {seats.map((seat) => (
                    <div
                      key={seat.id}
                      className={`p-2 text-xs text-center rounded border cursor-pointer ${
                        seat.status === 'Available' 
                          ? 'bg-green-100 border-green-300 text-green-800' 
                          : seat.status === 'Occupied'
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'bg-red-100 border-red-300 text-red-800'
                      }`}
                    >
                      {seat.seatNumber}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex space-x-4 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-1"></div>
                    Trống
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-1"></div>
                    Đã đặt
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-1"></div>
                    Bảo trì
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số ghế</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="1A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hạng ghế</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="Economy">Economy</option>
                    <option value="Business">Business</option>
                    <option value="First">First</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="Available">Trống</option>
                    <option value="Occupied">Đã đặt</option>
                    <option value="Maintenance">Bảo trì</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Cập nhật ghế
                </button>
              </div>
            </div>
          </div>
        );

      case 'flights-maintenance':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Theo dõi bảo trì máy bay</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Máy bay</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn máy bay</option>
                    {aircrafts.map((aircraft) => (
                      <option key={aircraft.id} value={aircraft.id}>
                        {aircraft.name} - {aircraft.registrationNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại bảo trì</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn loại</option>
                    <option value="Scheduled">Định kỳ</option>
                    <option value="Unscheduled">Không định kỳ</option>
                    <option value="Emergency">Khẩn cấp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày lên lịch</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kỹ thuật viên</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả công việc</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    rows={3}
                    placeholder="Mô tả chi tiết công việc bảo trì..."
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Lên lịch bảo trì
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử bảo trì</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Máy bay</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày lên lịch</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kỹ thuật viên</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {maintenances.map((maintenance) => (
                      <tr key={maintenance.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {maintenance.aircraftName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {maintenance.type}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {maintenance.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {maintenance.scheduledDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {maintenance.technician}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(maintenance.status)}`}>
                            {getStatusText(maintenance.status)}
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

      default:
        return (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm máy bay..."
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
                  <option value="Active">Hoạt động</option>
                  <option value="Maintenance">Bảo trì</option>
                  <option value="Inactive">Không hoạt động</option>
                </select>
              </div>
            </div>

            {/* Aircraft List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách máy bay</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Máy bay
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số đăng ký
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hãng sản xuất
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sức chứa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAircrafts.map((aircraft) => (
                      <tr key={aircraft.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <RocketLaunchIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{aircraft.name}</div>
                              <div className="text-sm text-gray-500">{aircraft.model}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {aircraft.registrationNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {aircraft.manufacturer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {aircraft.capacity} ghế
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(aircraft.status)}`}>
                            {getStatusText(aircraft.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <TrashIcon className="h-4 w-4" />
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
            {activeSubTab === 'flights-add-aircraft' ? 'Thêm máy bay mới' :
             activeSubTab === 'flights-edit-aircraft' ? 'Sửa thông tin máy bay' :
             activeSubTab === 'flights-seat-management' ? 'Quản lý chỗ ngồi' :
             activeSubTab === 'flights-maintenance' ? 'Theo dõi bảo trì máy bay' :
             'Quản lý chuyến bay'}
          </h2>
          <p className="text-gray-600">
            {activeSubTab === 'flights-add-aircraft' ? 'Thêm máy bay mới vào hệ thống' :
             activeSubTab === 'flights-edit-aircraft' ? 'Chỉnh sửa thông tin máy bay' :
             activeSubTab === 'flights-seat-management' ? 'Quản lý sơ đồ chỗ ngồi máy bay' :
             activeSubTab === 'flights-maintenance' ? 'Theo dõi và quản lý lịch trình bảo trì' :
             'Quản lý thông tin máy bay và lịch trình bảo trì'}
          </p>
        </div>
        {activeSubTab === 'flights' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm máy bay
          </button>
        )}
      </div>

      {/* Render sub-content */}
      {renderSubContent()}

      {/* Add Aircraft Modal - only show for main flights tab */}
      {activeSubTab === 'flights' && showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm máy bay mới</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên máy bay</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Boeing 737-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số đăng ký</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="VN-A001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hãng sản xuất</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Chọn hãng sản xuất</option>
                  <option value="Boeing">Boeing</option>
                  <option value="Airbus">Airbus</option>
                  <option value="Embraer">Embraer</option>
                  <option value="ATR">ATR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="737-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Năm sản xuất</label>
                <input
                  type="number"
                  min="1950"
                  max="2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="2018"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="200"
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
                Thêm máy bay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}