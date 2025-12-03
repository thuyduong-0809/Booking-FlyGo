'use client';

import React, { useEffect, useState } from 'react';
import {
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  TruckIcon,
  TicketIcon
} from '@heroicons/react/24/outline';

import { CheckIn as DbCheckIn } from '../../types/database';
import { requestApi } from '@/lib/api';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface Checkin extends DbCheckIn {
  bookingNumber: string;
  passengerName: string;
  flightNumber: string;
  route: string;
  seatNumber: string;
  checkinTime: string;
  status: 'Checked In' | 'Boarding' | 'Boarded' | 'No Show';
}

interface CheckinManagementProps { activeSubTab?: string }

export default function CheckinManagement({ activeSubTab = 'checkin' }: CheckinManagementProps) {
  // const [checkins, setCheckins] = useState<Checkin[]>([
  //   {
  //     CheckinID: 1,
  //     BookingFlightID: 1,
  //     PassengerID: 1,
  //     CheckinType: 'Online',
  //     CheckedInAt: '2024-01-15T08:00:00Z',
  //     BoardingPassURL: '#',
  //     BaggageCount: 1,
  //     BaggageWeight: 20,
  //     BoardingStatus: 'Boarded',
  //     bookingNumber: 'FG240115001',
  //     passengerName: 'Nguyễn Văn A',
  //     flightNumber: 'VN001',
  //     route: 'SGN → HAN',
  //     seatNumber: '12A',
  //     checkinTime: '08:00',
  //     status: 'Checked In'
  //   },
  //   {
  //     CheckinID: 2,
  //     BookingFlightID: 2,
  //     PassengerID: 2,
  //     CheckinType: 'Airport',
  //     CheckedInAt: '2024-01-15T11:15:00Z',
  //     BoardingPassURL: '#',
  //     BaggageCount: 1,
  //     BaggageWeight: 25,
  //     BoardingStatus: 'Boarded',
  //     bookingNumber: 'FG240115002',
  //     passengerName: 'Trần Thị B',
  //     flightNumber: 'VN002',
  //     route: 'HAN → DAD',
  //     seatNumber: '15B',
  //     checkinTime: '11:15',
  //     status: 'Boarding'
  //   },
  //   {
  //     CheckinID: 3,
  //     BookingFlightID: 3,
  //     PassengerID: 3,
  //     CheckinType: 'Online',
  //     CheckedInAt: '2024-01-15T13:30:00Z',
  //     BoardingPassURL: '#',
  //     BaggageCount: 1,
  //     BaggageWeight: 18,
  //     BoardingStatus: 'Boarded',
  //     bookingNumber: 'FG240115003',
  //     passengerName: 'Lê Văn C',
  //     flightNumber: 'VN003',
  //     route: 'DAD → SGN',
  //     seatNumber: '8C',
  //     checkinTime: '13:30',
  //     status: 'Boarded'
  //   }
  // ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [checkins, setCheckins] = useState([])
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NotBoarded': return 'text-green-600 bg-green-100';
      case 'Boarded': return 'text-blue-600 bg-blue-100';
      case 'GateClosed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NotBoarded': return 'Đang chờ lên máy bay';
      case 'Boarded': return 'Đã lên máy bay';
      case 'GateClosed': return 'Cổng đã đóng"';
      default: return status;
    }
  };

  const filteredCheckins = checkins.filter((checkin: any) => {
    const passengerName = checkin.passenger.firstName + checkin.passenger.lastName
    const matchesSearch = checkin.bookingFlight.bookingFlightId ||
      passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkin.passenger.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checkin.bookingFlight.seatNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || checkin.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // bật loading trước
      await Promise.all([
        loadCheckins()
      ]);
      setLoading(false); // tắt loading sau khi load xong
    };

    fetchData();
  }, []);


  const loadCheckins = async () => {
    await requestApi("check-ins", "GET").then((res: any) => {
      if (res.success) {
        setCheckins(res.data)
      }
    }).catch((error: any) => {
      console.error(error)
    });
  }


  const [checkInData, setCheckInData] = useState({
    bookingFlightId: 0, // ID chuyến bay trong booking
    // passengerId: 0,

    checkInType: "Airport", // hoặc "Online" — kiểu check-in
    baggageCount: 0, // số kiện hành lý
    baggageWeight: 0, // tổng trọng lượng (kg)

    boardingStatus: "", // trạng thái: NotBoarded | Boarded | GateClosed
  });




  const clearData = () => {
    setCheckInData({
      bookingFlightId: 0,

      checkInType: "Airport",

      baggageCount: 0,
      baggageWeight: 0,

      boardingStatus: "",
    })
    setErrors({})

  }



  const [checkInOnlineData, setCheckInOnlineData] = useState({
    bookingFlightId: 0, // ID chuyến bay trong booking
    // passengerId: 0,

    checkInType: "Online", // hoặc "Online" — kiểu check-in

    boardingStatus: "", // trạng thái: NotBoarded | Boarded | GateClosed
  });


  const clearDataOnline = () => {
    setCheckInOnlineData({
      bookingFlightId: 0,

      checkInType: "Airport",

      boardingStatus: "",
    })

    setErrors({})
    // setBoardingUrl("")

  }


  const [boardingUrl, setBoardingUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});
  const validateCheckInInputs = () => {
    const newErrors: { [key: string]: string } = {};

    if (!checkInData.bookingFlightId) newErrors.bookingFlightId = "Vui lòng nhập mã vé";
    if (!checkInData.checkInType) newErrors.checkInType = "Vui lòng chọn hình thức check-in";
    if (!checkInData.boardingStatus) newErrors.boardingStatus = "Vui lòng chọn trạng thái lên máy bay";

    if (checkInData.baggageCount < 0)
      newErrors.baggageCount = "Số kiện hành lý không được âm";

    if (checkInData.baggageWeight < 0)
      newErrors.baggageWeight = "Trọng lượng hành lý không được âm";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const [errorsOnline, setErrorsOnline] = useState<any>({});

  const validateCheckInOnlineInputs = () => {
    const newErrors: { [key: string]: string } = {};

    if (!checkInOnlineData.bookingFlightId) newErrors.bookingFlightId = "Vui lòng nhập mã vé";
    if (!checkInOnlineData.checkInType) newErrors.checkInType = "Vui lòng chọn hình thức check-in";
    if (!checkInOnlineData.boardingStatus) newErrors.boardingStatus = "Vui lòng chọn trạng thái lên máy bay";

    setErrorsOnline(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const addCheckInAirport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCheckInInputs()) return

    setLoading(true);
    requestApi("check-ins", "POST", checkInData).then((res: any) => {
      if (res.success) {
        alert(`Tạo check-in tại sân bay thành công`)
        setBoardingUrl(`http://localhost:3001${res.data.boardingPassUrl}`); //hiển thị link PDF
        setShowAddModal(false)
        clearData()
        loadCheckins()
        setLoading(false)

      } else if (res.errorCode === 'BOOKINGFLIGHT_NOT_EXIST') {
        setErrors((prev: any) => ({
          ...prev,
          bookingFlightId: "Mã vé không tồn tại",
        }));
      } else if (res.errorCode === 'PASSENGER_NOT_EXIST') {
        setErrors((prev: any) => ({
          ...prev,
          passengerId: "Hành khách không tồn tại",
        }));
      } else if (res.errorCode === 'BOOKINGFLIGHT_DUPLICATE') {
        setErrors((prev: any) => ({
          ...prev,
          bookingFlightId: "Vé này đã check-in,vui lòng nhập mã vé khác!",
        }));
      }
      else {
        alert('Thêm thất bại')
      }
    }).catch((err: any) => {
      console.error(err)
    }).finally(() => {
      // chỉ tắt loading sau khi mọi thứ hoàn tất
      setLoading(false);
    });
  }



  const [boardingUrlOnline, setBoardingUrlOnline] = useState<string | null>(null);
  const addCheckInOnline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCheckInOnlineInputs()) return

    setLoading(true);
    requestApi("check-ins/online", "POST", checkInOnlineData).then((res: any) => {
      if (res.success) {
        alert('Tạo check-in trực tuyến thành công')
        setBoardingUrlOnline(`http://localhost:3001${res.data.boardingPassUrl}`); //hiển thị link PDF
        // window.open(`http://localhost:3001${res.data.boardingPassUrl}`, "_blank");
        setShowAddModal(false)
        //  setErrors({})
        clearDataOnline()
        loadCheckins()
        setLoading(false)
        loadCheckins()

      } else if (res.errorCode === 'BOOKINGFLIGHT_NOT_EXIST') {
        setErrorsOnline((prev: any) => ({
          ...prev,
          bookingFlightId: "Mã vé không tồn tại",
        }));
      } else if (res.errorCode === 'PASSENGER_NOT_EXIST') {
        setErrorsOnline((prev: any) => ({
          ...prev,
          passengerId: "Hành khách không tồn tại",
        }));
      }
      else if (res.errorCode === 'BOOKINGFLIGHT_DUPLICATE') {
        setErrorsOnline((prev: any) => ({
          ...prev,
          bookingFlightId: "Vé này đã check-in,vui lòng nhập mã vé khác!",
        }));
      }
      else {
        alert('Thêm thất bại')
      }
    }).catch((err: any) => {
      console.error(err)
    }).finally(() => {
      // chỉ tắt loading sau khi mọi thứ hoàn tất
      setLoading(false);
    });
  }



  const updateCheckinStatus = (id: number) => {
    const payload = {
      boardingStatus: "Boarded"
    };
    requestApi(`check-ins/${String(id)}`, 'PUT', payload).then((res: any) => {
      if (res.success) {
        loadCheckins()
      } else {
        alert('update thất bại')
      }
    }).catch((error: any) => {
      console.error(error)
    })
  }

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [checkinToDelete, setCheckinToDelete] = useState<number | null>(null);
  const confirmDelete = (checkInId: number) => {
    setCheckinToDelete(checkInId);
    setIsDeleteConfirmOpen(true);
  };

  const deleteCheckin = (id: number) => {

    requestApi(`check-ins/${String(id)}`, 'DELETE',).then((res: any) => {
      if (res.success) {
        loadCheckins()
      } else {
        alert('xóa thất bại')
      }
    }).catch((error: any) => {
      console.error(error)
    })
  }

  if (loading) {
    return <div className='text-gray-800'>Vui lòng đợi...</div>;
  }
  // Render content based on active sub-tab
  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'checkin-airport':
        return (
          <div className="space-y-6">
            {/* FORM CHECK-IN */}
            <form onSubmit={addCheckInAirport}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo Check-in</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* bookingFlightId */}
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">
                      Mã vé(bookingFlightId)
                    </label>
                    <input
                      type="number"
                      value={checkInData.bookingFlightId || ""}
                      onChange={(e) => {
                        setCheckInData({ ...checkInData, bookingFlightId: Number(e.target.value) }),
                          setErrors((prev: any) => ({ ...prev, bookingFlightId: "" }));
                      }

                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${errors.bookingFlightId ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="VD: 12"
                    />
                    {errors.bookingFlightId && (
                      <p className="text-red-500 text-sm mt-1">{errors.bookingFlightId}</p>
                    )}
                  </div>

                  {/* passengerId */}
                  {/* <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">
                      ID Hành khách (passengerId)
                    </label>
                    <input
                      type="number"
                      value={checkInData.passengerId || ""}
                      onChange={(e) =>{
                         setCheckInData({ ...checkInData, passengerId: Number(e.target.value) }),
                         setErrors((prev: any) => ({ ...prev,passengerId: "" }));
                      }
                       
                      }
                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${
                        errors.passengerId ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="VD: 12"
                    />
                    {errors.passengerId && (
                      <p className="text-red-500 text-sm mt-1">{errors.passengerId}</p>
                    )}
                  </div> */}

                  {/* checkInType */}
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">
                      Hình thức Check-in
                    </label>
                    <select
                      value={checkInData.checkInType}
                      onChange={(e) => {
                        setCheckInData({ ...checkInData, checkInType: e.target.value });
                        setErrors((prev: any) => ({ ...prev, checkInType: "" }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${errors.checkInType ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Chọn loại</option>
                      <option value="Airport">Tại sân bay</option>
                    </select>
                    {errors.checkInType && (
                      <p className="text-red-500 text-sm mt-1">{errors.checkInType}</p>
                    )}
                  </div>

                  {/* boardingStatus */}
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">
                      Trạng thái lên máy bay
                    </label>
                    <select
                      value={checkInData.boardingStatus}
                      onChange={(e) => {
                        setCheckInData({ ...checkInData, boardingStatus: e.target.value });
                        setErrors((prev: any) => ({ ...prev, boardingStatus: "" }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${errors.boardingStatus ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Chọn trạng thái</option>
                      <option value="NotBoarded">Chưa lên máy bay</option>
                      <option value="Boarded">Đã lên máy bay</option>
                      <option value="GateClosed">Đã đóng cửa</option>
                    </select>
                    {errors.boardingStatus && (
                      <p className="text-red-500 text-sm mt-1">{errors.boardingStatus}</p>
                    )}
                  </div>

                  {/* baggageCount */}
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">
                      Số kiện hành lý
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={checkInData.baggageCount || ""}
                      onChange={(e) => {
                        setCheckInData({ ...checkInData, baggageCount: Number(e.target.value) });
                        setErrors((prev: any) => ({ ...prev, baggageCount: "" }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${errors.baggageCount ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="VD: 2"
                    />
                    {errors.baggageCount && (
                      <p className="text-red-500 text-sm mt-1">{errors.baggageCount}</p>
                    )}
                  </div>

                  {/* baggageWeight */}
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">
                      Tổng trọng lượng hành lý (kg)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      value={checkInData.baggageWeight || ""}
                      onChange={(e) => {
                        setCheckInData({ ...checkInData, baggageWeight: Number(e.target.value) });
                        setErrors((prev: any) => ({ ...prev, baggageWeight: "" }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${errors.baggageWeight ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="VD: 23.5"
                    />
                    {errors.baggageWeight && (
                      <p className="text-red-500 text-sm mt-1">{errors.baggageWeight}</p>
                    )}
                  </div>
                  <br />

                  {boardingUrl && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-300 rounded-lg">
                      <p className="text-green-700 font-medium mb-2">
                        ✅ Check-in thành công! Boarding Pass của bạn:
                      </p>
                      <a
                        href={boardingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Xem / Tải Boarding Pass (PDF)
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() =>
                      clearData()
                    }
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Check-in
                  </button>
                </div>
              </div>
            </form>

            {/* DANH SÁCH CHECK-IN */}
            {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách check-in</h3>
              <div className="space-y-3">
                {checkins.map((checkin:any) => (
                  <div key={checkin.checkInId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">#{checkin.checkInId} - {checkin.passenger.name}</p>
                      <p className="text-sm text-gray-600">
                        Flight ID: {checkin.bookingFlight.bookingFlightId} | Type: {checkin.checkInType}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(checkin.boardingStatus)}`}>
                        {checkin.boardingStatus}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">Hành lý: {checkin.baggageWeight}kg</p>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>

        );

      // case 'checkin-online':
      //   return (
      //     <div className="space-y-6">
      //       <form onSubmit={addCheckInOnline}>
      //         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      //           <h3 className="text-lg font-semibold text-gray-900 mb-4">Check-in trực tuyến</h3>
      //           <div className="mb-4">
      //             <label className="block text-md font-medium text-gray-700 mb-1">Tìm kiếm đặt chỗ</label>
      //             <div className="flex space-x-4">
      //               <input
      //                 type="text"
      //                 className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
      //                 placeholder="Nhập số đặt chỗ hoặc mã vé"
      //               />
      //               <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
      //                 Tìm kiếm
      //               </button>
      //             </div>
      //           </div>
      //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      //             {/* bookingFlightId */}
      //             <div>
      //               <label className="block text-md font-medium text-gray-700 mb-1">
      //                 Mã vé (bookingFlightId)
      //               </label>
      //               <input
      //                 type="number"
      //                 value={checkInOnlineData.bookingFlightId || ""}
      //                 onChange={(e) => {
      //                   setCheckInOnlineData({ ...checkInOnlineData, bookingFlightId: Number(e.target.value) }),
      //                     setErrorsOnline((prev: any) => ({ ...prev, bookingFlightId: "" }));
      //                 }

      //                 }
      //                 className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${errorsOnline.bookingFlightId ? "border-red-500" : "border-gray-300"
      //                   }`}
      //                 placeholder="VD: 12"
      //               />
      //               {errorsOnline.bookingFlightId && (
      //                 <p className="text-red-500 text-sm mt-1">{errorsOnline.bookingFlightId}</p>
      //               )}
      //             </div>
      //             {/* checkInType */}
      //             <div>
      //               <label className="block text-md font-medium text-gray-700 mb-1">
      //                 Hình thức Check-in
      //               </label>
      //               <select
      //                 value={checkInOnlineData.checkInType}
      //                 onChange={(e) => {
      //                   setCheckInOnlineData({ ...checkInOnlineData, checkInType: e.target.value });
      //                   setErrorsOnline((prev: any) => ({ ...prev, checkInType: "" }));
      //                 }}
      //                 className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${errorsOnline.checkInType ? "border-red-500" : "border-gray-300"
      //                   }`}
      //               >
      //                 {/* <option value="">Chọn loại</option> */}
      //                 <option value="Online">Trực tuyến</option>
      //               </select>
      //               {errorsOnline.checkInType && (
      //                 <p className="text-red-500 text-sm mt-1">{errorsOnline.checkInType}</p>
      //               )}
      //             </div>

      //             {/* boardingStatus */}
      //             <div>
      //               <label className="block text-md font-medium text-gray-700 mb-1">
      //                 Trạng thái lên máy bay
      //               </label>
      //               <select
      //                 value={checkInOnlineData.boardingStatus}
      //                 onChange={(e) => {
      //                   setCheckInOnlineData({ ...checkInOnlineData, boardingStatus: e.target.value });
      //                   setErrorsOnline((prev: any) => ({ ...prev, boardingStatus: "" }));
      //                 }}
      //                 className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${errorsOnline.boardingStatus ? "border-red-500" : "border-gray-300"
      //                   }`}
      //               >
      //                 <option value="">Chọn trạng thái</option>
      //                 <option value="NotBoarded">Chưa lên máy bay</option>
      //                 <option value="Boarded">Đã lên máy bay</option>
      //                 <option value="GateClosed">Đã đóng cửa</option>
      //               </select>
      //               {errorsOnline.boardingStatus && (
      //                 <p className="text-red-500 text-sm mt-1">{errorsOnline.boardingStatus}</p>
      //               )}
      //             </div>
      //           </div>
      //           <div className="mt-6 flex justify-end space-x-3">
      //             <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      //               onClick={() => { clearDataOnline(), setBoardingUrlOnline("") }}>
      //               Hủy
      //             </button>
      //             <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
      //               Check-in trực tuyến
      //             </button>
      //           </div>
      //           {boardingUrlOnline && (
      //             <div className="mt-6 p-4 bg-green-50 border border-green-300 rounded-lg">
      //               <p className="text-green-700 font-medium mb-2">
      //                 ✅ Check-in thành công! Boarding Pass đã dược gửi về mail khách hàng:
      //               </p>
      //               <a
      //                 href={boardingUrlOnline}
      //                 target="_blank"
      //                 rel="noopener noreferrer"
      //                 className="text-blue-600 hover:underline font-semibold"
      //               >
      //                 Xem / Tải Boarding Pass (PDF)
      //               </a>
      //             </div>
      //           )}
      //         </div>
      //       </form>
      //       {/* Check-ins List */}
      //       <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      //         <div className="px-6 py-4 border-b border-gray-200">
      //           <h3 className="text-lg font-semibold text-gray-900">Check-in trực tuyến gần đây</h3>
      //         </div>
      //         <div className="overflow-x-auto">
      //           <table className="w-full">
      //             <thead className="bg-gray-50">
      //               <tr>
      //                 <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
      //                   Số đặt chỗ
      //                 </th>
      //                 <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
      //                   Hành khách
      //                 </th>
      //                 <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
      //                   Chuyến bay
      //                 </th>
      //                 <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
      //                   Ghế
      //                 </th>
      //                 <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
      //                   Loại check-in
      //                 </th>
      //                 <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
      //                   Trạng thái
      //                 </th>
      //                 <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
      //                   Thao tác
      //                 </th>
      //               </tr>
      //             </thead>
      //             <tbody className="bg-white divide-y divide-gray-200">
      //               {checkins.filter((c: any) => c.checkInType === 'Online').map((checkin: any) => (
      //                 <tr key={checkin.checkInId} className="hover:bg-gray-50">
      //                   <td className="px-6 py-4 whitespace-nowrap">
      //                     <div className="flex items-center">
      //                       <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
      //                         <UserGroupIcon className="h-5 w-5 text-blue-600" />
      //                       </div>
      //                       <div>
      //                         <div className="text-sm font-medium text-gray-900">{checkin.bookingFlight.booking.bookingReference}</div>
      //                         <div className="text-sm text-gray-500">#{checkin.checkInId}</div>
      //                       </div>
      //                     </div>
      //                   </td>
      //                   <td className="px-6 py-4 whitespace-nowrap text-md text-gray-900">
      //                     {checkin.passenger.lastName} {checkin.passenger.firstName}
      //                   </td>
      //                   <td className="px-6 py-4 whitespace-nowrap text-mdmd text-gray-900">
      //                     {checkin.bookingFlight.flight.flightNumber}
      //                   </td>
      //                   <td className="px-6 py-4 whitespace-nowrap text-md text-gray-900">
      //                     {checkin.bookingFlight.seatNumber}
      //                   </td>
      //                   <td className="px-6 py-4 whitespace-nowrap text-mdmd text-gray-900">
      //                     {checkin.checkInType}
      //                   </td>
      //                   <td className="px-6 py-4 whitespace-nowrap">
      //                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(checkin.boardingStatus)}`}>
      //                       {getStatusText(checkin.boardingStatus)}
      //                     </span>
      //                   </td>
      //                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      //                     <div className="flex items-center space-x-2">
      //                       {/* <button className="text-blue-600 hover:text-blue-900">
      //                         <EyeIcon className="h-5 w-5" />
      //                       </button> */}
      //                       {/* <button className="text-green-600 hover:text-green-900">
      //                         <PencilIcon className="h-5 w-5" />
      //                       </button> */}
      //                       <button className="text-red-600 hover:text-red-900"
      //                         onClick={() => confirmDelete(checkin.checkInId)}>
      //                         <TrashIcon className="h-5 w-5" />
      //                       </button>
      //                     </div>
      //                   </td>
      //                 </tr>
      //               ))}
      //               <Dialog
      //                 open={isDeleteConfirmOpen}
      //                 onClose={() => setIsDeleteConfirmOpen(false)}
      //                 className="relative z-50"
      //               >
      //                 <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      //                 <div className="fixed inset-0 flex items-center justify-center p-4">
      //                   <Dialog.Panel className="bg-white rounded-lg shadow-lg w-[320px] p-5">
      //                     <div className="flex justify-between items-center mb-3">
      //                       <Dialog.Title className="text-lg font-semibold text-gray-800">
      //                         Xác nhận xóa
      //                       </Dialog.Title>
      //                       <button onClick={() => setIsDeleteConfirmOpen(false)}>
      //                         <XMarkIcon className="h-5 w-5 text-gray-500" />
      //                       </button>
      //                     </div>

      //                     <p className="text-gray-600 mb-5">
      //                       Bạn có chắc muốn xóa check-in này không?
      //                     </p>

      //                     <div className="flex justify-end space-x-3">
      //                       <button
      //                         onClick={() => setIsDeleteConfirmOpen(false)}
      //                         className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-400"
      //                       >
      //                         Hủy
      //                       </button>
      //                       <button
      //                         onClick={() => {
      //                           if (checkinToDelete) {
      //                             deleteCheckin(checkinToDelete);
      //                             setIsDeleteConfirmOpen(false);
      //                             console.error('checkinToDelete', checkinToDelete)
      //                           }
      //                         }}
      //                         className="px-3 py-1 bg-red-600 text-white ``rounded hover:bg-red-700"
      //                       >
      //                         Xóa
      //                       </button>
      //                     </div>
      //                   </Dialog.Panel>
      //                 </div>
      //               </Dialog>
      //             </tbody>
      //           </table>
      //         </div>
      //       </div>

      //     </div>
      //   );

      case 'checkin-baggage':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý hành lý</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số đặt chỗ</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="FG240115001"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Tên hành khách</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Loại hành lý</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn loại hành lý</option>
                    <option value="carry-on">Hành lý xách tay</option>
                    <option value="checked">Hành lý ký gửi</option>
                    <option value="special">Hành lý đặc biệt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Trọng lượng (kg)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số lượng</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Phí hành lý (₫)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-md font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  rows={3}
                  placeholder="Ghi chú về hành lý..."
                ></textarea>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Xác nhận hành lý
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê hành lý</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TruckIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Hành lý ký gửi</p>
                      <p className="text-2xl font-bold text-blue-600">45</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TicketIcon className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Hành lý xách tay</p>
                      <p className="text-2xl font-bold text-green-600">78</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ClockIcon className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">Đang xử lý</p>
                      <p className="text-2xl font-bold text-purple-600">12</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'checkin-boarding':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý lên máy bay</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Chuyến bay</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn chuyến bay</option>
                    <option value="FG001">FG001 - SGN → HAN</option>
                    <option value="FG002">FG002 - HAN → DAD</option>
                    <option value="FG003">FG003 - DAD → SGN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Cổng lên máy bay</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn cổng</option>
                    <option value="Gate A1">Cổng A1</option>
                    <option value="Gate A2">Cổng A2</option>
                    <option value="Gate B1">Cổng B1</option>
                    <option value="Gate B2">Cổng B2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Thời gian bắt đầu lên máy bay</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Thời gian đóng cổng</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Bắt đầu lên máy bay
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách hành khách lên máy bay</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Tên hành khách</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Số đặt chỗ</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Ghế</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {checkins.map((checkin: any) => (
                      <tr key={checkin.checkInId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {checkin.passenger.lastName} {checkin.passenger.firstName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {checkin.bookingFlight.booking.bookingReference}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {checkin.bookingFlight.seatNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(checkin.boardingStatus)}`}>
                            {getStatusText(checkin.boardingStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {checkin.boardingStatus === 'NotBoarded' && (
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => updateCheckinStatus(checkin.checkInId)}
                            >
                              Xác nhận lên máy bay
                            </button>
                          )}
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
                    placeholder="Tìm kiếm check-in..."
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
                  <option value="Checked In">Đã check-in</option>
                  <option value="Boarding">Đang lên máy bay</option>
                  <option value="Boarded">Đã lên máy bay</option>
                  <option value="No Show">Không xuất hiện</option>
                </select>
              </div>
            </div>

            {/* Check-ins List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách check-in</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Số đặt chỗ
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Hành khách
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Chuyến bay
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Ghế
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Loại check-in
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
                    {checkins.map((checkin: any) => (
                      <tr key={checkin.checkInId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <UserGroupIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{checkin.bookingFlight.booking.bookingReference}</div>
                              <div className="text-sm text-gray-500">#{checkin.checkInId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-md text-gray-900">
                          {checkin.passenger.lastName} {checkin.passenger.firstName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-mdmd text-gray-900">
                          {checkin.bookingFlight.flight.flightNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-md text-gray-900">
                          {checkin.bookingFlight.seatNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-mdmd text-gray-900">
                          {checkin.checkInType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(checkin.boardingStatus)}`}>
                            {getStatusText(checkin.boardingStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {/* <button className="text-blue-600 hover:text-blue-900">
                              <EyeIcon className="h-5 w-5" />
                            </button> */}
                            {/* <button className="text-green-600 hover:text-green-900">
                              <PencilIcon className="h-5 w-5" />
                            </button> */}
                            <button className="text-red-600 hover:text-red-900"
                              onClick={() => confirmDelete(checkin.checkInId)}>
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
                            Bạn có chắc muốn xóa check-in này không?
                          </p>

                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => setIsDeleteConfirmOpen(false)}
                              className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-400"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => {
                                if (checkinToDelete) {
                                  deleteCheckin(checkinToDelete);
                                  setIsDeleteConfirmOpen(false);
                                  console.error('checkinToDelete', checkinToDelete)
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
            {activeSubTab === 'checkin-airport' ? 'Check-in tại sân bay' :
              // activeSubTab === 'checkin-online' ? 'Check-in trực tuyến' :
                activeSubTab === 'checkin-baggage' ? 'Quản lý hành lý' :
                  activeSubTab === 'checkin-boarding' ? 'Quản lý lên máy bay' :
                    'Check-in & Boarding'}
          </h2>
          <p className="text-gray-600">
            {activeSubTab === 'checkin-airport' ? 'Check-in hành khách tại sân bay' :
              // activeSubTab === 'checkin-online' ? 'Check-in trực tuyến cho hành khách' :
                activeSubTab === 'checkin-baggage' ? 'Quản lý hành lý của hành khách' :
                  activeSubTab === 'checkin-boarding' ? 'Quản lý quá trình lên máy bay' :
                    'Quản lý check-in và lên máy bay của hành khách'}
          </p>
        </div>
        {/* {activeSubTab === 'checkin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm check-in
          </button>
        )} */}
      </div>

      {/* Render sub-content */}
      {renderSubContent()}

      {/* Add Check-in Modal - only show for main checkin tab */}
      {activeSubTab === 'checkin' && showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm check-in mới</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số đặt chỗ</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="FG240115001"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Chuyến bay</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn chuyến bay</option>
                    <option value="FG001">FG001 - SGN → HAN</option>
                    <option value="FG002">FG002 - HAN → DAD</option>
                    <option value="FG003">FG003 - DAD → SGN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Tên hành khách</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số ghế</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="12A"
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Loại check-in</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="Online">Trực tuyến</option>
                    <option value="Airport">Tại sân bay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Trọng lượng hành lý (kg)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="20"
                  />
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
                  Thêm check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}