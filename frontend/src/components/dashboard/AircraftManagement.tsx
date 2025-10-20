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

  const [lastMaintenance, setLastMaintenance] = useState("");
  const [nextMaintenance, setNextMaintenance] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<any>({});
  const [ updateErrors, setUpdateErrors] = useState<any>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [aircraftUpdateData, setAircraftUpdateData] = useState({
      aircraftCode: "",
      model: "",
      economyCapacity: 0,
      businessCapacity: 0,
      firstClassCapacity: 0,
      seatLayoutJSON: {
        layout: { Economy: "", Business: "", First: "" },
        hasWiFi: false,
        hasPremiumEntertainment: false,
      },
      lastMaintenance: "",
      nextMaintenance: "",
      isActive: true,
    });

    const [airlines,setAirlines] = useState([])

  useEffect(() => {
    loadAircrafts()
    loadAirlines()
    setLoading(false);
   }, []);

  const loadAircrafts = async () =>{
     await requestApi("aircrafts", "GET").then((res:any)=>{
      // console.log("res",res);
      if(res.success){
        setAircraftsList(res.data)
      }
     }).catch((error:any)=>{
      console.error(error)
     });
    }
    
    const loadAirlines = async () =>{
           await requestApi("airlines", "GET").then((res:any)=>{
            if(res.success){
              setAirlines(res.data)
            }
           }).catch((error:any)=>{
            console.error(error)
           });
    }

  const validateInputs = () => {
      const newErrors: any = {};

      if (!aircraftCode || aircraftCode.trim() === "") {
        newErrors.aircraftCode = "Vui lòng nhập mã máy bay.";
      } else if (aircraftCode.length > 10) {
        newErrors.aircraftCode = "Mã máy bay không được dài quá 10 ký tự.";
      }

      if (!model || model.trim() === "") {
        newErrors.model = "Vui lòng nhập model máy bay.";
      } else if (model.length > 100) {
        newErrors.model = "Tên model không được dài quá 100 ký tự.";
      }

      if (!airlineId) {
        newErrors.airlineId = "Vui lòng chọn hãng hàng không.";
      }

      if (economyCapacity === null || economyCapacity < 0) {
        newErrors.economyCapacity = "Vui lòng nhập sức chứa hợp lệ cho hạng Economy.";
      }

      if (businessCapacity === null || businessCapacity < 0) {
        newErrors.businessCapacity = "Vui lòng nhập sức chứa hợp lệ cho hạng Business.";
      }

      if (firstClassCapacity === null || firstClassCapacity < 0) {
        newErrors.firstClassCapacity = "Vui lòng nhập sức chứa hợp lệ cho hạng First Class.";
      }
      
      // if (!lastMaintenance) {
      //   newErrors.lastMaintenance = "Vui lòng chọn ngày bảo trì gần nhất.";
      // }

      // if (!nextMaintenance) {
      //   newErrors.nextMaintenance = "Vui lòng chọn ngày bảo trì tiếp theo.";
      // }
     
      if (lastMaintenance && nextMaintenance) {
        const last = new Date(lastMaintenance);
        const next = new Date(nextMaintenance);
        if (next < last) {
          newErrors.nextMaintenance = "Ngày bảo trì tiếp theo phải sau ngày gần nhất.";
        }
      }

      const { layout } = seatLayoutJSON;
      const validLayout = (value: string) =>
        value === "" || /^[0-9]+(-[0-9]+)*$/.test(value);

      if (layout) {
        if (!validLayout(layout.Economy)) {
          newErrors.layoutEconomy = "Định dạng không hợp lệ (VD: 3-3-3).";
        }
        if (!validLayout(layout.Business)) {
          newErrors.layoutBusiness = "Định dạng không hợp lệ (VD: 2-2-2).";
        }
        if (!validLayout(layout.First)) {
          newErrors.layoutFirst = "Định dạng không hợp lệ (VD: 1-2-1).";
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0; // Trả về true nếu không có lỗi
   };


   const clearForm = ()=>{
            setAircraftCode("");
            setModel("");
            setAirlineId(null);
            setEconomyCapacity(null);
            setBusinessCapacity(null);
            setFirstClassCapacity(null);
            setSeatLayoutJSON({
              layout: { Economy: "", Business: "", First: "" },
              hasWiFi: false,
              hasPremiumEntertainment: false,
            });
            setLastMaintenance("");
            setNextMaintenance("");
            setIsActive(true);
            setShowAddModal(false);
            setErrors({});
            setUpdateErrors({})
   }


    const addAircraft = (): void => {
      const isValid = validateInputs();
      if (!isValid) return; // Dừng nếu có lỗi

      const aircraftData = {
        aircraftCode,
        model,
        airlineId,
        economyCapacity,
        businessCapacity,
        firstClassCapacity,
        seatLayoutJSON,
        lastMaintenance: lastMaintenance ? lastMaintenance : null,
        nextMaintenance: nextMaintenance ? nextMaintenance : null,
        isActive,
      };

      requestApi("aircrafts", "POST", aircraftData)
        .then((res: any) => {
          console.log("paload",res)
          if (res.success) {
            alert("Thêm máy bay thành công");
            loadAircrafts();
            clearForm()
            
          }else if(res.errorCode === 'AIRCRAFT_EXISTS'){
              setErrors((prev:any) => ({
              ...prev,
              aircraftCode: "Mã máy bay đã tồn tại",
            }));
          }
          else {
            alert("Thêm thất bại");
          }
        })
        .catch((error: any) => {
          console.error(error);
        });
    };




     // Khi chọn 1 máy bay → load dữ liệu vào form
  const handleSelectAircraft = (id: string) => {
  const aircraft:any = AircraftsList.find((a:any) => a.aircraftId === Number(id));
  if (aircraft) {
     setSelectedId(aircraft.aircraftId);
     setAircraftUpdateData({
      aircraftCode: aircraft.aircraftCode || "",
      model: aircraft.model || "",
      economyCapacity: aircraft.economyCapacity || 0,
      businessCapacity: aircraft.businessCapacity || 0,
      firstClassCapacity: aircraft.firstClassCapacity || 0,
      seatLayoutJSON: aircraft.seatLayoutJSON || {
        layout: { Economy: "", Business: "", First: "" },
        hasWiFi: false,
        hasPremiumEntertainment: false,
      },
      lastMaintenance: aircraft.lastMaintenance
        ? aircraft.lastMaintenance.slice(0, 10)
        : null,
      nextMaintenance: aircraft.nextMaintenance
        ? aircraft.nextMaintenance.slice(0, 10)
        : null,
      isActive: aircraft.isActive ?? true,
    });
  }
};

    const handleChange = (field: string, value: any) => {
    setAircraftUpdateData((prev) => ({ ...prev, [field]: value }));
    };

  const handleSeatLayoutChange = (cls: string, value: string) => {
    setAircraftUpdateData((prev) => ({
      ...prev,
      seatLayoutJSON: {
        ...prev.seatLayoutJSON,
        layout: { ...prev.seatLayoutJSON.layout, [cls]: value },
      },
    }));
  };


  const validateUpdateInputs = () => {
  const newErrors: any = {};

    // if (!aircraftUpdateData.aircraftCode || aircraftUpdateData.aircraftCode.trim() === "") {
    //   newErrors.aircraftCode = "Vui lòng nhập mã máy bay.";
    // } else if (
    //   aircraftUpdateData.aircraftCode.length < 2 ||
    //   aircraftUpdateData.aircraftCode.length > 10
    // ) {
    //   newErrors.aircraftCode = "Mã máy bay phải từ 2–10 ký tự.";
    // }

    if (!aircraftUpdateData.model || aircraftUpdateData.model.trim() === "") {
      newErrors.model = "Vui lòng nhập model máy bay.";
    } else if (aircraftUpdateData.model.length > 100) {
      newErrors.model = "Tên model không được dài quá 100 ký tự.";
    }

    if (
      aircraftUpdateData.economyCapacity === null ||
      aircraftUpdateData.economyCapacity < 0
    ) {
      newErrors.economyCapacity = "Sức chứa Economy không hợp lệ.";
    }

    if (
      aircraftUpdateData.businessCapacity === null ||
      aircraftUpdateData.businessCapacity < 0
    ) {
      newErrors.businessCapacity = "Sức chứa Business không hợp lệ.";
    }

    if (
      aircraftUpdateData.firstClassCapacity === null ||
      aircraftUpdateData.firstClassCapacity < 0
    ) {
      newErrors.firstClassCapacity = "Sức chứa First Class không hợp lệ.";
    }

    // Kiểm tra bố trí ghế (layout)
    const { layout } = aircraftUpdateData.seatLayoutJSON;
    const validLayout = (value: string) =>
      value === "" || /^[0-9]+(-[0-9]+)*$/.test(value);

    if (layout) {
      if (!validLayout(layout.Economy)) newErrors.layoutEconomy = "Định dạng không hợp lệ (VD: 3-3-3).";
      if (!validLayout(layout.Business)) newErrors.layoutBusiness = "Định dạng không hợp lệ (VD: 2-2-2).";
      if (!validLayout(layout.First)) newErrors.layoutFirst = "Định dạng không hợp lệ (VD: 1-2-1).";
    }

    // Ngày bảo trì
    if (aircraftUpdateData.lastMaintenance && aircraftUpdateData.nextMaintenance) {
      const last = new Date(aircraftUpdateData.lastMaintenance);
      const next = new Date(aircraftUpdateData.nextMaintenance);
      if (next < last) newErrors.nextMaintenance = "Ngày bảo trì tiếp theo phải sau ngày gần nhất.";
    }

    setUpdateErrors(newErrors);
    return Object.keys(newErrors).length === 0;
 };


  const updateAircraft = (): void => {
  const isValid = validateUpdateInputs();
  if (!isValid) return; // nếu có lỗi thì dừng
  // console.log('select',String(selectedId))
  requestApi(`aircrafts/${String(selectedId)}`, "PUT", aircraftUpdateData)
    .then((res: any) => {
      if (res.success) {
        alert("Cập nhật thông tin máy bay thành công!");
        loadAircrafts();
        setShowUpdateModal(false)
      } else {
        alert("Cập nhật thất bại");
      }
    })
    .catch((error: any) => console.log('error aircraft',error));
 };
 const deleteAicraft = (id:string) : void =>{
     requestApi(`aircrafts/${id}`,"DELETE").then((res:any)=>{
        if(res.success){
           alert("Xóa máy bay thành công!");
           loadAircrafts();
        }else{
          alert("Xóa thất bại");
        }
     }).catch((error:any)=> console.log(error))
 }


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
  const [showUpdateModal, setShowUpdateModal] = useState(false);
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

  const generateAircraftCode = (airlineId: number, model: string) => {
      // Tìm hãng hàng không tương ứng
      const selectedAirline: any = airlines.find((a: any) => a.airlineId === Number(airlineId));
      if (!selectedAirline) return "";

      const airlineCode = selectedAirline.airlineCode || "XX";

      // Lấy ký tự đầu tiên trong model (VD: Boeing → B, Airbus → A)
      const typeInitial = model?.trim()?.charAt(0).toUpperCase() || "X";

      // Lọc danh sách aircraft có cùng airlineCode và typeInitial
      const filteredAircrafts = AircraftsList.filter((ac: any) =>
        ac.aircraftCode?.startsWith(`${airlineCode}-${typeInitial}`)
      );

      // Lấy số thứ tự lớn nhất hiện tại
      let maxNumber = 0;
      filteredAircrafts.forEach((ac: any) => {
        const match = ac.aircraftCode?.match(/\d+$/); // lấy phần số ở cuối mã
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxNumber) maxNumber = num;
        }
      });

      //Tạo mã mới
      const nextNumber = (maxNumber + 1).toString().padStart(3, "0");
      const newCode = `${airlineCode}-${typeInitial}${nextNumber}`;

      return newCode;
    };

  
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
                <form
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addAircraft();
                  }}
                >
                  {/* --- MODEL --- */}
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">Model</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => {
                      const value = e.target.value;
                      setModel(value);
                      setErrors((prev: any) => ({ ...prev, model: "" }));
                      if (airlineId) {
                        const code = generateAircraftCode(airlineId, value);
                        setAircraftCode(code);
                      }
                     }}
                      className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${
                        errors.model ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Boeing 787-9 Dreamliner"
                    />
                    {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
                  </div>

                  {/* --- HÃNG HÀNG KHÔNG --- */}
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">Hãng hàng không</label>
                    <select
                      value={airlineId ?? ""}
                      onChange={(e) => {
                      const id = Number(e.target.value);
                      setAirlineId(id);
                      setErrors((prev: any) => ({ ...prev, airlineId: "" }));
                      if (model) {
                        const code = generateAircraftCode(id, model);
                        setAircraftCode(code);
                      }
                    }}
                      className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${
                        errors.airlineId ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Chọn hãng hàng không</option>
                      {airlines.map((airline:any)=>{
                        return(
                           <option key={airline.airlineId} value={airline.airlineId}>{airline.airlineName}</option>
                        )
                      })}
                      {/* <option value="1">Vietnam Airlines</option>
                      <option value="2">VietJet Air</option>
                      <option value="3">Bamboo Airways</option>
                      <option value="4">Pacific Airlines</option>
                      <option value="5">Vietravel Airlines</option> */}
                    </select>
                    {errors.airlineId && (
                      <p className="text-red-500 text-sm mt-1">{errors.airlineId}</p>
                    )}
                  </div>

                  {/* --- ECONOMY --- */}
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">
                      Sức chứa hạng Economy
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={economyCapacity ?? ""}
                      onChange={(e) => {
                        setEconomyCapacity(Number(e.target.value));
                        setErrors((prev: any) => ({ ...prev, economyCapacity: "" }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${
                        errors.economyCapacity ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="260"
                    />
                    {errors.economyCapacity && (
                      <p className="text-red-500 text-sm mt-1">{errors.economyCapacity}</p>
                    )}
                  </div>

                  {/* --- BUSINESS --- */}
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">
                      Sức chứa hạng Business
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={businessCapacity ?? ""}
                      onChange={(e) => {
                        setBusinessCapacity(Number(e.target.value));
                        setErrors((prev: any) => ({ ...prev, businessCapacity: "" }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${
                        errors.businessCapacity ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="24"
                    />
                    {errors.businessCapacity && (
                      <p className="text-red-500 text-sm mt-1">{errors.businessCapacity}</p>
                    )}
                  </div>

                  {/* --- FIRST CLASS --- */}
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">
                      Sức chứa hạng First Class
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={firstClassCapacity ?? ""}
                      onChange={(e) => {
                        setFirstClassCapacity(Number(e.target.value));
                        setErrors((prev: any) => ({ ...prev, firstClassCapacity: "" }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${
                        errors.firstClassCapacity ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="8"
                    />
                    {errors.firstClassCapacity && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstClassCapacity}</p>
                    )}
                  </div>

                  {/* --- BỐ TRÍ GHẾ --- */}
                  <div className="md:col-span-2 border-t pt-4">
                    <h4 className="text-md font-medium text-gray-700 mb-1">Bố trí ghế</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {["Economy", "Business", "First"].map((cls) => {
                        const placeholders: Record<string, string> = {
                          Economy: "Economy (VD: 3-3-3)",
                          Business: "Business (VD: 2-2-2)",
                          First: "First (VD: 1-2-1)",
                        };
                        return(
                        <div key={cls}>
                          <input
                            type="text"
                            placeholder={placeholders[cls]}
                            value={(seatLayoutJSON.layout as any)[cls] || ""}
                            onChange={(e) =>
                              setSeatLayoutJSON((prev) => ({
                                ...prev,
                                layout: { ...prev.layout, [cls]: e.target.value },
                              }))
                            }
                            className={`w-full px-3 py-2 border rounded-lg text-black ${
                              errors[`layout${cls}`] ? "border-red-500" : "border-gray-300"
                            }`}
                          />
                          {errors[`layout${cls}`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`layout${cls}`]}
                            </p>
                          )}
                        </div>
                        );
                        })}
                    </div>
                    
                      <div className="flex items-center space-x-4 mt-3">
                        <label className="flex items-center space-x-2">
                          <input
                            checked={seatLayoutJSON.hasWiFi}
                            type="checkbox"
                            onChange={(e) =>
                              setSeatLayoutJSON((prev) => ({
                                ...prev,
                                hasWiFi: e.target.checked,
                              }))
                            }
                          />
                          <label className='text-md font-medium text-gray-700 '>Có WiFi</label>
                        </label>

                        <label className="flex items-center space-x-2">
                          <input
                            checked={seatLayoutJSON.hasPremiumEntertainment}
                            type="checkbox"
                            onChange={(e) =>
                              setSeatLayoutJSON((prev) => ({
                                ...prev,
                                hasPremiumEntertainment: e.target.checked,
                              }))
                            }
                          />
                          <label className='text-md font-medium text-gray-700'>Giải trí cao cấp</label>
                        </label>
                      </div>
                  </div>

                  {/* --- BẢO TRÌ --- */}
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">
                      Ngày bảo trì gần nhất
                    </label>
                    <input
                      type="date"
                      value={lastMaintenance}
                      onChange={(e) => {
                        setLastMaintenance(e.target.value);
                        setErrors((prev: any) => ({ ...prev,lastMaintenance: "" }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${
                        errors.lastMaintenance ? "border-red-500" : "border-gray-300"
                      }`}
                      />
                      {errors.lastMaintenance && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastMaintenance}</p>
                    )}
                  </div>
                  

                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">
                      Ngày bảo trì tiếp theo
                    </label>
                    <input
                      type="date"
                      value={nextMaintenance}
                      onChange={(e) => {
                        setNextMaintenance(e.target.value);
                        setErrors((prev: any) => ({ ...prev, nextMaintenance: "" }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${
                        errors.nextMaintenance ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.nextMaintenance && (
                      <p className="text-red-500 text-sm mt-1">{errors.nextMaintenance}</p>
                    )}
                  </div>

                  {/* --- TRẠNG THÁI --- */}
                  <div className="md:col-span-2 flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <label className="text-md font-medium text-gray-700">Hoạt động</label>
                  </div>

                  {/* --- BUTTONS --- */}
                  <div className="md:col-span-2 flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => clearForm()}
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
                </form>

              </div>
          </div>
        );

      case 'aircraft-edit':
        return (
                 <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Sửa thông tin máy bay
                      </h3>

                      {/* Chọn máy bay */}
                      <div className="mb-4">
                        <label className="block text-md font-medium text-gray-700 mb-1">
                          Chọn máy bay để chỉnh sửa
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                          onChange={(e) => handleSelectAircraft(e.target.value)}
                          value={selectedId || ""}
                        >
                          <option value="">Chọn máy bay</option>
                          {AircraftsList.map((aircraft:any) => (
                            <option key={aircraft.aircraftId} value={aircraft.aircraftId}>
                              {aircraft.aircraftCode} - {aircraft.model}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Form chỉnh sửa */}
                        <form
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          onSubmit={(e) => {
                            e.preventDefault();
                            updateAircraft();
                          }}
                        >
                          {/* Mã máy bay */}
                          <div>
                            <label className="block text-md font-medium text-gray-700 mb-1">
                              Mã máy bay
                            </label>
                            <input
                              type="text"
                              readOnly
                              value={aircraftUpdateData.aircraftCode}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                            />
                          </div>

                          {/* Model */}
                          <div>
                            <label className="block text-md font-medium text-gray-700 mb-1">Model</label>
                            <input
                              type="text"
                              value={aircraftUpdateData.model}
                              onChange={(e) => {
                                handleChange("model", e.target.value)
                                setUpdateErrors((prev: any) => ({ ...prev, model: "" }))
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                            />
                            {updateErrors.model && (
                              <p className="text-red-500 text-sm mt-1">{updateErrors.model}</p>
                            )}
                          </div>

                          {/* Sức chứa Economy */}
                          <div>
                            <label className="block text-md font-medium text-gray-700 mb-1">
                              Sức chứa Economy
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={aircraftUpdateData.economyCapacity ?? ""}
                              onChange={(e) => {
                                handleChange("economyCapacity", Number(e.target.value))
                                setUpdateErrors((prev: any) => ({ ...prev, economyCapacity: "" }))
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                            />
                            {updateErrors.economyCapacity && (
                              <p className="text-red-500 text-sm mt-1">{updateErrors.economyCapacity}</p>
                            )}
                          </div>

                          {/* Sức chứa Business */}
                          <div>
                            <label className="block text-md font-medium text-gray-700 mb-1">
                              Sức chứa Business
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={aircraftUpdateData.businessCapacity}
                              onChange={(e) =>{
                                handleChange("businessCapacity", Number(e.target.value))
                                setUpdateErrors((prev: any) => ({ ...prev, businessCapacity: "" }))
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                            />
                            {updateErrors.businessCapacity && (
                              <p className="text-red-500 text-sm mt-1">{updateErrors.businessCapacity}</p>
                            )}
                          </div>

                          {/* Sức chứa First Class */}
                          <div>
                            <label className="block text-md font-medium text-gray-700 mb-1">
                              Sức chứa First Class
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={aircraftUpdateData.firstClassCapacity}
                              onChange={(e) =>
                                handleChange("firstClassCapacity", Number(e.target.value))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                            />
                            {updateErrors.firstClassCapacity && (
                              <p className="text-red-500 text-sm mt-1">
                                {updateErrors.firstClassCapacity}
                              </p>
                            )}
                          </div>

                          {/* Bố trí ghế */}
                          <div className="md:col-span-2 border-t pt-4">
                            <h4 className="text-md font-medium text-gray-700 mb-1">Bố trí ghế</h4>
                            <div className="grid grid-cols-3 gap-3">
                              {(["Economy", "Business", "First"] as const).map((cls) => (
                                <div key={cls}>
                                  <input
                                    type="text"
                                    placeholder={`${cls} (VD: ${
                                      cls === "Economy"
                                        ? "3-3-3"
                                        : cls === "Business"
                                        ? "2-2-2"
                                        : "1-2-1"
                                    })`}
                                    value={aircraftUpdateData.seatLayoutJSON.layout[cls] || ""}
                                    onChange={(e) => handleSeatLayoutChange(cls, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                                  />
                                  {updateErrors[`layout${cls}`] && (
                                    <p className="text-red-500 text-sm mt-1">
                                      {updateErrors[`layout${cls}`]}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Tùy chọn tiện ích */}
                            <div className="flex items-center gap-4 mt-3">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={aircraftUpdateData.seatLayoutJSON.hasWiFi}
                                  onChange={(e) =>
                                    setAircraftUpdateData((prev) => ({
                                      ...prev,
                                      seatLayoutJSON: {
                                        ...prev.seatLayoutJSON,
                                        hasWiFi: e.target.checked,
                                      },
                                    }))
                                  }
                                />
                                <span className="text-md font-medium text-gray-700 mb-1">Có WiFi</span>
                              </label>

                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={
                                    aircraftUpdateData.seatLayoutJSON.hasPremiumEntertainment
                                  }
                                  onChange={(e) =>
                                    setAircraftUpdateData((prev) => ({
                                      ...prev,
                                      seatLayoutJSON: {
                                        ...prev.seatLayoutJSON,
                                        hasPremiumEntertainment: e.target.checked,
                                      },
                                    }))
                                  }
                                />
                                <span className="text-md font-medium text-gray-700 mb-1">
                                  Giải trí cao cấp
                                </span>
                              </label>
                            </div>
                          </div>

                          {/* Ngày bảo trì */}
                          <div>
                            <label className="block text-md font-medium text-gray-700 mb-1">
                              Ngày bảo trì gần nhất
                            </label>
                            <input
                              type="date"
                              value={aircraftUpdateData.lastMaintenance}
                              onChange={(e) => handleChange("lastMaintenance", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                            />
                          </div>

                          <div>
                            <label className="block text-md font-medium text-gray-700 mb-1">
                              Ngày bảo trì tiếp theo
                            </label>
                            <input
                              type="date"
                              value={aircraftUpdateData.nextMaintenance}
                              onChange={(e) => handleChange("nextMaintenance", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                            />
                            {errors.nextMaintenance && (
                              <p className="text-red-500 text-sm mt-1">{errors.nextMaintenance}</p>
                            )}
                          </div>

                          {/* Trạng thái */}
                          <div>
                            <label className="block text-md font-medium text-gray-700 mb-1">
                              Trạng thái
                            </label>
                            <select
                              value={aircraftUpdateData.isActive ? "true" : "false"}
                              onChange={(e) => handleChange("isActive", e.target.value === "true")}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                            >
                              <option value="true">Đang hoạt động</option>
                              <option value="false">Ngưng hoạt động</option>
                            </select>
                          </div>

                          {/* Buttons */}
                          <div className="mt-6 flex justify-end space-x-3 md:col-span-2">
                            <button
                              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                              onClick={() => setSelectedId(null)}
                            >
                              Hủy
                            </button>
                            <button
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              type="submit"
                            >
                              Cập nhật thông tin
                            </button>
                          </div>
                        </form>


  
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
                  {AircraftsList.map((aircraft:any) => (
                    <option key={aircraft.aircraftId} value={aircraft.aircraftId}>
                      {aircraft.aircraftCode} - {aircraft.model}
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
                    {AircraftsList.map((aircraft:any) => (
                      <option key={aircraft.aircraftId} value={aircraft.aircraftId}>
                       {aircraft.aircraftCode} - {aircraft.model}
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
                        Mẫu
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
                          {aircraft.model}
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
                            <button className="text-green-600 hover:text-green-900" onClick={()=>{setShowUpdateModal(true),handleSelectAircraft(aircraft.aircraftId)}}>
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-900" onClick={()=> deleteAicraft(aircraft.aircraftId)}>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm máy bay mới</h3>

              <form
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addAircraft();
                  }}
                >
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">Model</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => {
                      const value = e.target.value;
                      setModel(value);
                      setErrors((prev: any) => ({ ...prev, model: "" }));
                      if (airlineId) {
                        const code = generateAircraftCode(airlineId, value);
                        setAircraftCode(code);
                      }
                     }}
                      className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${
                        errors.model ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Boeing 787-9 Dreamliner"
                    />
                    {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
                  </div>

                  {/* --- HÃNG HÀNG KHÔNG --- */}
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">Hãng hàng không</label>
                    <select
                      value={airlineId ?? ""}
                      onChange={(e) => {
                      const id = Number(e.target.value);
                      setAirlineId(id);
                      setErrors((prev: any) => ({ ...prev, airlineId: "" }));
                      if (model) {
                        const code = generateAircraftCode(id, model);
                        setAircraftCode(code);
                      }
                    }}
                      className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${
                        errors.airlineId ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Chọn hãng hàng không</option>
                      {airlines.map((airline:any)=>{
                        return(
                           <option key={airline.airlineId} value={airline.airlineId}>{airline.airlineName}</option>
                        )
                      })}
                    </select>
                    {errors.airlineId && (
                      <p className="text-red-500 text-sm mt-1">{errors.airlineId}</p>
                    )}
                  </div>

                  {/* --- ECONOMY --- */}
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">
                      Sức chứa hạng Economy
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={economyCapacity ?? ""}
                      onChange={(e) => {
                        setEconomyCapacity(Number(e.target.value));
                        setErrors((prev: any) => ({ ...prev, economyCapacity: "" }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${
                        errors.economyCapacity ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="260"
                    />
                    {errors.economyCapacity && (
                      <p className="text-red-500 text-sm mt-1">{errors.economyCapacity}</p>
                    )}
                  </div>

                  {/* --- BUSINESS --- */}
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">
                      Sức chứa hạng Business
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={businessCapacity ?? ""}
                      onChange={(e) => {
                        setBusinessCapacity(Number(e.target.value));
                        setErrors((prev: any) => ({ ...prev, businessCapacity: "" }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${
                        errors.businessCapacity ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="24"
                    />
                    {errors.businessCapacity && (
                      <p className="text-red-500 text-sm mt-1">{errors.businessCapacity}</p>
                    )}
                  </div>

                  {/* --- FIRST CLASS --- */}
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">
                      Sức chứa hạng First Class
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={firstClassCapacity ?? ""}
                      onChange={(e) => {
                        setFirstClassCapacity(Number(e.target.value));
                        setErrors((prev: any) => ({ ...prev, firstClassCapacity: "" }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500 ${
                        errors.firstClassCapacity ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="8"
                    />
                    {errors.firstClassCapacity && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstClassCapacity}</p>
                    )}
                  </div>

                  {/* --- BỐ TRÍ GHẾ --- */}
                  <div className="md:col-span-2 border-t pt-4">
                    <h4 className="text-md font-medium text-gray-700 mb-1">Bố trí ghế</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {["Economy", "Business", "First"].map((cls) => {
                        const placeholders: Record<string, string> = {
                          Economy: "Economy (VD: 3-3-3)",
                          Business: "Business (VD: 2-2-2)",
                          First: "First (VD: 1-2-1)",
                        };
                        return(
                        <div key={cls}>
                          <input
                            type="text"
                            placeholder={placeholders[cls]}
                            value={(seatLayoutJSON.layout as any)[cls] || ""}
                            onChange={(e) =>
                              setSeatLayoutJSON((prev) => ({
                                ...prev,
                                layout: { ...prev.layout, [cls]: e.target.value },
                              }))
                            }
                            className={`w-full px-3 py-2 border rounded-lg text-black ${
                              errors[`layout${cls}`] ? "border-red-500" : "border-gray-300"
                            }`}
                          />
                          {errors[`layout${cls}`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`layout${cls}`]}
                            </p>
                          )}
                        </div>
                        );
                        })}
                    </div>
                    
                      <div className="flex items-center space-x-4 mt-3">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            onChange={(e) =>
                              setSeatLayoutJSON((prev) => ({
                                ...prev,
                                hasWiFi: e.target.checked,
                              }))
                            }
                          />
                          <label className='text-md font-medium text-gray-700 '>Có WiFi</label>
                        </label>

                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            onChange={(e) =>
                              setSeatLayoutJSON((prev) => ({
                                ...prev,
                                hasPremiumEntertainment: e.target.checked,
                              }))
                            }
                          />
                          <label className='text-md font-medium text-gray-700'>Giải trí cao cấp</label>
                        </label>
                      </div>
                  </div>

                  {/* --- BẢO TRÌ --- */}
                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">
                      Ngày bảo trì gần nhất
                    </label>
                    <input
                      type="date"
                      value={lastMaintenance}
                      onChange={(e) => {
                        setLastMaintenance(e.target.value);
                        setErrors((prev: any) => ({ ...prev,lastMaintenance: "" }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${
                        errors.lastMaintenance ? "border-red-500" : "border-gray-300"
                      }`}
                      />
                      {errors.lastMaintenance && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastMaintenance}</p>
                    )}
                  </div>
                  

                  <div>
                    <label className="block text-md font-medium text-gray-700 mb-1">
                      Ngày bảo trì tiếp theo
                    </label>
                    <input
                      type="date"
                      value={nextMaintenance}
                      onChange={(e) => {
                        setNextMaintenance(e.target.value);
                        setErrors((prev: any) => ({ ...prev, nextMaintenance: "" }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black ${
                        errors.nextMaintenance ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.nextMaintenance && (
                      <p className="text-red-500 text-sm mt-1">{errors.nextMaintenance}</p>
                    )}
                  </div>

                  {/* --- TRẠNG THÁI --- */}
                  <div className="md:col-span-2 flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <label className="text-md font-medium text-gray-700">Hoạt động</label>
                  </div>

                  {/* --- BUTTONS --- */}
                  <div className="md:col-span-2 flex justify-end space-x-3 mt-6">
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
                </form>



        </div>
      </div>

      )}
      
      {/* Update Aircraft Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cập nhật thông tin máy bay
            </h3>
            {/* Form update */}
            {selectedId && (
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  updateAircraft();
                }}
              >
                {/* --- Mã máy bay --- */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Mã máy bay
                  </label>
                   <input
                      type="text"
                       readOnly
                      value={aircraftUpdateData.aircraftCode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      />
                </div>

                {/* --- Model --- */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                      type="text"
                      value={aircraftUpdateData.model}
                      onChange={(e) => {
                      handleChange("model", e.target.value),
                      setUpdateErrors((prev: any) => ({ ...prev, model: "" }))
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      />
                    {updateErrors.model&& (
                    <p className="text-red-500 text-sm mt-1">{updateErrors.model}</p>
                    )}
                </div>

                {/* --- Sức chứa --- */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Sức chứa Economy
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={aircraftUpdateData.economyCapacity}
                    onChange={(e) =>
                      handleChange("economyCapacity", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>

                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Sức chứa Business
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={aircraftUpdateData.businessCapacity}
                    onChange={(e) =>
                      handleChange("businessCapacity", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>

                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Sức chứa First Class
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={aircraftUpdateData.firstClassCapacity}
                    onChange={(e) =>
                      handleChange("firstClassCapacity", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>

                {/* --- Bố trí ghế --- */}
                <div className="md:col-span-2 border-t pt-4">
                  <h4 className="text-md font-medium text-gray-700 mb-1">Bố trí ghế</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {(["Economy", "Business", "First"] as const).map((cls) => (
                      <input
                        key={cls}
                        type="text"
                        placeholder={`${cls} (VD: ${
                          cls === "Economy" ? "3-3-3" : cls === "Business" ? "2-2-2" : "1-2-1"
                        })`}
                        value={aircraftUpdateData.seatLayoutJSON.layout[cls] || ""}
                        onChange={(e) => handleSeatLayoutChange(cls, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      />
                    ))}
                  </div>

                  {/* --- Tiện ích --- */}
                  <div className="flex items-center gap-4 mt-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={aircraftUpdateData.seatLayoutJSON.hasWiFi}
                        onChange={(e) =>
                          setAircraftUpdateData((prev) => ({
                            ...prev,
                            seatLayoutJSON: {
                              ...prev.seatLayoutJSON,
                              hasWiFi: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span className="text-md font-medium text-gray-700">Có WiFi</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={aircraftUpdateData.seatLayoutJSON.hasPremiumEntertainment}
                        onChange={(e) =>
                          setAircraftUpdateData((prev) => ({
                            ...prev,
                            seatLayoutJSON: {
                              ...prev.seatLayoutJSON,
                              hasPremiumEntertainment: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span className="text-md font-medium text-gray-700">
                        Giải trí cao cấp
                      </span>
                    </label>
                  </div>
                </div>

                {/* --- Bảo trì --- */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Ngày bảo trì gần nhất
                  </label>
                  <input
                    type="date"
                    value={aircraftUpdateData.lastMaintenance}
                    onChange={(e) => handleChange("lastMaintenance", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>

                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Ngày bảo trì tiếp theo
                  </label>
                  <input
                    type="date"
                    value={aircraftUpdateData.nextMaintenance}
                    onChange={(e) => handleChange("nextMaintenance", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                </div>

                {/* --- Trạng thái --- */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={aircraftUpdateData.isActive ? "true" : "false"}
                    onChange={(e) =>
                      handleChange("isActive", e.target.value === "true")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  >
                    <option value="true">Đang hoạt động</option>
                    <option value="false">Ngưng hoạt động</option>
                  </select>
                </div>

                {/* --- Buttons --- */}
                <div className="md:col-span-2 flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Cập nhật thông tin
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}


    </div>
  );
}