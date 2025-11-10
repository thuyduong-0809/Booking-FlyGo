'use client';

import React, { useEffect, useState } from 'react';
import { 
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { User } from '../../types/database';
import { requestApi } from '@/lib/api';
import { clear } from 'console';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Dialog } from '@headlessui/react';

// Extended interface for local state management with additional display fields
interface ExtendedCustomer extends User {
  name: string;
  address: string;
  totalBookings: number;
  totalSpent: number;
  joinDate: string;
  membershipLevel: 'Standard' | 'Silver' | 'Gold' | 'Platinum';
}

export default function CustomerManagement() {
  // const [customers, setCustomers] = useState<ExtendedCustomer[]>([
  //   {
  //     UserID: 1,
  //     Email: 'nguyenvana@email.com',
  //     PasswordHash: '',
  //     FirstName: 'Nguyễn Văn',
  //     LastName: 'A',
  //     Phone: '0901234567',
  //     DateOfBirth: '1990-05-15',
  //     PassportNumber: 'N1234567',
  //     PassportExpiry: '2030-05-15',
  //     RoleID: 2,
  //     LoyaltyTier: 'Gold',
  //     LoyaltyPoints: 4500,
  //     IsActive: true,
  //     CreatedAt: '2023-01-15T00:00:00Z',
  //     LastLogin: '2024-01-15T08:30:00Z',
  //     name: 'Nguyễn Văn A',
  //     address: '123 Đường ABC, Quận 1, TP.HCM',
  //     totalBookings: 15,
  //     totalSpent: 45000000,
  //     joinDate: '2023-01-15',
  //     membershipLevel: 'Gold'
  //   },
  //   {
  //     UserID: 2,
  //     Email: 'tranthib@email.com',
  //     PasswordHash: '',
  //     FirstName: 'Trần Thị',
  //     LastName: 'B',
  //     Phone: '0907654321',
  //     DateOfBirth: '1985-08-22',
  //     PassportNumber: 'N1234568',
  //     PassportExpiry: '2030-08-22',
  //     RoleID: 2,
  //     LoyaltyTier: 'Silver',
  //     LoyaltyPoints: 1800,
  //     IsActive: true,
  //     CreatedAt: '2023-06-10T00:00:00Z',
  //     LastLogin: '2024-01-14T15:20:00Z',
  //     name: 'Trần Thị B',
  //     address: '456 Đường XYZ, Quận 2, TP.HCM',
  //     totalBookings: 8,
  //     totalSpent: 18000000,
  //     joinDate: '2023-06-10',
  //     membershipLevel: 'Silver'
  //   },
  //   {
  //     UserID: 3,
  //     Email: 'levanc@email.com',
  //     PasswordHash: '',
  //     FirstName: 'Lê Văn',
  //     LastName: 'C',
  //     Phone: '0909876543',
  //     DateOfBirth: '1992-12-03',
  //     PassportNumber: 'N1234569',
  //     PassportExpiry: '2030-12-03',
  //     RoleID: 2,
  //     LoyaltyTier: 'Standard',
  //     LoyaltyPoints: 750,
  //     IsActive: false,
  //     CreatedAt: '2023-11-20T00:00:00Z',
  //     LastLogin: '2024-01-10T12:45:00Z',
  //     name: 'Lê Văn C',
  //     address: '789 Đường DEF, Quận 3, TP.HCM',
  //     totalBookings: 3,
  //     totalSpent: 7500000,
  //     joinDate: '2023-11-20',
  //     membershipLevel: 'Bronze'
  //   }
  // ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('');
  const [customers,setCustomers] = useState([])

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getMembershipColor = (level: string) => {
    switch (level) {
      case 'Standard': return 'text-orange-600 bg-orange-100';
      case 'Silver': return 'text-gray-600 bg-gray-100';
      case 'Gold': return 'text-yellow-600 bg-yellow-100';
      case 'Platinum': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Hoạt động' : 'Không hoạt động';
  };

  const filteredCustomers = customers.filter((customer:any) => {
    const matchesSearch = customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        //  customer.phone.toString().includes(searchTerm) ||
                         customer.userId.toString().includes(searchTerm);
    const matchesStatus = !statusFilter || (statusFilter === 'Active' ? customer.isActive : !customer.isActive);
    const matchesMembership = !membershipFilter || customer.loyaltyTier === membershipFilter;
    return matchesSearch && matchesStatus && matchesMembership;
  });

  useEffect(()=>{
      loadCustomers()
      loadBookings()

  },[])

  const loadCustomers = async () => {
    await requestApi("users/customers", "GET").then((res: any) => {
      // console.log("res",res);
      if (res.success) {
         setCustomers(res.data)
      }
    }).catch((error: any) => {
      console.error(error)
    });
  }

  const [bookings,setBookings] = useState([])
    const loadBookings = async () => {
    await requestApi("bookings", "GET").then((res: any) => {
      // console.log("res",res);
      if (res.success) {
         setBookings(res.data)
      }
    }).catch((error: any) => {
      console.error(error)
    });
  }

  const [customerData, setCustomerData] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  passwordHash: "",
  confirmPassword: "",
  dateOfBirth: "",
  loyaltyTier: "Standard",
  isActive:true
});

  const clearData = () =>{
    setCustomerData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      passwordHash: "",
      confirmPassword: "",
      dateOfBirth: "",
      loyaltyTier: "Standard",
      isActive:true,
    })
    
  }

  const [customerUpdateData, setCustomerUpdateData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      passwordHash: "",
      confirmPassword: "",
      dateOfBirth: "",
      loyaltyTier: "Standard",
      isActive:true
  })

