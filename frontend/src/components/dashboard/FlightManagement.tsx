'use client';

import React, { useEffect, useState } from 'react';
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
import { requestApi } from '@/lib/api';

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

  const [flightData, setFlightData] = useState({
    flightNumber: "",
    airlineId: "",
    departureAirportId: "",
    arrivalAirportId: "",
    departureTerminalId: "",
    arrivalTerminalId: "",
    aircraftId: "",
    departureTime: "",
    arrivalTime: "",
    duration: "",
    status: "Scheduled",
    economyPrice: 0.0 || null,
    businessPrice: 0.0 || null,
    firstClassPrice: 0.0 || null,
    availableEconomySeats: 0 || null,
    availableBusinessSeats: 0 || null,
    availableFirstClassSeats: 0 || null,
  });


  const [flightUpdateData, setFlightUpdateData] = useState({
    flightNumber: "",
    departureTime: "",
    arrivalTime: "",
    duration: "",
    status: "Scheduled",
    economyPrice: "",
    businessPrice: "",
    firstClassPrice: "",
    availableEconomySeats: "",
    availableBusinessSeats: "",
    availableFirstClassSeats: "",
  });




  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
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
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24h format
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins.toString().padStart(2, "0")}m`;
  };

  const [flights, setFlights] = useState([]);

  const filteredFlights = flights.filter((flight: any) => {
    const matchesSearch = flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase())
    // ||flight.route.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || flight.status === statusFilter;
    return matchesSearch && matchesStatus;
  });


  const [airlines, setAirlines] = useState([])
  const [airports, setAirports] = useState([])
  const [aircrafts, setAircrafts] = useState([])
  const [errors, setErrors] = useState<any>({});
  const [updateErrors, setUpdateErrors] = useState<any>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // const [loading,setLoading] = useState(true) 

  useEffect(() => {
    loadFlights()
    loadAirlines()
    loadAirports()
    loadAircraftsByAirlineId(Number(flightData.airlineId))
    if (flightData.departureAirportId) {
      loadTerminalByAirportId(Number(flightData.departureAirportId), "departure");
    }
    if (flightData.arrivalAirportId) {
      loadTerminalByAirportId(Number(flightData.arrivalAirportId), "arrival");
    }
    const duration = calculateDuration(flightData.departureTime, flightData.arrivalTime);
    const durationUpdate = calculateDuration(flightUpdateData.departureTime, flightUpdateData.arrivalTime);

    if (duration !== flightData.duration) {
      setFlightData((prev: any) => ({ ...prev, duration }));
    }

    if (durationUpdate !== flightUpdateData.duration) {
      setFlightUpdateData((prev: any) => ({ ...prev, duration: durationUpdate }));
    }


  }, [flightData.departureTime, flightData.arrivalTime, flightData.airlineId, flightData.departureAirportId, flightData.arrivalAirportId,
  flightUpdateData.departureTime, flightUpdateData.arrivalTime
  ])



  //  Hàm tính duration giữa departureTime và arrivalTime
  const calculateDuration = (departureTime: string, arrivalTime: string): number | "" => {
    if (!departureTime || !arrivalTime) return "";

    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);

    // Nếu thời gian đến sớm hơn hoặc bằng thời gian đi → reset
    if (arrival.getTime() <= departure.getTime()) {
      return "";
    }

    const diffMs = arrival.getTime() - departure.getTime();
    const diffMinutes = Math.floor(diffMs / 60000); // ms → phút

    return diffMinutes;
  };

  const loadFlights = async () => {
    await requestApi("flights", "GET").then((res: any) => {
      if (res.success) {
        setFlights(res.data)
      }
    }).catch((error: any) => {
      console.error(error)
    });
  }

  const loadAirlines = async () => {
    await requestApi("airlines", "GET").then((res: any) => {
      if (res.success) {
        setAirlines(res.data)
      }
    }).catch((error: any) => {
      console.error(error)
    });
  }

  const loadAirports = async () => {
    await requestApi("airports", "GET").then((res: any) => {
      if (res.success) {
        setAirports(res.data)
      }
    }).catch((error: any) => {
      console.error(error)
    });
  }

  const loadAircraftsByAirlineId = async (airlineId: number) => {
    await requestApi(`aircrafts/airline/${String(airlineId)}`, "GET").then((res: any) => {
      if (res.success) {
        setAircrafts(res.data)
      } else {
        setAircrafts([])
      }
    }).catch((error: any) => {
      console.error(error)
    });
  }
  const [departureTerminals, setDepartureTerminals] = useState<any[]>([]);
  const [arrivalTerminals, setArrivalTerminals] = useState<any[]>([]);

  const loadTerminalByAirportId = async (airportId: number, type: "departure" | "arrival") => {
    if (!airportId) return;

    try {
      const res: any = await requestApi(`terminals/airport/${String(airportId)}`, "GET");
      if (res.success) {
        if (type === "departure") {
          setDepartureTerminals(res.data);
        } else {
          setArrivalTerminals(res.data);
        }
      } else {
        if (type === "departure") setDepartureTerminals([]);
        else setArrivalTerminals([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const validateInputs = () => {
    const newErrors: any = {};

    // --- Mã chuyến bay ---
    // if (!flightData.flightNumber || flightData.flightNumber.trim() === "") {
    //   newErrors.flightNumber = "Vui lòng nhập mã chuyến bay.";
    // } else if (flightData.flightNumber.length > 10) {
    //   newErrors.flightNumber = "Mã chuyến bay không được dài quá 10 ký tự.";
    // }

    // --- Hãng hàng không ---
    if (!flightData.airlineId) {
      newErrors.airlineId = "Vui lòng chọn hãng hàng không.";
    }

    // --- Máy bay ---
    if (!flightData.aircraftId) {
      newErrors.aircraftId = "Vui lòng chọn máy bay.";
    }

    // --- Sân bay khởi hành / đến ---
    if (!flightData.departureAirportId) {
      newErrors.departureAirportId = "Vui lòng chọn sân bay khởi hành.";
    }

    if (!flightData.arrivalAirportId) {
      newErrors.arrivalAirportId = "Vui lòng chọn sân bay đến.";
    }

    if (
      flightData.departureAirportId &&
      flightData.arrivalAirportId &&
      flightData.departureAirportId === flightData.arrivalAirportId
    ) {
      newErrors.arrivalAirportId = "Sân bay đi và đến không được trùng nhau.";
    }

    // --- Terminal (tùy bạn muốn bắt buộc hay không) ---
    if (!flightData.departureTerminalId) {
      newErrors.departureTerminalId = "Vui lòng chọn terminal khởi hành.";
    }

    if (!flightData.arrivalTerminalId) {
      newErrors.arrivalTerminalId = "Vui lòng chọn terminal đến.";
    }

    if (!flightData.departureTime) {
      newErrors.departureTime = "Vui lòng chọn thời gian khởi hành.";
    }
    if (!flightData.arrivalTime) {
      newErrors.arrivalTime = "Vui lòng chọn thời gian đến.";
    } else if (new Date(flightData.arrivalTime) <= new Date(flightData.departureTime)) {
      newErrors.arrivalTime = "Thời gian đến phải sau thời gian khởi hành.";
    }



    // --- Trạng thái chuyến bay ---
    if (!flightData.status) {
      newErrors.status = "Vui lòng chọn trạng thái chuyến bay.";
    }

    // --- Giá vé ---
    if (!flightData.economyPrice || Number(flightData.economyPrice) <= 0) {
      newErrors.economyPrice = "Vui lòng nhập giá Economy hợp lệ (> 0).";
    }
    if (!flightData.businessPrice || Number(flightData.businessPrice) <= 0) {
      newErrors.businessPrice = "Vui lòng nhập giá Business hợp lệ (> 0).";
    }
    if (!flightData.firstClassPrice || Number(flightData.firstClassPrice) <= 0) {
      newErrors.firstClassPrice = "Vui lòng nhập giá First Class hợp lệ (> 0).";
    }
    if (
      flightData.availableEconomySeats === "" ||
      flightData.availableEconomySeats === null ||
      Number(flightData.availableEconomySeats) < 0
    ) {
      newErrors.availableEconomySeats = "Vui lòng nhập số ghế Economy hợp lệ (≥ 0).";
    }

    if (
      flightData.availableBusinessSeats === "" ||
      flightData.availableBusinessSeats === null ||
      Number(flightData.availableBusinessSeats) < 0
    ) {
      newErrors.availableBusinessSeats = "Vui lòng nhập số ghế Business hợp lệ (≥ 0).";
    }

    if (
      flightData.availableFirstClassSeats === "" ||
      flightData.availableFirstClassSeats === null ||
      Number(flightData.availableFirstClassSeats) < 0
    ) {
      newErrors.availableFirstClassSeats = "Vui lòng nhập số ghế First Class hợp lệ (≥ 0).";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // true nếu không có lỗi
  };

  const validateUpdateInputs = () => {
    const newErrors: any = {};

    if (!flightUpdateData.departureTime) {
      newErrors.departureTime = "Vui lòng chọn thời gian khởi hành.";
    }
    if (!flightUpdateData.arrivalTime) {
      newErrors.arrivalTime = "Vui lòng chọn thời gian đến.";
    } else if (new Date(flightUpdateData.arrivalTime) <= new Date(flightUpdateData.departureTime)) {
      newErrors.arrivalTime = "Thời gian đến phải sau thời gian khởi hành.";
    }

    // --- Giá vé ---
    if (!flightUpdateData.economyPrice.trim()) {
      newErrors.economyPrice = "Vui lòng nhập giá Economy.";
    } else if (Number(flightUpdateData.economyPrice) <= 0) {
      newErrors.economyPrice = "Giá Economy phải > 0.";
    }

    if (!flightUpdateData.businessPrice.trim()) {
      newErrors.businessPrice = "Vui lòng nhập giá Business.";
    } else if (Number(flightUpdateData.businessPrice) <= 0) {
      newErrors.businessPrice = "Giá Business phải > 0.";
    }

    if (!flightUpdateData.firstClassPrice.trim()) {
      newErrors.firstClassPrice = "Vui lòng nhập giá First Class.";
    } else if (Number(flightUpdateData.firstClassPrice) <= 0) {
      newErrors.firstClassPrice = "Giá First Class phải > 0.";
    }

    if (
      flightUpdateData.availableEconomySeats === "" ||
      flightUpdateData.availableEconomySeats === null ||
      Number(flightUpdateData.availableEconomySeats) < 0
    ) {
      newErrors.availableEconomySeats = "Vui lòng nhập số ghế Economy hợp lệ (≥ 0).";
    }

    if (
      flightUpdateData.availableBusinessSeats === "" ||
      flightUpdateData.availableBusinessSeats === null ||
      Number(flightUpdateData.availableBusinessSeats) < 0
    ) {
      newErrors.availableBusinessSeats = "Vui lòng nhập số ghế Business hợp lệ (≥ 0).";
    }

    if (
      flightUpdateData.availableFirstClassSeats === "" ||
      flightUpdateData.availableFirstClassSeats === null ||
      Number(flightUpdateData.availableFirstClassSeats) < 0
    ) {
      newErrors.availableFirstClassSeats = "Vui lòng nhập số ghế First Class hợp lệ (≥ 0).";
    }
    setUpdateErrors(newErrors);
    return Object.keys(newErrors).length === 0; // true nếu không có lỗi
  };

  const clearFlightData = () => {
    setFlightData({
      flightNumber: "",
      airlineId: "",
      departureAirportId: "",
      arrivalAirportId: "",
      departureTerminalId: "",
      arrivalTerminalId: "",
      aircraftId: "",
      departureTime: "",
      arrivalTime: "",
      duration: "",
      status: "Scheduled",
      economyPrice: null,
      businessPrice: null,
      firstClassPrice: null,
      availableEconomySeats: null,
      availableBusinessSeats: null,
      availableFirstClassSeats: null,
    });

    setErrors({}); // đồng thời xóa lỗi (nếu có)

  };
  const clearFlightUpdateData = () => {
    setSelectedId(null)
    setFlightUpdateData({
      flightNumber: "",
      departureTime: "",
      arrivalTime: "",
      duration: "",
      status: "Scheduled",
      economyPrice: "",
      businessPrice: "",
      firstClassPrice: "",
      availableEconomySeats: "",
      availableBusinessSeats: "",
      availableFirstClassSeats: "",
    })
    setUpdateErrors({})

  }







  const handleChange = (field: string, value: any) => {
    setFlightData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Xóa lỗi của field đó khi người dùng nhập lại
    setErrors((prev: any) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };


  const handleUpdateChange = (field: string, value: any) => {
    setFlightUpdateData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Xóa lỗi của field đó khi người dùng nhập lại
    setUpdateErrors((prev: any) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const generateFlightNumberByAirline = async (airlineId: string) => {
    if (!airlineId) return;

    try {
      const res = await requestApi(`flights/generate-flight-number/${airlineId}`, 'GET');
      if (res.success && res.data?.flightNumber) {
        handleChange('flightNumber', res.data.flightNumber);
      }
    } catch (error) {
      console.error('Error generating flight number:', error);
    }
  };

  const handleAddFlight = (): void => {
    const isValid = validateInputs();
    if (!isValid) return; // Dừng nếu có lỗi

    const formattedData = {
      ...flightData,
      airlineId: Number(flightData.airlineId),
      departureAirportId: Number(flightData.departureAirportId),
      arrivalAirportId: Number(flightData.arrivalAirportId),
      departureTerminalId: flightData.departureTerminalId
        ? Number(flightData.departureTerminalId)
        : null,
      arrivalTerminalId: flightData.arrivalTerminalId
        ? Number(flightData.arrivalTerminalId)
        : null,
      aircraftId: Number(flightData.aircraftId),
      duration: Number(flightData.duration),
      economyPrice: Number(flightData.economyPrice),
      businessPrice: Number(flightData.businessPrice),
      firstClassPrice: Number(flightData.firstClassPrice),
      availableEconomySeats: Number(flightData.availableEconomySeats),
      availableBusinessSeats: Number(flightData.availableBusinessSeats),
      availableFirstClassSeats: Number(flightData.availableFirstClassSeats),
    };

    requestApi("flights", "POST", formattedData).then((res: any) => {
      console.log("API response:", res);
      if (res.success) {
        alert("Thêm chuyến bay mới thành công")
        clearFlightData()
        setShowAddModal(false)
      } else if (res.errorCode === 'FLIGHT_EXISTS') {
        // alert("chuyến bay đã tồn tại")
        setErrors((prev: any) => ({
          ...prev,
          flightNumber: "Mã chuyến bay đã tồn tại. Vui lòng nhập mã khác.",
        }));
      } else {
        // alert("Thêm chuyến bay thất bại")
      }
    })

    // onSubmit(formattedData); // Gọi API từ cha (hoặc bạn có thể dùng requestApi ở đây)
  };

  const handleSelectFlightId = (id: string) => {
    requestApi(`flights/${id}`, "GET").then((res: any) => {
      if (res.success)
        setFlightUpdateData(res.data)
      setSelectedId(Number(id))
    }).catch((err: any) => {
      console.error(err)
    })
  }
  const [selectError, setSelectError] = useState("");
  const handleUpdateFlight = () => {
    if (!selectedId) {
      setSelectError("Vui lòng chọn chuyến bay trước khi cập nhật!");
      return;
    }
    setSelectError(""); // xóa lỗi khi hợp lệ
    const isValid = validateUpdateInputs()
    if (!isValid) return; // Dừng nếu có lỗi
    const formattedUpdateData = {
      ...flightUpdateData,
      duration: Number(flightUpdateData.duration),
      economyPrice: Number(flightUpdateData.economyPrice),
      businessPrice: Number(flightUpdateData.businessPrice),
      firstClassPrice: Number(flightUpdateData.firstClassPrice),
      availableEconomySeats: Number(flightUpdateData.availableEconomySeats),
      availableBusinessSeats: Number(flightUpdateData.availableBusinessSeats),
      availableFirstClassSeats: Number(flightUpdateData.availableFirstClassSeats),
    };
    requestApi(`flights/${String(selectedId)}`, "PUT", formattedUpdateData).then((res: any) => {
      if (res.success) {
        alert('Cập nhật chuyến bay thành công')
        clearFlightUpdateData()
        setShowUpdateModal(false)
        loadFlights()
      } else {
        alert('Cập nhật chuyến bay thất bại')
      }
    })
  }

  const deleteFlight = (id: string): void => {
    requestApi(`flights/${id}`, "DELETE").then((res: any) => {
      if (res.success) {
        alert("Xóa máy bay thành công!");
        loadFlights();
      } else {
        alert("Xóa thất bại");
      }
    }).catch((error: any) => console.log(error))
  }






  // Render content based on active sub-tab
  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'flights-create':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo chuyến bay mới</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddFlight();
              }} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Airline */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Hãng hàng không
                  </label>
                  <select
                    value={flightData.airlineId}
                    onChange={(e: any) => {
                      handleChange('airlineId', e.target.value);
                      loadAircraftsByAirlineId(e.target.value);
                      generateFlightNumberByAirline(e.target.value);

                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-black ${errors.airlineId ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Chọn hãng hàng không</option>
                    {airlines.map((a: any) => (
                      <option key={a.airlineId} value={a.airlineId}>
                        {a.airlineName}
                      </option>
                    ))}
                  </select>
                  {errors.airlineId && (
                    <p className="text-red-500 text-sm">{errors.airlineId}</p>
                  )}
                </div>

                {/* Aircraft */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Máy bay
                  </label>
                  <select
                    value={flightData.aircraftId}
                    onChange={(e) => handleChange('aircraftId', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-black ${errors.aircraftId ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Chọn máy bay</option>
                    {aircrafts.map((a: any) => (
                      <option key={a.aircraftId} value={a.aircraftId}>
                        {a.model}
                      </option>
                    ))}
                  </select>
                  {errors.aircraftId && (
                    <p className="text-red-500 text-sm">{errors.aircraftId}</p>
                  )}
                </div>

                {/* Departure Airport */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Sân bay đi
                  </label>
                  <select
                    value={flightData.departureAirportId}
                    onChange={(e: any) => {
                      handleChange('departureAirportId', e.target.value);
                      loadTerminalByAirportId(e.target.value, 'departure');
                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-black ${errors.departureAirportId ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Chọn sân bay</option>
                    {airports.map((a: any) => (
                      <option key={a.airportId} value={a.airportId}>
                        {a.airportName}
                      </option>
                    ))}
                  </select>
                  {errors.departureAirportId && (
                    <p className="text-red-500 text-sm">{errors.departureAirportId}</p>
                  )}
                </div>

                {/* Arrival Airport */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Sân bay đến
                  </label>
                  <select
                    value={flightData.arrivalAirportId}
                    onChange={(e: any) => {
                      handleChange('arrivalAirportId', e.target.value);
                      loadTerminalByAirportId(e.target.value, 'arrival');
                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-black ${errors.arrivalAirportId ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Chọn sân bay</option>
                    {airports.map((a: any) => (
                      <option key={a.airportId} value={a.airportId}>
                        {a.airportName}
                      </option>
                    ))}
                  </select>
                  {errors.arrivalAirportId && (
                    <p className="text-red-500 text-sm">{errors.arrivalAirportId}</p>
                  )}
                </div>

                {/* Departure Terminal */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Nhà ga đi
                  </label>
                  <select
                    value={flightData.departureTerminalId}
                    onChange={(e) => handleChange('departureTerminalId', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-black ${errors.departureTerminalId ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Chọn nhà ga</option>
                    {departureTerminals.map((t) => (
                      <option key={t.terminalId} value={t.terminalId}>
                        {t.terminalName}
                      </option>
                    ))}
                  </select>
                  {errors.departureTerminalId && (
                    <p className="text-red-500 text-sm">{errors.departureTerminalId}</p>
                  )}
                </div>

                {/* Arrival Terminal */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Nhà ga đến
                  </label>
                  <select
                    value={flightData.arrivalTerminalId}
                    onChange={(e) => handleChange('arrivalTerminalId', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-black ${errors.arrivalTerminalId ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Chọn nhà ga</option>
                    {arrivalTerminals.map((t) => (
                      <option key={t.terminalId} value={t.terminalId}>
                        {t.terminalName}
                      </option>
                    ))}
                  </select>
                  {errors.arrivalTerminalId && (
                    <p className="text-red-500 text-sm">{errors.arrivalTerminalId}</p>
                  )}
                </div>



                {/* Departure Time */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Thời gian khởi hành
                  </label>
                  <input
                    type="datetime-local"
                    value={flightData.departureTime}
                    onChange={(e) => handleChange('departureTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-black ${errors.departureTime ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.departureTime && (
                    <p className="text-red-500 text-sm">{errors.departureTime}</p>
                  )}
                </div>

                {/* Arrival Time */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Thời gian đến
                  </label>
                  <input
                    type="datetime-local"
                    value={flightData.arrivalTime}
                    onChange={(e) => handleChange('arrivalTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-black ${errors.arrivalTime ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.arrivalTime && (
                    <p className="text-red-500 text-sm">{errors.arrivalTime}</p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    value={flightData.duration}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-600 bg-gray-100"
                    placeholder="Tự động tính"
                  />
                </div>
                {/* Status */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={flightData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-black ${errors.status ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Boarding">Boarding</option>
                    <option value="Departed">Departed</option>
                    <option value="Arrived">Arrived</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  {errors.status && (
                    <p className="text-red-500 text-sm">{errors.status}</p>
                  )}
                </div>
                {/* Giá Economy */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Giá Economy (₫)</label>
                  <input
                    value={flightData.economyPrice ?? ""}
                    type="number"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${errors.economyPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Nhập giá vé hạng Economy"
                    onChange={(e) => handleChange('economyPrice', e.target.value)}
                  />
                  {errors.economyPrice && (
                    <p className="text-red-500 text-sm mt-1">{errors.economyPrice}</p>
                  )}
                </div>

                {/* Giá Business */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Giá Business (₫)</label>
                  <input
                    value={flightData.businessPrice ?? ""}
                    type="number"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${errors.businessPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Nhập giá vé hạng Business"
                    onChange={(e) => handleChange('businessPrice', e.target.value)}
                  />
                  {errors.businessPrice && (
                    <p className="text-red-500 text-sm mt-1">{errors.businessPrice}</p>
                  )}
                </div>

                {/* Giá First Class */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Giá First Class (₫)</label>
                  <input
                    value={flightData.firstClassPrice ?? ""}
                    type="number"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${errors.firstClassPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Nhập giá vé hạng First Class"
                    onChange={(e) => handleChange('firstClassPrice', e.target.value)}
                  />
                  {errors.firstClassPrice && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstClassPrice}</p>
                  )}
                </div>

                {/* Ghế Economy */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số ghế trống Economy</label>
                  <input
                    value={flightData.availableEconomySeats ?? ""}
                    type="number"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${errors.availableEconomySeats ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Nhập số ghế trống Economy"
                    onChange={(e) => handleChange('availableEconomySeats', e.target.value)}
                  />
                  {errors.availableEconomySeats && (
                    <p className="text-red-500 text-sm mt-1">{errors.availableEconomySeats}</p>
                  )}
                </div>

                {/* Ghế Business */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số ghế trống Business</label>
                  <input
                    value={flightData.availableBusinessSeats ?? ""}
                    type="number"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${errors.availableBusinessSeats ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Nhập số ghế trống Business"
                    onChange={(e) => handleChange('availableBusinessSeats', e.target.value)}
                  />
                  {errors.availableBusinessSeats && (
                    <p className="text-red-500 text-sm mt-1">{errors.availableBusinessSeats}</p>
                  )}
                </div>

                {/* Ghế First Class */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số ghế trống First Class</label>
                  <input
                    value={flightData.availableFirstClassSeats ?? ""}
                    type="number"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${errors.availableFirstClassSeats ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Nhập số ghế trống First Class"
                    onChange={(e) => handleChange('availableFirstClassSeats', e.target.value)}
                  />
                  {errors.availableFirstClassSeats && (
                    <p className="text-red-500 text-sm mt-1">{errors.availableFirstClassSeats}</p>
                  )}
                </div>
                {/* Submit */}
                <div className="md:col-span-2 mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => clearFlightData()}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Tạo chuyến bay
                  </button>
                </div>

              </form>
              {/* Buttons */}

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
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  onChange={(e) => {
                    handleSelectFlightId(e.target.value)
                    // setSelectedId(Number(e.target.value))
                    setSelectError(""); // clear lỗi khi user chọn
                  }}
                  value={selectedId || ""}

                >
                  <option value="">Chọn chuyến bay</option>
                  {flights.map((flight: any) => (
                    <option key={flight.flightId} value={flight.flightId}>
                      {flight.flightNumber} - {flight.departureAirport.airportCode} → {flight.arrivalAirport.airportCode}
                    </option>
                  ))}
                </select>
                {selectError && <p className="text-red-500 text-sm mt-1">{selectError}</p>}
              </div>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateFlight();
                }}
              >
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số chuyến bay</label>
                  <input
                    readOnly
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="VN001"
                    value={flightUpdateData.flightNumber}
                  />
                </div>
                {/* Departure Time */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Thời gian khởi hành
                  </label>
                  <input
                    type="datetime-local"
                    value={flightUpdateData.departureTime
                      ? new Date(flightUpdateData.departureTime).toLocaleString('sv-SE', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                        hour12: false,
                      }).replace(' ', 'T')
                      : ''}
                    onChange={(e) => handleUpdateChange('departureTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-black ${updateErrors.departureTime ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {updateErrors.departureTime && (
                    <p className="text-red-500 text-sm">{updateErrors.departureTime}</p>
                  )}
                </div>

                {/* Arrival Time */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Thời gian đến
                  </label>
                  <input
                    type="datetime-local"
                    value={flightUpdateData.arrivalTime
                      ? new Date(flightUpdateData.arrivalTime).toLocaleString('sv-SE', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                        hour12: false,
                      }).replace(' ', 'T')
                      : ''}
                    onChange={(e) => handleUpdateChange('arrivalTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-black ${updateErrors.arrivalTime ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {updateErrors.arrivalTime && (
                    <p className="text-red-500 text-sm">{updateErrors.arrivalTime}</p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    value={flightUpdateData.duration}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-600 bg-gray-100"
                    placeholder="Tự động tính"
                  />
                </div>
                {/* Status */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={flightUpdateData.status}
                    onChange={(e) => handleUpdateChange('status', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-black ${updateErrors.status ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Boarding">Boarding</option>
                    <option value="Departed">Departed</option>
                    <option value="Arrived">Arrived</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  {updateErrors.status && (
                    <p className="text-red-500 text-sm">{updateErrors.status}</p>
                  )}
                </div>
                {/* Giá Economy */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Giá Economy (₫)</label>
                  <input
                    value={flightUpdateData.economyPrice ?? ""}
                    type="number"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${updateErrors.economyPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Nhập giá vé hạng Economy"
                    onChange={(e) => handleUpdateChange('economyPrice', e.target.value)}
                  />
                  {updateErrors.economyPrice && (
                    <p className="text-red-500 text-sm mt-1">{updateErrors.economyPrice}</p>
                  )}
                </div>

                {/* Giá Business */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Giá Business (₫)</label>
                  <input
                    value={flightUpdateData.businessPrice ?? ""}
                    type="number"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${updateErrors.businessPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Nhập giá vé hạng Business"
                    onChange={(e) => handleUpdateChange('businessPrice', e.target.value)}
                  />
                  {updateErrors.businessPrice && (
                    <p className="text-red-500 text-sm mt-1">{updateErrors.businessPrice}</p>
                  )}
                </div>

                {/* Giá First Class */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Giá First Class (₫)</label>
                  <input
                    value={flightUpdateData.firstClassPrice ?? ""}
                    type="number"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${updateErrors.firstClassPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Nhập giá vé hạng First Class"
                    onChange={(e) => handleUpdateChange('firstClassPrice', e.target.value)}
                  />
                  {updateErrors.firstClassPrice && (
                    <p className="text-red-500 text-sm mt-1">{updateErrors.firstClassPrice}</p>
                  )}
                </div>

                {/* Ghế Economy */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số ghế trống Economy</label>
                  <input
                    value={flightUpdateData.availableEconomySeats ?? ""}
                    type="number"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${updateErrors.availableEconomySeats ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Nhập số ghế trống Economy"
                    onChange={(e) => handleUpdateChange('availableEconomySeats', e.target.value)}
                  />
                  {updateErrors.availableEconomySeats && (
                    <p className="text-red-500 text-sm mt-1">{updateErrors.availableEconomySeats}</p>
                  )}
                </div>

                {/* Ghế Business */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số ghế trống Business</label>
                  <input
                    value={flightUpdateData.availableBusinessSeats ?? ""}
                    type="number"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${updateErrors.availableBusinessSeats ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Nhập số ghế trống Business"
                    onChange={(e) => handleUpdateChange('availableBusinessSeats', e.target.value)}
                  />
                  {updateErrors.availableBusinessSeats && (
                    <p className="text-red-500 text-sm mt-1">{updateErrors.availableBusinessSeats}</p>
                  )}
                </div>

                {/* Ghế First Class */}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Số ghế trống First Class</label>
                  <input
                    value={flightUpdateData.availableFirstClassSeats ?? ""}
                    type="number"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${updateErrors.availableFirstClassSeats ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Nhập số ghế trống First Class"
                    onChange={(e) => handleUpdateChange('availableFirstClassSeats', e.target.value)}
                  />
                  {updateErrors.availableFirstClassSeats && (
                    <p className="text-red-500 text-sm mt-1">{updateErrors.availableFirstClassSeats}</p>
                  )}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button onClick={() => clearFlightUpdateData()} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    Hủy
                  </button>
                  <button type='submit' className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Cập nhật chuyến bay
                  </button>
                </div>
              </form>

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
                    {flights.map((flight: any) => (
                      <tr key={flight.flightId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {flight.flightNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {flight.departureAirport.airportCode} → {flight.arrivalAirport.airportCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(flight.departureTime).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(flight.arrivalTime).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {flight.aircraft.aircraftCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFlightStatusColor(flight.status)}`}>
                            {flight.status}
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
                    {flights.map((flight: any) => (
                      <option key={flight.flightId} value={flight.flightId}>
                        {flight.departureAirport.airportCode} → {flight.arrivalAirport.airportCode}
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
                    {filteredFlights.map((flight: any) => (
                      <tr key={flight.flightId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <RocketLaunchIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{flight.flightNumber}</div>
                              <div className="text-sm text-gray-500">#{flight.flightId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {flight.departureAirport.airportCode} → {flight.arrivalAirport.airportCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{formatTime(flight.departureTime)}</div>
                            <div className="text-gray-500">{formatTime(flight.arrivalTime)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDuration(flight.duration)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFlightStatusColor(flight.status)}`}>
                            {flight.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button className="text-green-600 hover:text-green-900" onClick={() => { setShowUpdateModal(true), handleSelectFlightId(flight.flightId) }}>
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-900" onClick={() => deleteFlight(flight.flightId)}>
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
          <div className=" bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm chuyến bay mới</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddFlight();
            }} className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Airline */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Hãng hàng không
                </label>
                <select
                  value={flightData.airlineId}
                  onChange={(e: any) => {
                    handleChange('airlineId', e.target.value);
                    loadAircraftsByAirlineId(e.target.value);
                    generateFlightNumberByAirline(e.target.value);

                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-black ${errors.airlineId ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Chọn hãng hàng không</option>
                  {airlines.map((a: any) => (
                    <option key={a.airlineId} value={a.airlineId}>
                      {a.airlineName}
                    </option>
                  ))}
                </select>
                {errors.airlineId && (
                  <p className="text-red-500 text-sm">{errors.airlineId}</p>
                )}
              </div>

              {/* Aircraft */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Máy bay
                </label>
                <select
                  value={flightData.aircraftId}
                  onChange={(e) => handleChange('aircraftId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-black ${errors.aircraftId ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Chọn máy bay</option>
                  {aircrafts.map((a: any) => (
                    <option key={a.aircraftId} value={a.aircraftId}>
                      {a.model}
                    </option>
                  ))}
                </select>
                {errors.aircraftId && (
                  <p className="text-red-500 text-sm">{errors.aircraftId}</p>
                )}
              </div>

              {/* Departure Airport */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Sân bay đi
                </label>
                <select
                  value={flightData.departureAirportId}
                  onChange={(e: any) => {
                    handleChange('departureAirportId', e.target.value);
                    loadTerminalByAirportId(e.target.value, 'departure');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-black ${errors.departureAirportId ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Chọn sân bay</option>
                  {airports.map((a: any) => (
                    <option key={a.airportId} value={a.airportId}>
                      {a.airportName}
                    </option>
                  ))}
                </select>
                {errors.departureAirportId && (
                  <p className="text-red-500 text-sm">{errors.departureAirportId}</p>
                )}
              </div>

              {/* Arrival Airport */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Sân bay đến
                </label>
                <select
                  value={flightData.arrivalAirportId}
                  onChange={(e: any) => {
                    handleChange('arrivalAirportId', e.target.value);
                    loadTerminalByAirportId(e.target.value, 'arrival');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-black ${errors.arrivalAirportId ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Chọn sân bay</option>
                  {airports.map((a: any) => (
                    <option key={a.airportId} value={a.airportId}>
                      {a.airportName}
                    </option>
                  ))}
                </select>
                {errors.arrivalAirportId && (
                  <p className="text-red-500 text-sm">{errors.arrivalAirportId}</p>
                )}
              </div>

              {/* Departure Terminal */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Nhà ga đi
                </label>
                <select
                  value={flightData.departureTerminalId}
                  onChange={(e) => handleChange('departureTerminalId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-black ${errors.departureTerminalId ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Chọn nhà ga</option>
                  {departureTerminals.map((t) => (
                    <option key={t.terminalId} value={t.terminalId}>
                      {t.terminalName}
                    </option>
                  ))}
                </select>
                {errors.departureTerminalId && (
                  <p className="text-red-500 text-sm">{errors.departureTerminalId}</p>
                )}
              </div>

              {/* Arrival Terminal */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Nhà ga đến
                </label>
                <select
                  value={flightData.arrivalTerminalId}
                  onChange={(e) => handleChange('arrivalTerminalId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-black ${errors.arrivalTerminalId ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Chọn nhà ga</option>
                  {arrivalTerminals.map((t) => (
                    <option key={t.terminalId} value={t.terminalId}>
                      {t.terminalName}
                    </option>
                  ))}
                </select>
                {errors.arrivalTerminalId && (
                  <p className="text-red-500 text-sm">{errors.arrivalTerminalId}</p>
                )}
              </div>



              {/* Departure Time */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Thời gian khởi hành
                </label>
                <input
                  type="datetime-local"
                  value={flightData.departureTime}
                  onChange={(e) => handleChange('departureTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-black ${errors.departureTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.departureTime && (
                  <p className="text-red-500 text-sm">{errors.departureTime}</p>
                )}
              </div>

              {/* Arrival Time */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Thời gian đến
                </label>
                <input
                  type="datetime-local"
                  value={flightData.arrivalTime}
                  onChange={(e) => handleChange('arrivalTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-black ${errors.arrivalTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.arrivalTime && (
                  <p className="text-red-500 text-sm">{errors.arrivalTime}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Thời lượng (phút)
                </label>
                <input
                  type="number"
                  value={flightData.duration}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-600 bg-gray-100"
                  placeholder="Tự động tính"
                />
              </div>
              {/* Status */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={flightData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-black ${errors.status ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Boarding">Boarding</option>
                  <option value="Departed">Departed</option>
                  <option value="Arrived">Arrived</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm">{errors.status}</p>
                )}
              </div>
              {/* Giá Economy */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Giá Economy (₫)</label>
                <input
                  value={flightData.economyPrice ?? ""}
                  type="number"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${errors.economyPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Nhập giá vé hạng Economy"
                  onChange={(e) => handleChange('economyPrice', e.target.value)}
                />
                {errors.economyPrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.economyPrice}</p>
                )}
              </div>

              {/* Giá Business */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Giá Business (₫)</label>
                <input
                  value={flightData.businessPrice ?? ""}
                  type="number"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${errors.businessPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Nhập giá vé hạng Business"
                  onChange={(e) => handleChange('businessPrice', e.target.value)}
                />
                {errors.businessPrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.businessPrice}</p>
                )}
              </div>

              {/* Giá First Class */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Giá First Class (₫)</label>
                <input
                  value={flightData.firstClassPrice ?? ""}
                  type="number"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${errors.firstClassPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Nhập giá vé hạng First Class"
                  onChange={(e) => handleChange('firstClassPrice', e.target.value)}
                />
                {errors.firstClassPrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstClassPrice}</p>
                )}
              </div>

              {/* Ghế Economy */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Số ghế trống Economy</label>
                <input
                  value={flightData.availableEconomySeats ?? ""}
                  type="number"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${errors.availableEconomySeats ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Nhập số ghế trống Economy"
                  onChange={(e) => handleChange('availableEconomySeats', e.target.value)}
                />
                {errors.availableEconomySeats && (
                  <p className="text-red-500 text-sm mt-1">{errors.availableEconomySeats}</p>
                )}
              </div>

              {/* Ghế Business */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Số ghế trống Business</label>
                <input
                  value={flightData.availableBusinessSeats ?? ""}
                  type="number"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${errors.availableBusinessSeats ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Nhập số ghế trống Business"
                  onChange={(e) => handleChange('availableBusinessSeats', e.target.value)}
                />
                {errors.availableBusinessSeats && (
                  <p className="text-red-500 text-sm mt-1">{errors.availableBusinessSeats}</p>
                )}
              </div>

              {/* Ghế First Class */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Số ghế trống First Class</label>
                <input
                  value={flightData.availableFirstClassSeats ?? ""}
                  type="number"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${errors.availableFirstClassSeats ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Nhập số ghế trống First Class"
                  onChange={(e) => handleChange('availableFirstClassSeats', e.target.value)}
                />
                {errors.availableFirstClassSeats && (
                  <p className="text-red-500 text-sm mt-1">{errors.availableFirstClassSeats}</p>
                )}
              </div>
              {/* Submit */}
              <div className="md:col-span-2 mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tạo chuyến bay
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className=" bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cập nhật chuyến bay</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateFlight();
              }}
            >
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Số chuyến bay</label>
                <input
                  readOnly
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="VN001"
                  value={flightUpdateData.flightNumber}
                />
              </div>
              {/* Departure Time */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Thời gian khởi hành
                </label>
                <input
                  type="datetime-local"
                  value={flightUpdateData.departureTime
                    ? new Date(flightUpdateData.departureTime).toLocaleString('sv-SE', {
                      timeZone: 'Asia/Ho_Chi_Minh',
                      hour12: false,
                    }).replace(' ', 'T')
                    : ''}
                  onChange={(e) => handleUpdateChange('departureTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-black ${updateErrors.departureTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {updateErrors.departureTime && (
                  <p className="text-red-500 text-sm">{updateErrors.departureTime}</p>
                )}
              </div>

              {/* Arrival Time */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Thời gian đến
                </label>
                <input
                  type="datetime-local"
                  value={flightUpdateData.arrivalTime
                    ? new Date(flightUpdateData.arrivalTime).toLocaleString('sv-SE', {
                      timeZone: 'Asia/Ho_Chi_Minh',
                      hour12: false,
                    }).replace(' ', 'T')
                    : ''}
                  onChange={(e) => handleUpdateChange('arrivalTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-black ${updateErrors.arrivalTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {updateErrors.arrivalTime && (
                  <p className="text-red-500 text-sm">{updateErrors.arrivalTime}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Thời lượng (phút)
                </label>
                <input
                  type="number"
                  value={flightUpdateData.duration}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-600 bg-gray-100"
                  placeholder="Tự động tính"
                />
              </div>
              {/* Status */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={flightUpdateData.status}
                  onChange={(e) => handleUpdateChange('status', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-black ${updateErrors.status ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Boarding">Boarding</option>
                  <option value="Departed">Departed</option>
                  <option value="Arrived">Arrived</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                {updateErrors.status && (
                  <p className="text-red-500 text-sm">{updateErrors.status}</p>
                )}
              </div>
              {/* Giá Economy */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Giá Economy (₫)</label>
                <input
                  value={flightUpdateData.economyPrice ?? ""}
                  type="number"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${updateErrors.economyPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Nhập giá vé hạng Economy"
                  onChange={(e) => handleUpdateChange('economyPrice', e.target.value)}
                />
                {updateErrors.economyPrice && (
                  <p className="text-red-500 text-sm mt-1">{updateErrors.economyPrice}</p>
                )}
              </div>

              {/* Giá Business */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Giá Business (₫)</label>
                <input
                  value={flightUpdateData.businessPrice ?? ""}
                  type="number"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${updateErrors.businessPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Nhập giá vé hạng Business"
                  onChange={(e) => handleUpdateChange('businessPrice', e.target.value)}
                />
                {updateErrors.businessPrice && (
                  <p className="text-red-500 text-sm mt-1">{updateErrors.businessPrice}</p>
                )}
              </div>

              {/* Giá First Class */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Giá First Class (₫)</label>
                <input
                  value={flightUpdateData.firstClassPrice ?? ""}
                  type="number"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${updateErrors.firstClassPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Nhập giá vé hạng First Class"
                  onChange={(e) => handleUpdateChange('firstClassPrice', e.target.value)}
                />
                {updateErrors.firstClassPrice && (
                  <p className="text-red-500 text-sm mt-1">{updateErrors.firstClassPrice}</p>
                )}
              </div>

              {/* Ghế Economy */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Số ghế trống Economy</label>
                <input
                  value={flightUpdateData.availableEconomySeats ?? ""}
                  type="number"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${updateErrors.availableEconomySeats ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Nhập số ghế trống Economy"
                  onChange={(e) => handleUpdateChange('availableEconomySeats', e.target.value)}
                />
                {updateErrors.availableEconomySeats && (
                  <p className="text-red-500 text-sm mt-1">{updateErrors.availableEconomySeats}</p>
                )}
              </div>

              {/* Ghế Business */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Số ghế trống Business</label>
                <input
                  value={flightUpdateData.availableBusinessSeats ?? ""}
                  type="number"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${updateErrors.availableBusinessSeats ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Nhập số ghế trống Business"
                  onChange={(e) => handleUpdateChange('availableBusinessSeats', e.target.value)}
                />
                {updateErrors.availableBusinessSeats && (
                  <p className="text-red-500 text-sm mt-1">{updateErrors.availableBusinessSeats}</p>
                )}
              </div>

              {/* Ghế First Class */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Số ghế trống First Class</label>
                <input
                  value={flightUpdateData.availableFirstClassSeats ?? ""}
                  type="number"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${updateErrors.availableFirstClassSeats ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Nhập số ghế trống First Class"
                  onChange={(e) => handleUpdateChange('availableFirstClassSeats', e.target.value)}
                />
                {updateErrors.availableFirstClassSeats && (
                  <p className="text-red-500 text-sm mt-1">{updateErrors.availableFirstClassSeats}</p>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setShowUpdateModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button type='submit' className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Cập nhật chuyến bay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}