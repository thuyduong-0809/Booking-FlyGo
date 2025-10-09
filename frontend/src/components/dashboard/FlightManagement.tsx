'use client';

import React, { useState } from 'react';
import {
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { Flight, Aircraft, Airline, Airport, Terminal, FlightWithDetails } from '../../types/database';

// Extended interfaces for local state management
interface ExtendedFlight extends Flight {
  route: string;
  departureTime: string;
  arrivalTime: string;
  durationText: string;
}

interface ExtendedAircraft extends Aircraft {
  name: string;
  type: string;
  registrationNumber: string;
  manufacturer: string;
  yearOfManufacture: number;
}

interface FlightManagementProps { activeSubTab?: string }

export default function FlightManagement({ activeSubTab = 'flights' }: FlightManagementProps) {
  const [flights, setFlights] = useState<ExtendedFlight[]>([
    {
      FlightID: 1,
      FlightNumber: 'VN001',
      AirlineID: 1,
      DepartureAirportID: 1,
      ArrivalAirportID: 2,
      DepartureTerminalID: 1,
      ArrivalTerminalID: 1,
      DepartureTime: '2024-01-15T08:00:00Z',
      ArrivalTime: '2024-01-15T10:00:00Z',
      AircraftID: 1,
      Duration: 120,
      Status: 'Scheduled',
      EconomyPrice: 1500000,
      BusinessPrice: 3000000,
      FirstClassPrice: 5000000,
      AvailableEconomySeats: 20,
      AvailableBusinessSeats: 0,
      AvailableFirstClassSeats: 0,
      route: 'SGN → HAN',
      departureTime: '08:00',
      arrivalTime: '10:00',
      durationText: '2h 00m'
    },
    {
      FlightID: 2,
      FlightNumber: 'VN002',
      AirlineID: 1,
      DepartureAirportID: 2,
      ArrivalAirportID: 3,
      DepartureTerminalID: 1,
      ArrivalTerminalID: 1,
      DepartureTime: '2024-01-15T14:00:00Z',
      ArrivalTime: '2024-01-15T15:30:00Z',
      AircraftID: 2,
      Duration: 90,
      Status: 'Boarding',
      EconomyPrice: 1200000,
      BusinessPrice: 2500000,
      FirstClassPrice: 4000000,
      AvailableEconomySeats: 44,
      AvailableBusinessSeats: 0,
      AvailableFirstClassSeats: 0,
      route: 'HAN → DAD',
      departureTime: '14:00',
      arrivalTime: '15:30',
      durationText: '1h 30m'
    },
    {
      FlightID: 3,
      FlightNumber: 'VN003',
      AirlineID: 1,
      DepartureAirportID: 3,
      ArrivalAirportID: 1,
      DepartureTerminalID: 1,
      ArrivalTerminalID: 1,
      DepartureTime: '2024-01-15T18:00:00Z',
      ArrivalTime: '2024-01-15T19:30:00Z',
      AircraftID: 1,
      Duration: 90,
      Status: 'Departed',
      EconomyPrice: 1200000,
      BusinessPrice: 2500000,
      FirstClassPrice: 4000000,
      AvailableEconomySeats: 15,
      AvailableBusinessSeats: 5,
      AvailableFirstClassSeats: 0,
      route: 'DAD → SGN',
      departureTime: '18:00',
      arrivalTime: '19:30',
      durationText: '1h 30m'
    }
  ]);

  const [aircrafts, setAircrafts] = useState<ExtendedAircraft[]>([
    {
      AircraftID: 1,
      AircraftCode: 'VN-A001',
      Model: '737-800',
      AirlineID: 1,
      EconomyCapacity: 180,
      BusinessCapacity: 20,
      FirstClassCapacity: 0,
      SeatLayoutJSON: null,
      LastMaintenance: '2024-01-01',
      NextMaintenance: '2024-02-01',
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
      Model: 'A320',
      AirlineID: 1,
      EconomyCapacity: 180,
      BusinessCapacity: 20,
      FirstClassCapacity: 0,
      SeatLayoutJSON: null,
      LastMaintenance: '2024-01-05',
      NextMaintenance: '2024-02-05',
      IsActive: true,
      name: 'Airbus A320',
      type: 'Narrow-body',
      registrationNumber: 'VN-A002',
      manufacturer: 'Airbus',
      yearOfManufacture: 2019
    }
  ]);

  const [airlines, setAirlines] = useState<Airline[]>([
    {
      AirlineID: 1,
      AirlineCode: 'VN',
      AirlineName: 'Vietnam Airlines',
      LogoURL: '',
      ContactNumber: '1900 1100',
      Website: 'vietnamairlines.com',
      IsActive: true
    },
    {
      AirlineID: 2,
      AirlineCode: 'VJ',
      AirlineName: 'VietJet Air',
      LogoURL: '',
      ContactNumber: '1900 1886',
      Website: 'vietjetair.com',
      IsActive: true
    }
  ]);

  const [airports, setAirports] = useState<Airport[]>([
    {
      AirportID: 1,
      AirportCode: 'SGN',
      AirportName: 'Tân Sơn Nhất',
      City: 'TP.HCM',
      Country: 'Vietnam',
      Timezone: 'UTC+7',
      Latitude: 10.8188,
      Longitude: 106.6519
    },
    {
      AirportID: 2,
      AirportCode: 'HAN',
      AirportName: 'Nội Bài',
      City: 'Hà Nội',
      Country: 'Vietnam',
      Timezone: 'UTC+7',
      Latitude: 21.2212,
      Longitude: 105.8072
    },
    {
      AirportID: 3,
      AirportCode: 'DAD',
      AirportName: 'Đà Nẵng',
      City: 'Đà Nẵng',
      Country: 'Vietnam',
      Timezone: 'UTC+7',
      Latitude: 16.0439,
      Longitude: 108.1994
    }
  ]);

  const [terminals, setTerminals] = useState<Terminal[]>([
    {
      TerminalID: 1,
      AirportID: 1,
      TerminalCode: 'T1',
      TerminalName: 'Terminal 1'
    },
    {
      TerminalID: 2,
      AirportID: 2,
      TerminalCode: 'T1',
      TerminalName: 'Terminal 1'
    },
    {
      TerminalID: 3,
      AirportID: 3,
      TerminalCode: 'T1',
      TerminalName: 'Terminal 1'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const getFlightStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'text-green-600 bg-green-100';
      case 'Boarding': return 'text-blue-600 bg-blue-100';
      case 'Departed': return 'text-purple-600 bg-purple-100';
      case 'Arrived': return 'text-green-600 bg-green-100';
      case 'Delayed': return 'text-yellow-600 bg-yellow-100';
      case 'Canceled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredFlights = flights.filter(flight => {
    const matchesSearch = flight.FlightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.route.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || flight.Status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Render content based on active sub-tab
  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'flights-create':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo chuyến bay mới</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số chuyến bay</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="VN001"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Hãng hàng không</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn hãng hàng không</option>
                    {airlines.map((airline) => (
                      <option key={airline.AirlineID} value={airline.AirlineID}>
                        {airline.AirlineName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Sân bay đi</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn sân bay đi</option>
                    {airports.map((airport) => (
                      <option key={airport.AirportID} value={airport.AirportID}>
                        {airport.AirportCode} - {airport.AirportName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Sân bay đến</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn sân bay đến</option>
                    {airports.map((airport) => (
                      <option key={airport.AirportID} value={airport.AirportID}>
                        {airport.AirportCode} - {airport.AirportName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Thời gian khởi hành</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Thời gian đến</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Máy bay</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn máy bay</option>
                    {aircrafts.map((aircraft) => (
                      <option key={aircraft.AircraftID} value={aircraft.AircraftID}>
                        {aircraft.AircraftCode} - {aircraft.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="Scheduled">Scheduled</option>
                    <option value="Boarding">Boarding</option>
                    <option value="Departed">Departed</option>
                    <option value="Arrived">Arrived</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Giá Economy (₫)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="1500000"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Giá Business (₫)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="3000000"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Giá First Class (₫)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="5000000"
                  />
                </div>
              </form>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Tạo chuyến bay
                </button>
              </div>
            </div>
          </div>
        );

      case 'flights-edit':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sửa chuyến bay</h3>
              <div className="mb-4">
                <label className="block text-md font-medium text-gray-700 mb-1">Chọn chuyến bay để chỉnh sửa</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Chọn chuyến bay</option>
                  {flights.map((flight) => (
                    <option key={flight.FlightID} value={flight.FlightID}>
                      {flight.FlightNumber} - {flight.route}
                    </option>
                  ))}
                </select>
              </div>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số chuyến bay</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="VN001"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Hãng hàng không</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn hãng hàng không</option>
                    {airlines.map((airline) => (
                      <option key={airline.AirlineID} value={airline.AirlineID}>
                        {airline.AirlineName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Sân bay đi</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn sân bay đi</option>
                    {airports.map((airport) => (
                      <option key={airport.AirportID} value={airport.AirportID}>
                        {airport.AirportCode} - {airport.AirportName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Sân bay đến</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn sân bay đến</option>
                    {airports.map((airport) => (
                      <option key={airport.AirportID} value={airport.AirportID}>
                        {airport.AirportCode} - {airport.AirportName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Thời gian khởi hành</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Thời gian đến</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Máy bay</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn máy bay</option>
                    {aircrafts.map((aircraft) => (
                      <option key={aircraft.AircraftID} value={aircraft.AircraftID}>
                        {aircraft.AircraftCode} - {aircraft.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="Scheduled">Scheduled</option>
                    <option value="Boarding">Boarding</option>
                    <option value="Departed">Departed</option>
                    <option value="Arrived">Arrived</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Giá Economy (₫)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="1500000"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Giá Business (₫)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="3000000"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Giá First Class (₫)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="5000000"
                  />
                </div>
              </form>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Cập nhật chuyến bay
                </button>
              </div>
            </div>
          </div>
        );

      case 'flights-schedule':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Xem lịch bay</h3>
              <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Từ ngày</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Đến ngày</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Tất cả trạng thái</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Boarding">Boarding</option>
                    <option value="Departed">Departed</option>
                    <option value="Arrived">Arrived</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Chuyến bay</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Tuyến</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Thời gian khởi hành</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Thời gian đến</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Máy bay</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {flights.map((flight) => (
                      <tr key={flight.FlightID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {flight.FlightNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {flight.route}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(flight.DepartureTime).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(flight.ArrivalTime).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          VN-A00{flight.AircraftID}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFlightStatusColor(flight.Status)}`}>
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

      case 'flights-status':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cập nhật trạng thái chuyến bay</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Chọn chuyến bay</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn chuyến bay</option>
                    {flights.map((flight) => (
                      <option key={flight.FlightID} value={flight.FlightID}>
                        {flight.FlightNumber} - {flight.route}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Trạng thái hiện tại</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" disabled>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Cập nhật trạng thái thành</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn trạng thái mới</option>
                    <option value="Boarding">Boarding</option>
                    <option value="Departed">Departed</option>
                    <option value="Arrived">Arrived</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Thời gian cập nhật</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-md font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    rows={3}
                    placeholder="Ghi chú về việc thay đổi trạng thái..."
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Cập nhật trạng thái
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử cập nhật trạng thái</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Chuyến bay</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Tuyến</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Trạng thái cũ</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Trạng thái mới</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Thời gian cập nhật</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Người cập nhật</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        VN001
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        SGN → HAN
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100">
                          Scheduled
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                          Boarding
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        2024-01-15 08:30
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Admin
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        VN002
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        HAN → DAD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                          Boarding
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-purple-600 bg-purple-100">
                          Departed
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        2024-01-15 14:45
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Operator
                      </td>
                    </tr>
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
                    placeholder="Tìm kiếm chuyến bay..."
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
                  <option value="Scheduled">Scheduled</option>
                  <option value="Boarding">Boarding</option>
                  <option value="Departed">Departed</option>
                  <option value="Arrived">Arrived</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Canceled">Canceled</option>
                </select>
              </div>
            </div>

            {/* Flights List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách chuyến bay</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Chuyến bay
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Tuyến
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Thời lượng
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
                    {filteredFlights.map((flight) => (
                      <tr key={flight.FlightID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <RocketLaunchIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{flight.FlightNumber}</div>
                              <div className="text-sm text-gray-500">#{flight.FlightID}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {flight.route}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{flight.departureTime}</div>
                            <div className="text-gray-500">{flight.arrivalTime}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {flight.durationText}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFlightStatusColor(flight.Status)}`}>
                            {flight.Status}
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
            {activeSubTab === 'flights-create' ? 'Tạo chuyến bay' :
              activeSubTab === 'flights-edit' ? 'Sửa chuyến bay' :
                activeSubTab === 'flights-schedule' ? 'Xem lịch bay' :
                  activeSubTab === 'flights-status' ? 'Cập nhật trạng thái' :
                    'Quản lý chuyến bay'}
          </h2>
          <p className="text-gray-600">
            {activeSubTab === 'flights-create' ? 'Tạo chuyến bay mới' :
              activeSubTab === 'flights-edit' ? 'Chỉnh sửa thông tin chuyến bay' :
                activeSubTab === 'flights-schedule' ? 'Xem lịch trình các chuyến bay' :
                  activeSubTab === 'flights-status' ? 'Cập nhật trạng thái chuyến bay' :
                    'Quản lý và theo dõi các chuyến bay'}
          </p>
        </div>
        {activeSubTab === 'flights' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm chuyến bay
          </button>
        )}
      </div>

      {/* Render sub-content */}
      {renderSubContent()}

      {/* Add Flight Modal - only show for main flights tab */}
      {activeSubTab === 'flights' && showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm chuyến bay mới</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Số chuyến bay</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="VN001"
                />
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Hãng hàng không</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Chọn hãng hàng không</option>
                  {airlines.map((airline) => (
                    <option key={airline.AirlineID} value={airline.AirlineID}>
                      {airline.AirlineName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Sân bay đi</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Chọn sân bay đi</option>
                  {airports.map((airport) => (
                    <option key={airport.AirportID} value={airport.AirportID}>
                      {airport.AirportCode} - {airport.AirportName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Sân bay đến</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Chọn sân bay đến</option>
                  {airports.map((airport) => (
                    <option key={airport.AirportID} value={airport.AirportID}>
                      {airport.AirportCode} - {airport.AirportName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Thời gian khởi hành</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Thời gian đến</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Máy bay</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Chọn máy bay</option>
                  {aircrafts.map((aircraft) => (
                    <option key={aircraft.AircraftID} value={aircraft.AircraftID}>
                      {aircraft.AircraftCode} - {aircraft.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Trạng thái</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="Scheduled">Scheduled</option>
                  <option value="Boarding">Boarding</option>
                  <option value="Departed">Departed</option>
                  <option value="Arrived">Arrived</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Canceled">Canceled</option>
                </select>
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Giá Economy (₫)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="1500000"
                />
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Giá Business (₫)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="3000000"
                />
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Giá First Class (₫)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="5000000"
                />
              </div>
            </form>
            <div className="flex justify-end space-x-3 pt-4">
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
                Thêm chuyến bay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}