'use client';

import React, { useState } from 'react';
import { 
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  StarIcon,
  GiftIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { User, Notification } from '../../types/database';

interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  type: 'Points' | 'Tier' | 'Cashback';
  status: 'Active' | 'Inactive' | 'Suspended';
  startDate: string;
  endDate: string;
  targetAudience: string;
  benefits: string[];
}

// Extended interface for loyalty program display
interface ExtendedCustomer extends User {
  name: string;
  totalPoints: number;
  availablePoints: number;
  joinDate: string;
  lastActivity: string;
}

interface PointsTransaction {
  id: string;
  customerName: string;
  customerEmail: string;
  transactionType: 'Earn' | 'Redeem';
  points: number;
  description: string;
  date: string;
}

interface LoyaltyProgramProps { activeSubTab?: string }

export default function LoyaltyProgram({ activeSubTab = 'loyalty' }: LoyaltyProgramProps) {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([
    {
      id: 'LP001',
      name: 'Tích điểm đặt vé',
      description: 'Tích 1 điểm cho mỗi 10,000 VNĐ chi tiêu',
      type: 'Points',
      status: 'Active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      targetAudience: 'Tất cả khách hàng',
      benefits: ['Tích điểm', 'Đổi thưởng', 'Ưu đãi đặc biệt']
    },
    {
      id: 'LP002',
      name: 'Thành viên VIP',
      description: 'Chương trình thành viên VIP với nhiều ưu đãi',
      type: 'Tier',
      status: 'Active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      targetAudience: 'Khách hàng thân thiết',
      benefits: ['Ưu tiên check-in', 'Phòng chờ VIP', 'Hành lý miễn phí']
    }
  ]);

  const [customers, setCustomers] = useState<ExtendedCustomer[]>([
    {
      UserID: 1,
      Email: 'nguyenvana@email.com',
      PasswordHash: '',
      FirstName: 'Nguyễn Văn',
      LastName: 'A',
      Phone: '0901234567',
      DateOfBirth: '1990-05-15',
      PassportNumber: 'N1234567',
      PassportExpiry: '2030-05-15',
      RoleID: 2,
      LoyaltyTier: 'Gold',
      LoyaltyPoints: 15000,
      IsActive: true,
      CreatedAt: '2023-01-15T00:00:00Z',
      LastLogin: '2024-01-15T08:30:00Z',
      name: 'Nguyễn Văn A',
      totalPoints: 15000,
      availablePoints: 8500,
      joinDate: '2023-01-15',
      lastActivity: '2024-01-10'
    },
    {
      UserID: 2,
      Email: 'tranthib@email.com',
      PasswordHash: '',
      FirstName: 'Trần Thị',
      LastName: 'B',
      Phone: '0907654321',
      DateOfBirth: '1985-08-22',
      PassportNumber: 'N1234568',
      PassportExpiry: '2030-08-22',
      RoleID: 2,
      LoyaltyTier: 'Silver',
      LoyaltyPoints: 8500,
      IsActive: true,
      CreatedAt: '2023-06-10T00:00:00Z',
      LastLogin: '2024-01-14T15:20:00Z',
      name: 'Trần Thị B',
      totalPoints: 8500,
      availablePoints: 4200,
      joinDate: '2023-06-20',
      lastActivity: '2024-01-08'
    },
    {
      UserID: 3,
      Email: 'levanc@email.com',
      PasswordHash: '',
      FirstName: 'Lê Văn',
      LastName: 'C',
      Phone: '0909876543',
      DateOfBirth: '1992-12-03',
      PassportNumber: 'N1234569',
      PassportExpiry: '2030-12-03',
      RoleID: 2,
      LoyaltyTier: 'Platinum',
      LoyaltyPoints: 25000,
      IsActive: true,
      CreatedAt: '2022-03-10T00:00:00Z',
      LastLogin: '2024-01-12T10:15:00Z',
      name: 'Lê Văn C',
      totalPoints: 25000,
      availablePoints: 18000,
      joinDate: '2022-03-10',
      lastActivity: '2024-01-12'
    }
  ]);

  const [transactions, setTransactions] = useState<PointsTransaction[]>([
    {
      id: 'TXN001',
      customerName: 'Nguyễn Văn A',
      customerEmail: 'nguyenvana@email.com',
      transactionType: 'Earn',
      points: 1500,
      description: 'Đặt vé chuyến bay SGN-HAN',
      date: '2024-01-15'
    },
    {
      id: 'TXN002',
      customerName: 'Trần Thị B',
      customerEmail: 'tranthib@email.com',
      transactionType: 'Redeem',
      points: -2000,
      description: 'Đổi thưởng nâng cấp ghế',
      date: '2024-01-14'
    },
    {
      id: 'TXN003',
      customerName: 'Lê Văn C',
      customerEmail: 'levanc@email.com',
      transactionType: 'Earn',
      points: 3000,
      description: 'Đặt vé chuyến bay quốc tế',
      date: '2024-01-12'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('');

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Standard': return 'text-gray-600 bg-gray-100';
      case 'Silver': return 'text-gray-600 bg-gray-100';
      case 'Gold': return 'text-yellow-600 bg-yellow-100';
      case 'Platinum': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTierText = (tier: string) => {
    switch (tier) {
      case 'Standard': return 'Standard';
      case 'Silver': return 'Silver';
      case 'Gold': return 'Gold';
      case 'Platinum': return 'Platinum';
      default: return tier;
    }
  };

  const getTransactionColor = (type: string) => {
    return type === 'Earn' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.UserID.toString().includes(searchTerm);
    const matchesTier = !tierFilter || customer.LoyaltyTier === tierFilter;
    return matchesSearch && matchesTier;
  });

  // Render content based on active sub-tab
  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'loyalty-earn':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tích điểm thưởng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Khách hàng</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn khách hàng</option>
                    {customers.map((customer) => (
                      <option key={customer.UserID} value={customer.UserID}>
                        {customer.name} - {customer.Email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Loại giao dịch</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn loại</option>
                    <option value="booking">Đặt vé</option>
                    <option value="upgrade">Nâng cấp dịch vụ</option>
                    <option value="referral">Giới thiệu bạn</option>
                    <option value="special">Ưu đãi đặc biệt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số điểm</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Mô tả</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Tích điểm cho đặt vé chuyến bay"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Tích điểm
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử tích điểm</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Điểm</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.filter(t => t.transactionType === 'Earn').map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionColor(transaction.transactionType)}`}>
                            Tích điểm
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          +{transaction.points}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'loyalty-redeem':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Đổi điểm thưởng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Khách hàng</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn khách hàng</option>
                    {customers.map((customer) => (
                      <option key={customer.UserID} value={customer.UserID}>
                        {customer.name} - {customer.availablePoints} điểm
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Loại đổi thưởng</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn loại</option>
                    <option value="upgrade">Nâng cấp ghế</option>
                    <option value="baggage">Thêm hành lý</option>
                    <option value="lounge">Phòng chờ VIP</option>
                    <option value="discount">Giảm giá vé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số điểm đổi</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="2000"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Giá trị tương đương (₫)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="200000"
                    readOnly
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Đổi thưởng
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử đổi thưởng</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Điểm</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.filter(t => t.transactionType === 'Redeem').map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionColor(transaction.transactionType)}`}>
                            Đổi thưởng
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.points}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'loyalty-status':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái chương trình</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <StarIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Tổng thành viên</p>
                      <p className="text-2xl font-bold text-blue-600">{customers.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <GiftIcon className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Điểm đã tích</p>
                      <p className="text-2xl font-bold text-green-600">
                        {customers.reduce((sum, c) => sum + c.LoyaltyPoints, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">Điểm đã đổi</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {transactions.filter(t => t.transactionType === 'Redeem').reduce((sum, t) => sum + Math.abs(t.points), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố hạng thành viên</h3>
              <div className="space-y-4">
                {['Platinum', 'Gold', 'Silver', 'Standard'].map((tier) => {
                  const count = customers.filter(c => c.LoyaltyTier === tier).length;
                  const percentage = customers.length > 0 ? (count / customers.length) * 100 : 0;
                  return (
                    <div key={tier} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(tier)}`}>
                          {getTierText(tier)}
                        </span>
                        <span className="ml-3 text-sm text-gray-600">{count} thành viên</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
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
                    placeholder="Tìm kiếm khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>
                <select 
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="">Tất cả hạng</option>
                  <option value="Standard">Standard</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
            </div>

            {/* Customers List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách thành viên</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Khách hàng
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Hạng thành viên
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Điểm tích lũy
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Điểm khả dụng
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tham gia
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.UserID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <StarIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.Email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(customer.LoyaltyTier)}`}>
                            {getTierText(customer.LoyaltyTier)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.LoyaltyPoints.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.availablePoints.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(customer.CreatedAt).toLocaleDateString('vi-VN')}
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
            {activeSubTab === 'loyalty-earn' ? 'Tích điểm thưởng' :
             activeSubTab === 'loyalty-redeem' ? 'Đổi điểm thưởng' :
             activeSubTab === 'loyalty-status' ? 'Trạng thái chương trình' :
             'Chương trình khuyến mãi'}
          </h2>
          <p className="text-gray-600">
            {activeSubTab === 'loyalty-earn' ? 'Tích điểm cho khách hàng' :
             activeSubTab === 'loyalty-redeem' ? 'Đổi điểm thành thưởng' :
             activeSubTab === 'loyalty-status' ? 'Theo dõi trạng thái chương trình' :
             'Quản lý chương trình khuyến mãi và thành viên'}
          </p>
        </div>
        {activeSubTab === 'loyalty' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tạo chương trình
          </button>
        )}
      </div>

      {/* Render sub-content */}
      {renderSubContent()}

      {/* Add Program Modal - only show for main loyalty tab */}
      {activeSubTab === 'loyalty' && showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo chương trình khuyến mãi mới</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Tên chương trình</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Tích điểm đặc biệt"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Loại chương trình</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="Points">Tích điểm</option>
                    <option value="Tier">Hạng thành viên</option>
                    <option value="Cashback">Hoàn tiền</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-md font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    rows={3}
                    placeholder="Mô tả chi tiết chương trình khuyến mãi..."
                  ></textarea>
                </div>
              </div>
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
                  Tạo chương trình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}