const [selectedId,setSelectedId]= useState(0)

const [errors, setErrors] = useState<any>({});
const [UpdateErrors, setUpdateErrors] = useState<any>({});
const validateCustomerInputs = () => {
    const newErrors: any = {};

    // --- Họ và tên ---
    if (!customerData.firstName || customerData.firstName.trim() === "") {
      newErrors.firstName = "Vui lòng nhập họ.";
    }

    if (!customerData.lastName || customerData.lastName.trim() === "") {
      newErrors.lastName = "Vui lòng nhập tên.";
    }

    // --- Email ---
    if (!customerData.email || customerData.email.trim() === "") {
      newErrors.email = "Vui lòng nhập email.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerData.email)) {
        newErrors.email = "Email không hợp lệ.";
      }
    }

    // --- Số điện thoại ---
    if (!customerData.phone || customerData.phone.trim() === "") {
      newErrors.phone = "Vui lòng nhập số điện thoại.";
    } else {
      const phoneRegex = /^(0|\+84)(\d{9,10})$/; // Ví dụ cho VN
      if (!phoneRegex.test(customerData.phone)) {
        newErrors.phone = "Số điện thoại không hợp lệ (phải có 10 chữ số).";
      }
    }

    // --- Mật khẩu ---
    if (!customerData.passwordHash || customerData.passwordHash.trim() === "") {
      newErrors.passwordHash = "Vui lòng nhập mật khẩu.";
    } else if (customerData.passwordHash.length < 6) {
      newErrors.passwordHash = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    // --- Xác nhận mật khẩu ---
    if (!customerData.confirmPassword || customerData.confirmPassword.trim() === "") {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (customerData.confirmPassword !== customerData.passwordHash) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    // --- Ngày sinh ---
    if (!customerData.dateOfBirth) {
      newErrors.dateOfBirth = "Vui lòng chọn ngày sinh.";
    } else {
      const dob = new Date(customerData.dateOfBirth);
      const today = new Date();
      if (dob >= today) {
        newErrors.dateOfBirth = "Ngày sinh phải nhỏ hơn ngày hiện tại.";
      }
    }

    // --- Hạng thành viên ---
    if (!customerData.loyaltyTier) {
      newErrors.loyaltyTier = "Vui lòng chọn hạng thành viên.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; 
  };
  
  const addCustomer = ()=>{
    if(!validateCustomerInputs()) return
    requestApi("users","POST",customerData).then((res:any)=>{
        if(res.success){
           alert('Thêm khách hàng thành công!')
           setShowAddModal(false)
           setErrors({})
           clearData()
           loadCustomers()
           
        }
    }).catch((err:any)=>{
        console.error(err)
    })
  }

    const handleSelectCustomerId = (id: string) => {
      requestApi(`users/${id}`, "GET").then((res: any) => {
        if (res.success)
          setCustomerUpdateData(res.data)
          setSelectedId(Number(id))
      }).catch((err: any) => {
        console.error(err)
      })
    }

    const updateCustomer = ()=>{
    // if(!validateCustomerInputs()) return
    requestApi(`users/${String(selectedId)}`,"PUT",customerUpdateData).then((res:any)=>{
        if(res.success){
           alert('Cập nhật khách hàng thành công!')
           setShowUpdateModal(false)
           loadCustomers()
          //  clearData()
           
        }
    }).catch((err:any)=>{
        console.error(err)
    })



  }
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
  const confirmDelete = (userId: number) => {
    setCustomerToDelete(userId);
    setIsDeleteConfirmOpen(true);
  };

  const deleteCustomer =(id: string): void=>{
    requestApi(`users/${id}`,"DELETE").then((res:any)=>{
        if(res.success){
           alert('xóa khách hàng thành công!')
          //  setIsDeleteConfirmOpen(false)
           loadCustomers()
          //  clearData()
           
        }
    }).catch((err:any)=>{
        console.error(err)
    })

  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý khách hàng</h2>
          <p className="text-gray-600">Quản lý thông tin và trạng thái khách hàng</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Thêm khách hàng
        </button>
        
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng khách hàng</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter((c:any) => c.isActive === true).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Thành viên VIP</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter((c:any) => c.loyaltyTier === 'Gold' || c.loyaltyTier === 'Platinum').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <EnvelopeIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng đặt chỗ</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.length}
                {/* {customers.reduce((sum, (c:any)) => sum + c.totalBookings, 0)} */}
              </p>
            </div>
          </div>
        </div>
      </div>

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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Hoạt động</option>
            <option value="Inactive">Không hoạt động</option>
            <option value="Blocked">Bị khóa</option>
          </select>
          <select 
            value={membershipFilter}
            onChange={(e) => setMembershipFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="">Tất cả hạng thành viên</option>
            <option value="Standard">Standard</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Danh sách khách hàng</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin liên hệ
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Hạng thành viên
                </th>
                {/* <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Thống kê
                </th> */}
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
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
              {filteredCustomers.map((customer:any) => (
                <tr key={customer.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <UserGroupIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.firstName} {customer.lastName}</div>
                        <div className="text-sm text-gray-500">#{customer.userId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMembershipColor(customer.loyaltyTier)}`}>
                      {customer.loyaltyTier}
                    </span>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{customer.totalBookings} đặt chỗ</div>
                      <div className="text-sm text-gray-500">₫{customer.totalSpent.toLocaleString()}</div>
                    </div>
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.isActive)}`}>
                      {getStatusText(customer.isActive)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button className="text-green-600 hover:text-green-900"
                      onClick={()=>{setShowUpdateModal(true),handleSelectCustomerId(customer.userId)}}>
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900" onClick={()=>confirmDelete(customer.userId)}>
                        <TrashIcon className="h-5 w-5" />
                      </button>


                    </div>
                  </td>
                </tr>
              ))}
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
                            Bạn có chắc muốn xóa khách hàng này không?
                          </p>

                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => setIsDeleteConfirmOpen(false)}
                              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => {
                                if (customerToDelete) {
                                  deleteCustomer(customerToDelete.toString());
                                  setIsDeleteConfirmOpen(false);
                                  console.error('customerToDelete',customerToDelete)
                                }
                              }}
                              className="px-3 py-1 bg-red-600 text-white ``rounded hover:bg-red-700"
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

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm khách hàng mới</h3>
                <form className="space-y-4" onSubmit={(e)=>{
                  e.preventDefault()
                  addCustomer()
                }}>
                  {/* Họ và tên */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-md font-medium text-gray-700 mb-1">Họ</label>
                      <input
                        type="text"
                        name="firstName"
                        value={customerData.firstName ?? ""}
                        onChange={(e) => setCustomerData({ ...customerData, firstName: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                          errors.firstName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Họ"
                      />
                      {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>

                    <div>
                      <label className="block text-md font-medium text-gray-700 mb-1">Tên</label>
                      <input
                        type="text"
                        name="lastName"
                        value={customerData.lastName}
                        onChange={(e) => setCustomerData({ ...customerData, lastName: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                          errors.lastName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Tên đệm và tên"
                      />
                      {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  {/* Email và số điện thoại */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-md font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={customerData.email}
                        onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="simpleuser@example.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-md font-medium text-gray-700 mb-1">Số điện thoại</label>
                      <input
                        type="tel"
                        name="phone"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Nhập số điện thoại"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Mật khẩu và xác nhận mật khẩu */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-md font-medium text-gray-700 mb-1">Mật khẩu</label>
                      <input
                        type="password"
                        name="passwordHash"
                        value={customerData.passwordHash}
                        onChange={(e) => setCustomerData({ ...customerData, passwordHash: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                          errors.passwordHash ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Nhập mật khẩu"
                      />
                      {errors.passwordHash && <p className="text-red-500 text-sm mt-1">{errors.passwordHash}</p>}
                    </div>

                    <div>
                      <label className="block text-md font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={customerData.confirmPassword}
                        onChange={(e) => setCustomerData({ ...customerData, confirmPassword: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                          errors.confirmPassword ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Nhập lại mật khẩu"
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Ngày sinh và hạng thành viên */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-md font-medium text-gray-700 mb-1">Ngày sinh</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={customerData.dateOfBirth}
                        onChange={(e) => setCustomerData({ ...customerData, dateOfBirth: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                          errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                    </div>

                    <div>
                      <label className="block text-md font-medium text-gray-700 mb-1">Hạng thành viên</label>
                      <select
                        name="loyaltyTier"
                        value={customerData.loyaltyTier}
                        onChange={(e) => setCustomerData({ ...customerData, loyaltyTier: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                          errors.loyaltyTier ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="Standard">Standard</option>
                        <option value="Silver">Silver</option>
                        <option value="Gold">Gold</option>
                        <option value="Platinum">Platinum</option>
                      </select>
                      {errors.loyaltyTier && <p className="text-red-500 text-sm mt-1">{errors.loyaltyTier}</p>}
                    </div>
                     <div>
                      <label className="block text-md font-medium text-gray-700 mb-1">Trạng thái</label>
                      <select
                        name="isActive"
                        value={customerData.isActive ? "true" : "false"}
                        onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          isActive: e.target.value === "true", // ép kiểu boolean
                        })
                      }
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                          errors.isActive ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="false">Không hoạt động</option>
                        <option value="true">Hoạt động</option>
                      </select>
                      {errors.isActive && <p className="text-red-500 text-sm mt-1">{errors.isActive}</p>}
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {setShowAddModal(false),setErrors({})}}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Thêm khách hàng
                    </button>
                  </div>
                </form>
          </div>
        </div>

      )}



    {/* Update Customer Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cập nhật thông tin khách hàng</h3>
                <form className="space-y-4" onSubmit={(e)=>{
                  e.preventDefault()
                  updateCustomer()
                }}>
                  {/* Họ và tên */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-md font-medium text-gray-700 mb-1">Họ</label>
                      <input
                        type="text"
                        name="firstName"
                        value={customerUpdateData.firstName ?? ""}
                        onChange={(e) => setCustomerUpdateData({ ...customerUpdateData, firstName: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                          UpdateErrors.firstName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Họ"
                      />
                      {UpdateErrors.firstName && <p className="text-red-500 text-sm mt-1">{UpdateErrors.firstName}</p>}
                    </div>

                    <div>
                      <label className="block text-md font-medium text-gray-700 mb-1">Tên</label>
                      <input
                        type="text"
                        name="lastName"
                        value={customerUpdateData.lastName}
                        onChange={(e) => setCustomerUpdateData({ ...customerUpdateData, lastName: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                          UpdateErrors.lastName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Tên đệm và tên"
                      />
                      {UpdateErrors.lastName && <p className="text-red-500 text-sm mt-1">{UpdateErrors.lastName}</p>}
                    </div>
                  </div>

                  {/* Email và số điện thoại */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-md font-medium text-gray-700 mb-1">Email</label>
                      <input
                        readOnly
                        type="email"
                        name="email"
                        value={customerUpdateData.email}
                        onChange={(e) => setCustomerUpdateData({ ...customerUpdateData, email: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                          UpdateErrors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="simpleuser@example.com"
                      />
                      {UpdateErrors.email && <p className="text-red-500 text-sm mt-1">{UpdateErrors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-md font-medium text-gray-700 mb-1">Số điện thoại</label>
                      <input
                        type="tel"
                        name="phone"
                        value={customerUpdateData.phone}
                        onChange={(e) => setCustomerUpdateData({ ...customerUpdateData, phone: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                         UpdateErrors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Nhập số điện thoại"
                      />
                      {UpdateErrors.phone && <p className="text-red-500 text-sm mt-1">{UpdateErrors.phone}</p>}
                    </div>
                  </div>

                  {/* Mật khẩu và xác nhận mật khẩu */}
                  {/* <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-md font-medium text-gray-700 mb-1">Mật khẩu</label>
                      <input
                        type="password"
                        name="passwordHash"
                        value={customerUpdateData.passwordHash}
                        onChange={(e) => setCustomerUpdateData({ ...customerUpdateData, passwordHash: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                          errors.passwordHash ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Nhập mật khẩu"
                      />
                      {errors.passwordHash && <p className="text-red-500 text-sm mt-1">{errors.passwordHash}</p>}
                    </div>

                    <div>
                      <label className="block text-md font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={customerUpdateData.confirmPassword}
                        onChange={(e) => setCustomerUpdateData({ ...customerUpdateData, confirmPassword: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                          errors.confirmPassword ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Nhập lại mật khẩu"
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div> */}

                  {/* Ngày sinh và hạng thành viên */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-md font-medium text-gray-700 mb-1">Ngày sinh</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={customerUpdateData.dateOfBirth}
                        onChange={(e) => setCustomerUpdateData({ ...customerUpdateData, dateOfBirth: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                         UpdateErrors.dateOfBirth ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {UpdateErrors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{UpdateErrors.dateOfBirth}</p>}
                    </div>

                    <div>
                      <label className="block text-md font-medium text-gray-700 mb-1">Hạng thành viên</label>
                      <select
                        name="loyaltyTier"
                        value={customerUpdateData.loyaltyTier}
                        onChange={(e) => setCustomerUpdateData({ ...customerUpdateData, loyaltyTier: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                          UpdateErrors.loyaltyTier ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="Standard">Standard</option>
                        <option value="Silver">Silver</option>
                        <option value="Gold">Gold</option>
                        <option value="Platinum">Platinum</option>
                      </select>
                      {UpdateErrors.loyaltyTier && <p className="text-red-500 text-sm mt-1">{UpdateErrors.loyaltyTier}</p>}
                    </div>

                    <div>
                      <label className="block text-md font-medium text-gray-700 mb-1">Trạng thái</label>
                      <select
                        name="isActive"
                        value={customerUpdateData.isActive ? "true" : "false"}
                        onChange={(e) =>
                        setCustomerUpdateData({
                          ...customerUpdateData,
                          isActive: e.target.value === "true", // ép kiểu boolean
                        })
                      }
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                          UpdateErrors.isActive ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="false">Không hoạt động</option>
                        <option value="true">Hoạt động</option>
                      </select>
                      {UpdateErrors.isActive && <p className="text-red-500 text-sm mt-1">{UpdateErrors.isActive}</p>}
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowUpdateModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Cập nhật
                    </button>
                  </div>
                </form>
          </div>
        </div>

      )}
    </div>
  );

}
