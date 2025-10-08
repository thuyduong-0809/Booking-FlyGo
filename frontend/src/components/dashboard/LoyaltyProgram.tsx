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

interface Customer {
  id: string;
  name: string;
  email: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
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

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 'C001',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      tier: 'Gold',
      totalPoints: 15000,
      availablePoints: 8500,
      joinDate: '2023-01-15',
      lastActivity: '2024-01-10'
    },
    {
      id: 'C002',
      name: 'Trần Thị B',
      email: 'tranthib@email.com',
      tier: 'Silver',
      totalPoints: 8500,
      availablePoints: 4200,
      joinDate: '2023-06-20',
      lastActivity: '2024-01-08'
    },
    {
      id: 'C003',
      name: 'Lê Văn C',
      email: 'levanc@email.com',
      tier: 'Platinum',
      totalPoints: 25000,
      availablePoints: 18000,
      joinDate: '2022-03-10',
      lastActivity: '2024-01-12'
    }
  ]);

  const [transactions, setTransactions] = useState<PointsTransaction[]>([
    {
      id: 'T001',
      customerName: 'Nguyễn Văn A',
      customerEmail: 'nguyenvana@email.com',
      transactionType: 'Earn',
      points: 500,
      description: 'Đặt vé chuyến bay FG001',
      date: '2024-01-10'
    },
    {
      id: 'T002',
      customerName: 'Trần Thị B',
      customerEmail: 'tranthib@email.com',
      transactionType: 'Redeem',
      points: -1000,
      description: 'Đổi điểm lấy hành lý miễn phí',
      date: '2024-01-08'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'text-orange-600 bg-orange-100';
      case 'Silver': return 'text-gray-600 bg-gray-100';
      case 'Gold': return 'text-yellow-600 bg-yellow-100';
      case 'Platinum': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Inactive': return 'text-gray-600 bg-gray-100';
      case 'Suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'Earn': return 'text-green-600 bg-green-100';
      case 'Redeem': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.tier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render content based on active sub-tab
  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'loyalty-earn':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tích điểm cho khách hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chọn khách hàng</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn khách hàng</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.email} ({customer.tier})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điểm tích</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lý do tích điểm</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn lý do</option>
                    <option value="flight-booking">Đặt vé máy bay</option>
                    <option value="upgrade">Nâng cấp hạng vé</option>
                    <option value="special-offer">Ưu đãi đặc biệt</option>
                    <option value="referral">Giới thiệu bạn bè</option>
                    <option value="birthday">Sinh nhật</option>
                    <option value="other">Lý do khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị giao dịch (₫)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="1000000"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  rows={3}
                  placeholder="Mô tả chi tiết về việc tích điểm..."
                ></textarea>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Tích điểm
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử tích điểm gần đây</h3>
              <div className="space-y-3">
                {transactions.filter(t => t.transactionType === 'Earn').map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.customerName}</p>
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-green-600">+{transaction.points} điểm</span>
                      <p className="text-xs text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                ))}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chọn khách hàng</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn khách hàng</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.availablePoints} điểm
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điểm đổi</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại thưởng</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn loại thưởng</option>
                    <option value="free-baggage">Hành lý miễn phí</option>
                    <option value="seat-upgrade">Nâng cấp ghế</option>
                    <option value="lounge-access">Phòng chờ VIP</option>
                    <option value="discount-voucher">Phiếu giảm giá</option>
                    <option value="free-flight">Vé máy bay miễn phí</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị thưởng (₫)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="500000"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả thưởng</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  rows={3}
                  placeholder="Mô tả chi tiết về phần thưởng..."
                ></textarea>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Đổi điểm
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách thưởng có sẵn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <GiftIcon className="h-6 w-6 text-blue-600 mr-2" />
                    <h4 className="font-medium text-blue-900">Hành lý miễn phí</h4>
                  </div>
                  <p className="text-sm text-blue-700 mb-2">1 kiện hành lý ký gửi 20kg</p>
                  <p className="text-lg font-bold text-blue-600">1,000 điểm</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center mb-2">
                    <StarIcon className="h-6 w-6 text-green-600 mr-2" />
                    <h4 className="font-medium text-green-900">Nâng cấp ghế</h4>
                  </div>
                  <p className="text-sm text-green-700 mb-2">Từ Economy lên Business</p>
                  <p className="text-lg font-bold text-green-600">5,000 điểm</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center mb-2">
                    <ChartBarIcon className="h-6 w-6 text-purple-600 mr-2" />
                    <h4 className="font-medium text-purple-900">Phòng chờ VIP</h4>
                  </div>
                  <p className="text-sm text-purple-700 mb-2">Quyền sử dụng 2 giờ</p>
                  <p className="text-lg font-bold text-purple-600">2,000 điểm</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'loyalty-status':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái chương trình khuyến mãi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <StarIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Tổng khách hàng</p>
                      <p className="text-2xl font-bold text-blue-600">{customers.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Tổng điểm tích</p>
                      <p className="text-2xl font-bold text-green-600">
                        {customers.reduce((sum, customer) => sum + customer.totalPoints, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <GiftIcon className="h-8 w-8 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Điểm đã đổi</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {customers.reduce((sum, customer) => sum + (customer.totalPoints - customer.availablePoints), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">Chương trình hoạt động</p>
                      <p className="text-2xl font-bold text-purple-600">{programs.filter(p => p.status === 'Active').length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố khách hàng theo hạng</h3>
              <div className="space-y-4">
                {['Platinum', 'Gold', 'Silver', 'Bronze'].map((tier) => {
                  const count = customers.filter(c => c.tier === tier).length;
                  const percentage = customers.length > 0 ? (count / customers.length) * 100 : 0;
                  return (
                    <div key={tier} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(tier)}`}>
                          {tier}
                        </span>
                        <span className="ml-3 text-sm text-gray-600">{count} khách hàng</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Giao dịch điểm gần đây</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{transaction.customerName}</div>
                            <div className="text-sm text-gray-500">{transaction.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionColor(transaction.transactionType)}`}>
                            {transaction.transactionType === 'Earn' ? 'Tích điểm' : 'Đổi điểm'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={transaction.transactionType === 'Earn' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.transactionType === 'Earn' ? '+' : ''}{transaction.points}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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

      default:
        return (
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <StarIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng khách hàng</p>
                    <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tổng điểm tích</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {customers.reduce((sum, customer) => sum + customer.totalPoints, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <GiftIcon className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Điểm đã đổi</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {customers.reduce((sum, customer) => sum + (customer.totalPoints - customer.availablePoints), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Chương trình</p>
                    <p className="text-2xl font-bold text-gray-900">{programs.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customers List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách khách hàng</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Khách hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hạng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng điểm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Điểm khả dụng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <StarIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(customer.tier)}`}>
                            {customer.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.totalPoints.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.availablePoints.toLocaleString()}
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
            {activeSubTab === 'loyalty-earn' ? 'Tích điểm khách hàng' :
             activeSubTab === 'loyalty-redeem' ? 'Đổi điểm thưởng' :
             activeSubTab === 'loyalty-status' ? 'Trạng thái chương trình' :
             'Chương trình khuyến mãi'}
          </h2>
          <p className="text-gray-600">
            {activeSubTab === 'loyalty-earn' ? 'Tích điểm cho khách hàng' :
             activeSubTab === 'loyalty-redeem' ? 'Đổi điểm thành phần thưởng' :
             activeSubTab === 'loyalty-status' ? 'Theo dõi trạng thái chương trình' :
             'Quản lý chương trình khuyến mãi và tích điểm'}
          </p>
        </div>
        {activeSubTab === 'loyalty' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm chương trình
          </button>
        )}
      </div>

      {/* Render sub-content */}
      {renderSubContent()}

      {/* Add Program Modal - only show for main loyalty tab */}
      {activeSubTab === 'loyalty' && showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm chương trình khuyến mãi mới</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên chương trình</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Tích điểm đặt vé"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại chương trình</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="Points">Tích điểm</option>
                    <option value="Tier">Thành viên</option>
                    <option value="Cashback">Hoàn tiền</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  rows={3}
                  placeholder="Mô tả chi tiết về chương trình..."
                ></textarea>
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
                  Thêm chương trình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}