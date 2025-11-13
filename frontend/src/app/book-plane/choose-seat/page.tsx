'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBooking } from '../BookingContext';
import { useSearch } from '../SearchContext';
import { requestApi } from '@/lib/api';

interface Seat {
    id: string;
    row: number;
    column: string;
    type: 'eco' | 'eco-plus' | 'skyboss';
    price: number;
    isSelected: boolean;
    isOccupied: boolean;
}

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    isSelected: boolean;
    icon: string;
    details?: string;
}

export default function ChooseSeatPage() {
    const router = useRouter();
    const { state, grandTotal, setSelectedServices } = useBooking();
    const { searchData } = useSearch();
    const bookingId = state.bookingId;

    // Lấy số lượng người từ searchData
    const totalAdults = searchData.passengers?.adults || 0;
    const totalChildren = searchData.passengers?.children || 0;
    const totalInfants = searchData.passengers?.infants || 0;

    // Kiểm tra loại chuyến bay
    const isOneWay = searchData.tripType === 'oneWay';

    // State cho các dịch vụ - cập nhật details dựa trên loại chuyến bay
    const [services, setServices] = useState<Service[]>(() => {
        const departureRoute = `${searchData.departureAirport?.airportCode || 'SGN'} → ${searchData.arrivalAirport?.airportCode || 'HAN'}`;
        const returnRoute = `${searchData.arrivalAirport?.airportCode || 'HAN'} → ${searchData.departureAirport?.airportCode || 'SGN'}`;

        return [
            {
                id: 'seat-selection',
                name: 'Chọn chỗ ngồi yêu thích',
                description: 'Hãy chọn chỗ ngồi yêu thích của bạn',
                price: 90000,
                isSelected: false,
                icon: 'seat',
                details: isOneWay ? `${departureRoute}, 27-D` : `${departureRoute}, ${returnRoute}, 27-D`
            },
            {
                id: 'baggage',
                name: 'Chọn hành lý/Dịch vụ nối chuyến',
                description: 'Hãy lựa chọn gói hành lý phù hợp',
                price: 400000,
                isSelected: false,
                icon: 'baggage',
                details: isOneWay ? `${departureRoute} Gói 20kg` : `${departureRoute} Gói 20kg, ${returnRoute} Gói 20kg`
            },
            {
                id: 'insurance',
                name: 'Bảo hiểm du lịch FlyGo Travel Safe',
                description: 'Giấy chứng nhận bảo hiểm sẽ được cấp cùng vé máy bay, và không thể cấp lại sau chuyến bay.',
                price: 160000,
                isSelected: false,
                icon: 'insurance',
                details: departureRoute
            },
            {
                id: 'passenger-service',
                name: 'Dịch vụ theo hành khách',
                description: '',
                price: 0,
                isSelected: false,
                icon: 'service'
            },
            {
                id: 'pet',
                name: 'Mang theo thú cưng',
                description: '',
                price: 0,
                isSelected: false,
                icon: 'pet'
            }
        ];
    });

    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    // Tạo dữ liệu ghế mẫu
    const generateSeats = (): Seat[] => {
        const seats: Seat[] = [];
        const rows = 30;
        const columns = ['A', 'B', 'C', 'D', 'E', 'F'];

        for (let row = 1; row <= rows; row++) {
            columns.forEach((col, colIndex) => {
                let type: 'eco' | 'eco-plus' | 'skyboss' = 'eco';
                let price = 0;

                // SkyBoss: hàng 1-3
                if (row <= 3) {
                    type = 'skyboss';
                    price = 500000;
                }
                // Eco Plus: hàng 4-6
                else if (row <= 6) {
                    type = 'eco-plus';
                    price = 200000;
                }
                // Eco: hàng 7-30
                else {
                    type = 'eco';
                    price = 0;
                }

                seats.push({
                    id: `${row}${col}`,
                    row,
                    column: col,
                    type,
                    price,
                    isSelected: false,
                    isOccupied: Math.random() < 0.3, // 30% ghế đã được đặt
                });
            });
        }

        return seats;
    };

    const [seats, setSeats] = useState<Seat[]>(generateSeats());
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

    const updateSeatSelection = (seatId: string) => {
        const seat = seats.find(s => s.id === seatId);
        if (!seat || seat.isOccupied) return;

        setSeats(prev =>
            prev.map(s =>
                s.id === seatId ? { ...s, isSelected: !s.isSelected } : s
            )
        );

        setSelectedSeats(prev => {
            if (seat.isSelected) {
                return prev.filter(s => s.id !== seatId);
            } else {
                return [...prev, { ...seat, isSelected: true }];
            }
        });
    };

    const toggleService = (serviceId: string) => {
        setServices(prev => {
            const updatedServices = prev.map(service =>
                service.id === serviceId
                    ? { ...service, isSelected: !service.isSelected }
                    : service
            );

            // Cập nhật context với dịch vụ đã chọn
            const selectedServices = updatedServices
                .filter(service => service.isSelected)
                .map(service => ({
                    id: service.id,
                    name: service.name,
                    price: service.price,
                    isSelected: service.isSelected
                }));

            setSelectedServices(selectedServices);

            return updatedServices;
        });
    };

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId);
            } else {
                newSet.add(sectionId);
            }
            return newSet;
        });
    };

    const getServiceIcon = (iconType: string) => {
        switch (iconType) {
            case 'seat':
                return (
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                    </svg>
                );
            case 'baggage':
                return (
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
                    </svg>
                );
            case 'insurance':
                return (
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V16H8V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z" />
                    </svg>
                );
            case 'service':
                return (
                    <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                    </svg>
                );
            case 'pet':
                return (
                    <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.5,12A1.5,1.5 0 0,0 6,13.5A1.5,1.5 0 0,0 4.5,12A1.5,1.5 0 0,0 3,10.5A1.5,1.5 0 0,0 4.5,12M19.5,12A1.5,1.5 0 0,0 21,10.5A1.5,1.5 0 0,0 19.5,9A1.5,1.5 0 0,0 18,10.5A1.5,1.5 0 0,0 19.5,12M12,6A3,3 0 0,1 15,9A3,3 0 0,1 12,12A3,3 0 0,1 9,9A3,3 0 0,1 12,6M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const formatVnd = (amount: number) => {
        const roundedNumber = Math.round(amount);
        return new Intl.NumberFormat('vi-VN').format(roundedNumber);
    };

    const departureFlight = state.selectedDeparture;
    const returnFlight = state.selectedReturn;

    // Tính tổng tiền dịch vụ
    const servicesTotal = useMemo(() => {
        return services
            .filter(service => service.isSelected)
            .reduce((total, service) => total + service.price, 0);
    }, [services]);

    // Tính tổng tiền vé + dịch vụ
    const calculatedTotal = useMemo(() => {
        const depPricePerPerson = (Number(departureFlight?.price) || 0);
        const depTaxPerPerson = (Number(departureFlight?.tax) || 0);

        const adultAndChildrenCount = totalAdults + totalChildren;

        const depAdultPrice = (depPricePerPerson + depTaxPerPerson) * adultAndChildrenCount;
        const depInfantPrice = 100000 * totalInfants;
        const totalDeparture = depAdultPrice + depInfantPrice;

        // Nếu là chuyến bay khứ hồi, tính thêm chuyến về
        if (!isOneWay && returnFlight) {
            const retPricePerPerson = (Number(returnFlight?.price) || 0);
            const retTaxPerPerson = (Number(returnFlight?.tax) || 0);

            const retAdultPrice = (retPricePerPerson + retTaxPerPerson) * adultAndChildrenCount;
            const retInfantPrice = 100000 * totalInfants;
            const totalReturn = retAdultPrice + retInfantPrice;

            return totalDeparture + totalReturn + servicesTotal;
        }

        return totalDeparture + servicesTotal;
    }, [departureFlight, returnFlight, totalAdults, totalChildren, totalInfants, servicesTotal, isOneWay]);

    // Effect để update booking total khi calculatedTotal thay đổi
    useEffect(() => {
        if (!bookingId) return;

        // Update booking totalAmount
        requestApi(`bookings/${bookingId}`, 'PUT', { totalAmount: calculatedTotal }).catch(err => {
            console.error('Failed to update booking total:', err);
        });
    }, [calculatedTotal, bookingId]);

    const getSeatColor = (seat: Seat) => {
        if (seat.isOccupied) return 'bg-gray-400';
        if (seat.isSelected) return 'bg-blue-600';

        switch (seat.type) {
            case 'skyboss':
                return 'bg-purple-500';
            case 'eco-plus':
                return 'bg-orange-500';
            default:
                return 'bg-gray-200';
        }
    };

    const getSeatTextColor = (seat: Seat) => {
        if (seat.isOccupied || seat.isSelected) return 'text-white';
        return 'text-gray-700';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
            {/* Top banner */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-6 shadow-lg">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {/* Back button */}
                            <Link
                                href="/book-plane/passengers"
                                className="flex items-center justify-center w-12 h-12 bg-black/20 hover:bg-black/30 rounded-full transition-all duration-200 hover:scale-110"
                            >
                                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>

                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-black">
                                    {isOneWay ? 'CHUYẾN BAY MỘT CHIỀU' : 'CHUYẾN BAY KHỨ HỒI'} | {totalAdults} Người lớn {totalChildren > 0 && `${totalChildren} Trẻ em`} {totalInfants > 0 && `${totalInfants} Em bé`}
                                </h1>
                                <div className="text-black mt-2 font-medium">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        <span>Điểm khởi hành {searchData.departureAirport?.city}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                        <span>Điểm đến {searchData.arrivalAirport?.city}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Services Selection */}
                <div className="space-y-0">
                    {services.map((service, index) => (
                        <div key={service.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 flex-1">
                                    <div className="flex-shrink-0">
                                        {getServiceIcon(service.icon)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-black">{service.name}</h3>
                                        {service.description && (
                                            <p className="text-sm text-black mt-1">{service.description}</p>
                                        )}
                                        {service.details && (
                                            <div className="mt-2 text-sm text-black">
                                                <div className="flex items-center space-x-1">
                                                    <span>{service.details}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {service.price > 0 && (
                                        <span className="text-lg font-bold text-red-600">
                                            {formatVnd(service.price)} VND
                                        </span>
                                    )}
                                    <button
                                        onClick={() => toggleService(service.id)}
                                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${service.isSelected
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'border-gray-300 hover:border-blue-500'
                                            }`}
                                    >
                                        {service.isSelected && (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => toggleSection(service.id)}
                                        className="p-1 hover:bg-gray-100 rounded"
                                    >
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            {index < services.length - 1 && <div className="border-t border-gray-200 mt-4"></div>}
                        </div>
                    ))}
                </div>

                {/* Right: Booking Summary */}
                <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 sticky top-4">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mb-8 text-center">
                        THÔNG TIN ĐẶT CHỖ
                    </h3>

                    {/* Departure Flight */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-bold text-black">Chuyến đi</h4>
                            <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-black">{formatVnd(((Number(departureFlight?.price) || 0) + (Number(departureFlight?.tax) || 0)) * (totalAdults + totalChildren) + 100000 * totalInfants)} VND</span>
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                            {/* Route */}
                            <div className="text-base text-gray-700">{searchData.departureAirport?.city || ''} ({searchData.departureAirport?.airportCode || ''}) ✈ {searchData.arrivalAirport?.city || ''} ({searchData.arrivalAirport?.airportCode || ''})</div>

                            {/* Date - Format: "Chủ nhật, 28/10/2025" */}
                            <div className="text-base text-gray-700">
                                {(() => {
                                    const date = searchData.departureDate || new Date();
                                    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
                                    const dayName = dayNames[date.getDay()];
                                    const day = date.getDate();
                                    const month = date.getMonth() + 1;
                                    const year = date.getFullYear();
                                    return `${dayName}, ${day}/${month}/${year}`;
                                })()}
                            </div>

                            {/* Time */}
                            <div className="text-base text-gray-700">Giờ bay: {departureFlight?.departTime || ''} - {departureFlight?.arriveTime || ''}</div>

                            {/* Flight Code */}
                            <div className="text-base text-gray-700">Số hiệu: {departureFlight?.code || ''}</div>

                            {/* Fare Class */}
                            <div className="text-base font-bold text-gray-700">Hạng vé: {departureFlight?.fareName || ''}</div>

                            {/* Price Breakdown */}
                            <div className="pt-2 space-y-3 border-t border-gray-200">
                                {/* Giá vé cho người lớn */}
                                {totalAdults > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-base text-gray-700">Người lớn x {totalAdults}</span>
                                        <span className="font-semibold text-gray-700">{formatVnd((Number(departureFlight?.price) || 0) * totalAdults)} VND</span>
                                    </div>
                                )}

                                {/* Giá vé cho trẻ em */}
                                {totalChildren > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-base text-gray-700">Trẻ em x {totalChildren}</span>
                                        <span className="font-semibold text-gray-700">{formatVnd((Number(departureFlight?.price) || 0) * totalChildren)} VND</span>
                                    </div>
                                )}

                                {/* Giá vé cho em bé */}
                                {totalInfants > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-base text-gray-700">Em bé x {totalInfants}</span>
                                        <span className="font-semibold text-gray-700">{formatVnd(100000 * totalInfants)} VND</span>
                                    </div>
                                )}

                                {/* Thuế VAT */}
                                {(totalAdults > 0 || totalChildren > 0 || totalInfants > 0) && (
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                        <span className="text-base text-gray-700">Thuế VAT</span>
                                        <span className="font-semibold text-gray-700">{formatVnd((Number(departureFlight?.tax) || 0) * (totalAdults + totalChildren))} VND</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Return Flight - chỉ hiển thị khi không phải chuyến bay một chiều */}
                    {!isOneWay && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-lg font-bold text-black">Chuyến về</h4>
                                <div className="flex items-center space-x-2">
                                    <span className="text-lg font-bold text-black">{formatVnd(((Number(returnFlight?.price) || 0) + (Number(returnFlight?.tax) || 0)) * (totalAdults + totalChildren) + 100000 * totalInfants)} VND</span>
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                {/* Route */}
                                <div className="text-base text-gray-700">{searchData.arrivalAirport?.city || ''} ({searchData.arrivalAirport?.airportCode || ''}) ✈ {searchData.departureAirport?.city || ''} ({searchData.departureAirport?.airportCode || ''})</div>

                                {/* Date - Format: "Thứ hai, 29/10/2025" */}
                                <div className="text-base text-gray-700">
                                    {(() => {
                                        const dateValue = searchData.returnDate || new Date();
                                        // Đảm bảo parse date đúng cách, tránh lỗi timezone
                                        const date = typeof dateValue === 'string' ? new Date(dateValue) : new Date(dateValue);
                                        const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
                                        const dayName = dayNames[date.getDay()];
                                        const day = String(date.getDate()).padStart(2, '0');
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const year = date.getFullYear();
                                        return `${dayName}, ${day}/${month}/${year}`;
                                    })()}
                                </div>

                                {/* Time */}
                                <div className="text-base text-gray-700">Giờ bay: {returnFlight?.departTime || ''} - {returnFlight?.arriveTime || ''}</div>

                                {/* Flight Code */}
                                <div className="text-base text-gray-700">Số hiệu: {returnFlight?.code || ''}</div>

                                {/* Fare Class */}
                                <div className="text-base font-bold text-gray-700">Hạng vé: {returnFlight?.fareName || ''}</div>

                                {/* Price Breakdown */}
                                <div className="pt-2 space-y-3 border-t border-gray-200">
                                    {/* Giá vé cho người lớn */}
                                    {totalAdults > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-base text-gray-700">Người lớn x {totalAdults}</span>
                                            <span className="font-semibold text-gray-700">{formatVnd((Number(returnFlight?.price) || 0) * totalAdults)} VND</span>
                                        </div>
                                    )}

                                    {/* Giá vé cho trẻ em */}
                                    {totalChildren > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-base text-gray-700">Trẻ em x {totalChildren}</span>
                                            <span className="font-semibold text-gray-700">{formatVnd((Number(returnFlight?.price) || 0) * totalChildren)} VND</span>
                                        </div>
                                    )}

                                    {/* Giá vé cho em bé */}
                                    {totalInfants > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-base text-gray-700">Em bé x {totalInfants}</span>
                                            <span className="font-semibold text-gray-700">{formatVnd(100000 * totalInfants)} VND</span>
                                        </div>
                                    )}

                                    {/* Thuế VAT */}
                                    {(totalAdults > 0 || totalChildren > 0 || totalInfants > 0) && (
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                            <span className="text-base text-gray-700">Thuế VAT</span>
                                            <span className="font-semibold text-gray-700">{formatVnd((Number(returnFlight?.tax) || 0) * (totalAdults + totalChildren))} VND</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Services Total */}
                    {servicesTotal > 0 && (
                        <div className="mb-6 bg-orange-50 rounded-xl p-4">
                            <h4 className="text-lg font-bold text-orange-800 mb-2">Dịch vụ bổ sung</h4>
                            <div className="space-y-2">
                                {services
                                    .filter(service => service.isSelected)
                                    .map((service) => (
                                        <div key={service.id} className="flex justify-between items-center">
                                            <span className="text-orange-700">{service.name}</span>
                                            <span className="font-semibold text-orange-800">+{formatVnd(service.price)} VND</span>
                                        </div>
                                    ))}
                            </div>
                            <div className="border-t border-orange-200 pt-2 mt-3">
                                <div className="flex text-orange-700 justify-between items-center font-bold text-lg">
                                    <span>Tổng dịch vụ:</span>
                                    <span className="text-orange-600">{formatVnd(servicesTotal)} VND</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Total */}
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl text-center mb-8 shadow-xl">
                        <div className="text-xl font-semibold mb-3">Tổng tiền</div>
                        <div className="text-4xl md:text-5xl font-bold">
                            {formatVnd(calculatedTotal)} VND
                        </div>
                        <div className="text-red-100 text-sm mt-2">Bao gồm tất cả thuế và phí</div>
                    </div>

                    <Link href="/book-plane/payment" className="w-full block text-center bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-5 rounded-2xl text-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                        Đi tiếp
                    </Link>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="bg-white border-t border-gray-200 py-4">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <button onClick={() => router.back()} className="px-6 py-3 border-2 border-gray-300 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Quay lại
                    </button>

                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-800">Tổng tiền</div>
                        <div className="text-2xl font-bold text-red-600">{formatVnd(calculatedTotal)} VND</div>
                    </div>

                    <Link href="/book-plane/payment" className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                        Đi tiếp
                    </Link>
                </div>
            </div>
        </div>
    );
}
