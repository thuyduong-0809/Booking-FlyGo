'use client';

import React, { useEffect, useState } from 'react';
import {
  RocketLaunchIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { Aircraft, Maintenance, Seat, Airline } from '../../types/database';
import { requestApi } from 'lib/api';

// Extended interfaces for local state management
interface ExtendedAircraft extends Aircraft {
  name: string;
  type: string;
  registrationNumber: string;
  manufacturer: string;
  yearOfManufacture: number;
}

interface ExtendedSeat extends Seat {
  aircraftName: string;
}

interface ExtendedMaintenance extends Maintenance {
  aircraftName: string;
  technician: string;
  duration: number;
}

interface AircraftManagementProps {
  activeSubTab?: string;
}

export default function AircraftManagement({ activeSubTab = 'aircraft' }: AircraftManagementProps) {

  const [loading, setLoading] = useState(true);
  // const [aircrafts,setAircrafts] = useState([])
  const [AircraftsList, setAircraftsList] = useState([]);
  const [aircraftCode, setAircraftCode] = useState('');
  const [model, setModel] = useState('');
  const [airlineId, setAirlineId] = useState<number | null>(null);

  const [economyCapacity, setEconomyCapacity] = useState<number | null>(null);
  const [businessCapacity, setBusinessCapacity] = useState<number | null>(null);
  const [firstClassCapacity, setFirstClassCapacity] = useState<number | null>(null);

  const [seatLayoutJSON, setSeatLayoutJSON] = useState({
    layout: {
      Economy: '',
      Business: '',
      First: ''
    },
    hasWiFi: false,
    hasPremiumEntertainment: false
  });

  const [lastMaintenance, setLastMaintenance] = useState('');
  const [nextMaintenance, setNextMaintenance] = useState('');
  const [isActive, setIsActive] = useState(true);


  useEffect(() => {
    loadAircrafts()
    setLoading(false);
   }, []);

  const loadAircrafts = async () =>{
     await requestApi("aircrafts", "GET").then((res:any)=>{
      console.log("res",res);
      if(res.success){
        setAircraftsList(res.data)
      }
     }).catch((error:any)=>{
      console.error(error)
     });
    }


  const addAircraft = ():void => {
     
    
  }


  const [aircrafts, setAircrafts] = useState<ExtendedAircraft[]>([
    {
      AircraftID: 1,
      AircraftCode: 'VN-A001',
      Model: 'Boeing 737-800',
      AirlineID: 1,
      EconomyCapacity: 180,
      BusinessCapacity: 20,
      FirstClassCapacity: 0,
      SeatLayoutJSON: null,
      LastMaintenance: '2024-01-15',
      NextMaintenance: '2024-07-15',
      IsActive: true,
      name: 'Boeing 737-800',
      type: 'Narrow-body',
      registrationNumber: 'VN-A001',
      manufacturer: 'Boeing',
      yearOfManufacture: 2018
    },
    {
      AircraftID: 2,
      AircraftCode: 'VN-A002',
      Model: 'Airbus A320',
      AirlineID: 1,
      EconomyCapacity: 150,
      BusinessCapacity: 30,
      FirstClassCapacity: 0,
      SeatLayoutJSON: null,
      LastMaintenance: '2024-01-10',
      NextMaintenance: '2024-07-10',
      IsActive: true,
      name: 'Airbus A320',
      type: 'Narrow-body',
      registrationNumber: 'VN-A002',
      manufacturer: 'Airbus',
      yearOfManufacture: 2019
    },
    {
      AircraftID: 3,
      AircraftCode: 'VN-A003',
      Model: 'Boeing 787-9',
      AirlineID: 1,
      EconomyCapacity: 250,
      BusinessCapacity: 30,
      FirstClassCapacity: 20,
      SeatLayoutJSON: null,
      LastMaintenance: '2024-01-05',
      NextMaintenance: '2024-07-05',
      IsActive: false,
      name: 'Boeing 787-9',
      type: 'Wide-body',
      registrationNumber: 'VN-A003',
      manufacturer: 'Boeing',
      yearOfManufacture: 2020
    }
  ]);

  const [seats, setSeats] = useState<ExtendedSeat[]>([
    {
      SeatID: 1,
      AircraftID: 1,
      SeatNumber: '1A',
      TravelClass: 'Business',
      Row: 1,
      Column: 'A',
      Status: 'Available',
      IsAvailable: true,
      Features: null,
      aircraftName: 'Boeing 737-800'
    },
    {
      SeatID: 2,
      AircraftID: 1,
      SeatNumber: '1B',
      TravelClass: 'Business',
      Row: 1,
      Column: 'B',
      Status: 'Available',
      IsAvailable: true,
      Features: null,
      aircraftName: 'Boeing 737-800'
    },
    {
      SeatID: 3,
      AircraftID: 1,
      SeatNumber: '2A',
      TravelClass: 'Economy',
      Row: 2,
      Column: 'A',
      Status: 'Occupied',
      IsAvailable: false,
      Features: null,
      aircraftName: 'Boeing 737-800'
    },
    {
      SeatID: 4,
      AircraftID: 1,
      SeatNumber: '2B',
      TravelClass: 'Economy',
      Row: 2,
      Column: 'B',
      Status: 'Available',
      IsAvailable: true,
      Features: null,
      aircraftName: 'Boeing 737-800'
    },
    {
      SeatID: 5,
      AircraftID: 1,
      SeatNumber: '3A',
      TravelClass: 'Economy',
      Row: 3,
      Column: 'A',
      Status: 'Available',
      IsAvailable: true,
      Features: null,
      aircraftName: 'Boeing 737-800'
    }
  ]);

  const [maintenances, setMaintenances] = useState<ExtendedMaintenance[]>([
    {
      id: 1,
      aircraftID: 1,
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
      id: 2,
      aircraftID: 3,
      aircraftName: 'Boeing 787-9',
      type: 'Unscheduled',
      description: 'Sửa chữa động cơ',
      scheduledDate: '2024-01-15',
      status: 'In Progress',
      technician: 'Trần Văn B',
      duration: 24
    },
    {
      id: 3,
      aircraftID: 2,
      aircraftName: 'Airbus A320',
      type: 'Scheduled',
      description: 'Bảo dưỡng hệ thống điều hòa',
      scheduledDate: '2024-01-25',
      status: 'Scheduled',
      technician: 'Lê Văn C',
      duration: 12
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

  const filteredAircrafts = AircraftsList.filter((aircraft:any) => {
    const matchesSearch = 
      aircraft.aircraftCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aircraft.airline.airlineName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || (statusFilter === 'Active' ? aircraft.isActive : !aircraft.isActive);
    return matchesSearch && matchesStatus;
  });

  
    if (loading) {
    return <div>Loading...</div>;
  }
  // Render content based on active sub-tab
  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'aircraft-add':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm máy bay mới</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Tên máy bay</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Boeing 737-800"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số đăng ký</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="VN-A001"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Hãng sản xuất</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn hãng sản xuất</option>
                    <option value="Boeing">Boeing</option>
                    <option value="Airbus">Airbus</option>
                    <option value="Embraer">Embraer</option>
                    <option value="ATR">ATR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="737-800"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Năm sản xuất</label>
                  <input
                    type="number"
                    min="1950"
                    max="2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="2018"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Loại máy bay</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn loại</option>
                    <option value="Narrow-body">Narrow-body</option>
                    <option value="Wide-body">Wide-body</option>
                    <option value="Regional">Regional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Sức chứa</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="200"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Trạng thái</label>
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

      case 'aircraft-edit':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sửa thông tin máy bay</h3>
              <div className="mb-4">
                <label className="block text-md font-medium text-gray-700 mb-1">Chọn máy bay để chỉnh sửa</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Chọn máy bay</option>
                  {aircrafts.map((aircraft) => (
                    <option key={aircraft.AircraftID} value={aircraft.AircraftID}>
                      {aircraft.name} - {aircraft.registrationNumber}
                    </option>
                  ))}
                </select>
              </div>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Tên máy bay</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Boeing 737-800"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số đăng ký</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="VN-A001"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Hãng sản xuất</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="Boeing">Boeing</option>
                    <option value="Airbus">Airbus</option>
                    <option value="Embraer">Embraer</option>
                    <option value="ATR">ATR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="737-800"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Năm sản xuất</label>
                  <input
                    type="number"
                    min="1950"
                    max="2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="2018"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Loại máy bay</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="Narrow-body">Narrow-body</option>
                    <option value="Wide-body">Wide-body</option>
                    <option value="Regional">Regional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Sức chứa</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="200"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Trạng thái</label>
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

      case 'aircraft-seats':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý chỗ ngồi</h3>
              <div className="mb-4">
                <label className="block text-md font-medium text-gray-700 mb-1">Chọn máy bay</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Chọn máy bay</option>
                  {aircrafts.map((aircraft) => (
                    <option key={aircraft.AircraftID} value={aircraft.AircraftID}>
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
                      key={seat.SeatID}
                      className={`p-2 text-sm text-center rounded border cursor-pointer ${seat.Status === 'Available'
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : seat.Status === 'Occupied'
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'bg-red-100 border-red-300 text-red-800'
                        }`}
                    >
                      {seat.SeatNumber}
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
                  <label className="block text-md font-medium text-gray-700 mb-1">Số ghế</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="1A"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Hạng ghế</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="Economy">Economy</option>
                    <option value="Business">Business</option>
                    <option value="First">First</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Trạng thái</label>
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

      case 'aircraft-maintenance':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Theo dõi bảo trì máy bay</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Máy bay</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn máy bay</option>
                    {aircrafts.map((aircraft) => (
                      <option key={aircraft.AircraftID} value={aircraft.AircraftID}>
                        {aircraft.name} - {aircraft.registrationNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Loại bảo trì</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn loại</option>
                    <option value="Scheduled">Định kỳ</option>
                    <option value="Unscheduled">Không định kỳ</option>
                    <option value="Emergency">Khẩn cấp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Ngày lên lịch</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Kỹ thuật viên</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-md font-medium text-gray-700 mb-1">Mô tả công việc</label>
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
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Máy bay</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Ngày lên lịch</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Kỹ thuật viên</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
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
                        <td className="px-6 py-4 whitespace-nowrap text-md text-gray-900">
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
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Máy bay
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Số đăng ký
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Hãng hàng không
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Sức chứa
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
                    {filteredAircrafts.map((aircraft:any) => (
                      // console.log('aircraft', aircraft),
                      <tr key={aircraft.aircraftId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <RocketLaunchIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{aircraft.aircraftCode}</div>
                              <div className="text-sm text-gray-500">{aircraft.model}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {aircraft.aircraftCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {aircraft.airline.airlineName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {aircraft.economyCapacity + aircraft.businessCapacity + aircraft.firstClassCapacity} ghế
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${aircraft.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                            {aircraft.isActive ? 'Hoạt động' : 'Không hoạt động'}
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
            {activeSubTab === 'aircraft-add' ? 'Thêm máy bay mới' :
              activeSubTab === 'aircraft-edit' ? 'Sửa thông tin máy bay' :
                activeSubTab === 'aircraft-seats' ? 'Quản lý chỗ ngồi' :
                  activeSubTab === 'aircraft-maintenance' ? 'Theo dõi bảo trì máy bay' :
                    'Quản lý máy bay'}
          </h2>
          <p className="text-gray-600">
            {activeSubTab === 'aircraft-add' ? 'Thêm máy bay mới vào hệ thống' :
              activeSubTab === 'aircraft-edit' ? 'Chỉnh sửa thông tin máy bay' :
                activeSubTab === 'aircraft-seats' ? 'Quản lý sơ đồ chỗ ngồi máy bay' :
                  activeSubTab === 'aircraft-maintenance' ? 'Theo dõi và quản lý lịch trình bảo trì' :
                    'Quản lý thông tin máy bay và lịch trình bảo trì'}
          </p>
        </div>
        {activeSubTab === 'aircraft' && (
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

      {/* Add Aircraft Modal - only show for main aircraft tab */}
      {activeSubTab === 'aircraft' && showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm máy bay mới</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Tên máy bay</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Boeing 737-800"
                  onChange={(val) => {
                    setModel(val.target.value);
                  }}
                 />
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Số đăng ký</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="VN-A001"
                  onChange={(val)=>{
                    setAircraftCode(val.target.value)
                  }}
                />
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Hãng hàng không</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Chọn hãng hàng không</option>
                  <option value="1">Vietnam Airlines</option>
                  <option value="Airbus">VietJet Air</option>
                  <option value="Embraer">Bamboo Airways</option>
                  <option value="ATR">Pacific Airlines</option>
                  <option value="">Vietravel Airlines</option>
                  <option value="">Singapore Airlines</option>
                </select>
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="737-800"
                />
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Năm sản xuất</label>
                <input
                  type="number"
                  min="1950"
                  max="2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="2018"
                />
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Sức chứa</label>
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