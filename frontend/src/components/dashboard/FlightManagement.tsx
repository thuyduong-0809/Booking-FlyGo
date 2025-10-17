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
import { requestApi } from 'lib/api';

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
        economyPrice: "",
        businessPrice: "",
        firstClassPrice: "",
        availableEconomySeats: "",
        availableBusinessSeats: "",
        availableFirstClassSeats: "",
      });



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

  const filteredFlights = flights.filter((flight:any) => {
    const matchesSearch = flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) 
    // ||flight.route.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || flight.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  

  const [airlines,setAirlines] = useState([])
  const [airports,setAirports] = useState([])
  const [aircrafts,setAircrafts] = useState([])
  const [terminals,setTerminals] = useState([])
  // const [loading,setLoading] = useState(true)

  useEffect(()=>{
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
    setFlightData((prev: any) => ({ ...prev, duration }));
  },[flightData.departureTime, flightData.arrivalTime,flightData.airlineId,flightData.departureAirportId,flightData.arrivalAirportId])



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

  const loadFlights = async () =>{
       await requestApi("flights", "GET").then((res:any)=>{
        if(res.success){
          setFlights(res.data)
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

  const loadAirports = async () =>{
       await requestApi("airports", "GET").then((res:any)=>{
        if(res.success){
          setAirports(res.data)
        }
       }).catch((error:any)=>{
        console.error(error)
       });
  }

  const loadAircraftsByAirlineId = async (airlineId:number)=>{
       await requestApi(`aircrafts/airline/${String(airlineId)}`, "GET").then((res:any)=>{
          if(res.success){
              setAircrafts(res.data)
          }else{
            setAircrafts([])
          }
       }).catch((error:any)=>{
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



  
  const handleChange = (field: string, value: any) => {
    setFlightData((prev) => ({
      ...prev,
      [field]: value,
    }));
   };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    requestApi("flights","POST",formattedData).then((res:any)=>{
       if(res.success){
         alert("Thêm chuyến bay mới thành công")
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
          economyPrice: "",
          businessPrice: "",
          firstClassPrice: "",
          availableEconomySeats: "",
          availableBusinessSeats: "",
          availableFirstClassSeats: "",
      });
       }else if(res.errorCode==="'FLIGHT_EXISTS"){
          alert("chuyến bay đã tồn tại")
       }else{
          alert("Thêm chuyến bay thất bại")
       }
    })

    // onSubmit(formattedData); // Gọi API từ cha (hoặc bạn có thể dùng requestApi ở đây)
  };

  // Render content based on active sub-tab
  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'flights-create':
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo chuyến bay mới</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Flight Number */}
                      <div>
                        <label className="block text-md font-medium text-gray-700 mb-1">
                          Số chuyến bay
                        </label>
                        <input
                          type="text"
                          value={flightData.flightNumber}
                          onChange={(e) => handleChange("flightNumber", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                          placeholder="VN001"
                        />
                      </div>

                      {/* Airline */}
                      <div>
                        <label className="block text-md font-medium text-gray-700 mb-1">
                          Hãng hàng không
                        </label>
                        <select
                          value={flightData.airlineId}
                          onChange={(e:any) => {handleChange("airlineId", e.target.value),loadAircraftsByAirlineId(e.target.value)}}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                        >
                          <option value="">Chọn hãng hàng không</option>
                          {airlines.map((a: any) => (
                            <option key={a.airlineId} value={a.airlineId}>
                              {a.airlineName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Departure Airport */}
                      <div>
                        <label className="block text-md font-medium text-gray-700 mb-1">
                          Sân bay đi
                        </label>
                        <select
                          value={flightData.departureAirportId}
                          onChange={(e:any) => {
                            handleChange("departureAirportId", e.target.value);
                            loadTerminalByAirportId(e.target.value, "departure"); 
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                        >
                          <option value="">Chọn sân bay đi</option>
                          {airports.map((a: any) => (
                            <option key={a.airportId} value={a.airportId}>
                              {a.airportCode} - {a.airportName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Arrival Airport */}
                      <div>
                        <label className="block text-md font-medium text-gray-700 mb-1">
                          Sân bay đến
                        </label>
                        <select
                            value={flightData.arrivalAirportId}
                            onChange={(e:any) => {
                            handleChange("arrivalAirportId", e.target.value);
                            loadTerminalByAirportId(e.target.value, "arrival"); 
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                        >
                          <option value="">Chọn sân bay đến</option>
                          {airports.map((a: any) => (
                            <option key={a.airportId} value={a.airportId}>
                              {a.airportCode} - {a.airportName}
                            </option>
                          ))}
                        </select>
                      </div>

                 {/* Departure Terminal*/}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Nhà ga đi</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn nhà ga</option>
                    {departureTerminals.map((terminal:any) => (
                      <option key={terminal.terminalId} value={terminal.terminalId}>
                       {terminal.terminalName}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Arrival Terminal*/}
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Nhà ga đến</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn nhà ga</option>
                    {arrivalTerminals.map((terminal:any) => (
                      <option key={terminal.terminalId} value={terminal.terminalId}>
                        {terminal.terminalName}
                      </option>
                    ))}
                  </select>
                </div>

                      {/* Departure Time */}
                      <div>
                        <label className="block text-md font-medium text-gray-700 mb-1">
                          Thời gian khởi hành
                        </label>
                        <input
                          type="datetime-local"
                          value={flightData.departureTime}
                          onChange={(e) => handleChange("departureTime", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                        />
                      </div>

                      {/* Arrival Time */}
                      <div>
                        <label className="block text-md font-medium text-gray-700 mb-1">
                          Thời gian đến
                        </label>
                        <input
                          type="datetime-local"
                          value={flightData.arrivalTime}
                          onChange={(e) => handleChange("arrivalTime", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                        />
                      </div>
                      {/* Duration (auto) */}
                      <div>
                        <label className="block text-md font-medium text-gray-700 mb-1">
                          Thời lượng (phút)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={flightData.duration}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-600 bg-gray-100"
                          placeholder="Tự động tính"
                        />
                      </div>

                      {/* Aircraft */}
                      <div>
                        <label className="block text-md font-medium text-gray-700 mb-1">
                          Máy bay
                        </label>
                        <select
                          value={flightData.aircraftId}
                          onChange={(e) => handleChange("aircraftId", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                        >
                          <option value="">Chọn máy bay</option>
                          {aircrafts.map((ac: any) => (
                            <option key={ac.aircraftId} value={ac.aircraftId}>
                              {ac.aircraftCode} - {ac.model}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-md font-medium text-gray-700 mb-1">
                          Trạng thái
                        </label>
                        <select
                          value={flightData.status}
                          onChange={(e) => handleChange("status", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Boarding">Boarding</option>
                          <option value="Departed">Departed</option>
                          <option value="Arrived">Arrived</option>
                          <option value="Delayed">Delayed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      {/* Prices */}
                      {[
                        { label: "Giá Economy (₫)", field: "economyPrice" },
                        { label: "Giá Business (₫)", field: "businessPrice" },
                        { label: "Giá First Class (₫)", field: "firstClassPrice" },
                      ].map(({ label, field }) => (
                        <div key={field}>
                          <label className="block text-md font-medium text-gray-700 mb-1">
                            {label}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={flightData[field as keyof typeof flightData] as string}
                            onChange={(e) => handleChange(field, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                          />
                        </div>
                      ))}

                      {/* Available Seats */}
                      {[
                        { label: "Ghế Economy", field: "availableEconomySeats" },
                        { label: "Ghế Business", field: "availableBusinessSeats" },
                        { label: "Ghế First Class", field: "availableFirstClassSeats" },
                      ].map(({ label, field }) => (
                        <div key={field}>
                          <label className="block text-md font-medium text-gray-700 mb-1">
                            {label}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={flightData[field as keyof typeof flightData] as string}
                            onChange={(e) => handleChange(field, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                          />
                        </div>
                      ))}
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Chọn chuyến bay</option>
                  {flights.map((flight:any) => (
                    <option key={flight.flightId} value={flight.flightId}>
                      {flight.flightNumber} - {flight.route}
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
                    {airlines.map((airline:any) => (
                      <option key={airline.airlineId} value={airline.airlineId}>
                        {airline.airlineName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Sân bay đi</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn sân bay đi</option>
                    {airports.map((airport:any) => (
                      <option key={airport.airportId} value={airport.airportId}>
                        {airport.airportCode} - {airport.airportName}
                      </option>
                    ))}
                  </select>
                </div>
               //select terminals
               <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Nhà ga</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn nhà ga</option>
                    {terminals.map((terminal:any) => (
                      <option key={terminal.terminalId} value={terminal.terminalId}>
                        {terminal.terminaCode} - {terminal.terminalName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Sân bay đi</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn nhà ga</option>
                    {terminals.map((terminal:any) => (
                      <option key={terminal.terminalId} value={terminal.terminalId}>
                        {terminal.terminaCode} - {terminal.terminalName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">Sân bay đến</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Chọn sân bay đến</option>
                    {airports.map((airport:any) => (
                      <option key={airport.airportId} value={airport.airportId}>
                        {airport.airportCode} - {airport.airportName}
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
                    {aircrafts.map((aircraft:any) => (
                      <option key={aircraft.aircraftId} value={aircraft.aircraftId}>
                        {aircraft.aircraftCode} - {aircraft.model}
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
                    {flights.map((flight:any) => (
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
                    {flights.map((flight:any) => (
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
                    {filteredFlights.map((flight:any) => (
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
                  {airlines.map((airline:any) => (
                    <option key={airline.airlineId} value={airline.airlineId}>
                      {airline.airlineName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Sân bay đi</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Chọn sân bay đi</option>
                  {airports.map((airport:any) => (
                    <option key={airport.airportId} value={airport.airportId}>
                      {airport.airportCode} - {airport.airportName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">Sân bay đến</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Chọn sân bay đến</option>
                  {airports.map((airport:any) => (
                    <option key={airport.airportId} value={airport.airportId}>
                      {airport.airportCode} - {airport.airportName}
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
                  {aircrafts.map((aircraft:any) => (
                    <option key={aircraft.aircraftId} value={aircraft.aircraftId}>
                     {aircraft.aircraftCode} - {aircraft.model}
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