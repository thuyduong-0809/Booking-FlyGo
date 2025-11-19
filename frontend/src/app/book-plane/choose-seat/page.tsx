'use client';

import { useState, useMemo, useEffect, Fragment, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBooking, SelectedFare } from '../BookingContext';
import { useSearch } from '../SearchContext';
import { requestApi } from '@/lib/api';

type SeatCabin = 'Economy' | 'Business' | 'First';
type SeatLegKey = 'departure' | 'return';

interface Seat {
    id: string;
    seatId?: number;
    seatNumber: string;
    row: number;
    column: string;
    travelClass: SeatCabin;
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

interface SeatLegInfo {
    key: SeatLegKey;
    label: string;
    routeLabel: string;
    dateLabel?: string;
    flightNumber?: string;
    flightId?: number;
    storageKeys: string[];
}

interface FlightSeatApi {
    flightSeatId: number;
    isAvailable: boolean;
    seat?: {
        seatId: number;
        seatNumber: string;
        travelClass: SeatCabin;
        isAvailable: boolean;
    };
    flight?: {
        flightId: number;
        flightNumber: string;
        aircraft?: {
            aircraftId: number;
            aircraftCode: string;
            seatLayoutJSON?: {
                layout?: Record<string, string>;
            };
        };
    };
}

const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];

const defaultLayouts: Record<SeatCabin, string> = {
    First: '1-2-1',
    Business: '2-2-2',
    Economy: '3-3-3'
};

const seatCabinStyles: Record<SeatCabin, string> = {
    First: 'bg-purple-100 border-purple-400 text-purple-700 hover:bg-purple-200',
    Business: 'bg-orange-100 border-orange-400 text-orange-700 hover:bg-orange-200',
    Economy: 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600'
};

const getSeatVisualClass = (seat: Seat) => {
    if (seat.isOccupied) {
        return 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed';
    }
    if (seat.isSelected) {
        return 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200/70';
    }
    return seatCabinStyles[seat.travelClass] || seatCabinStyles.Economy;
};

const formatLegDateLabel = (value?: Date | string | null) => {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';
    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const dayName = dayNames[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
};

const resolveFlightIdFromFare = (fare?: SelectedFare) => {
    if (!fare) return undefined;
    if ((fare as any)?.flightData?.flightId) {
        return Number((fare as any).flightData.flightId);
    }
    if (fare.flightId) {
        const parsed = Number(fare.flightId);
        if (!isNaN(parsed)) return parsed;
    }
    return undefined;
};

const getStoredFlightPayload = (keys: string[]) => {
    if (typeof window === 'undefined') return null;
    for (const key of keys) {
        try {
            const raw = window.localStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed) return parsed;
            }
        } catch (error) {
            console.error(`Không thể đọc dữ liệu ${key} từ localStorage:`, error);
        }
    }
    return null;
};

const parseSeatNumber = (seatNumber?: string) => {
    if (!seatNumber) return null;
    const match = seatNumber.match(/(?:[A-Z]+-)?(\d+)([A-Z]+)/);
    if (!match) return null;
    return {
        row: Number(match[1]),
        column: match[2]
    };
};

const parseLayout = (layoutString?: string) => {
    if (!layoutString) return [];
    return layoutString
        .split('-')
        .map(part => parseInt(part, 10))
        .filter(num => !isNaN(num) && num > 0);
};

const getSeatPositionInLayout = (seatLetter: string, layout: number[]) => {
    const letterIndex = seatLetters.indexOf(seatLetter);
    if (letterIndex === -1) return null;

    let currentPos = 0;
    for (let sectionIndex = 0; sectionIndex < layout.length; sectionIndex++) {
        const sectionSize = layout[sectionIndex];
        if (letterIndex < currentPos + sectionSize) {
            return {
                section: sectionIndex,
                position: letterIndex - currentPos
            };
        }
        currentPos += sectionSize;
    }
    return null;
};

const createSeatMap = (rowSeats: Seat[], layoutSections: number[]) => {
    const seatMap: Record<number, Record<number, Seat>> = {};
    rowSeats.forEach(seat => {
        const position = getSeatPositionInLayout(seat.column, layoutSections);
        if (position) {
            if (!seatMap[position.section]) {
                seatMap[position.section] = {};
            }
            seatMap[position.section][position.position] = seat;
        }
    });
    return seatMap;
};

export default function ChooseSeatPage() {
    const router = useRouter();
    const { state, setSelectedServices } = useBooking();
    const { searchData } = useSearch();
    const bookingId = state.bookingId;

    // Lấy số lượng người từ searchData
    const totalAdults = searchData.passengers?.adults || 0;
    const totalChildren = searchData.passengers?.children || 0;
    const totalInfants = searchData.passengers?.infants || 0;

    // Kiểm tra loại chuyến bay
    const isOneWay = searchData.tripType === 'oneWay';

    const departureRouteLabel = `${searchData.departureAirport?.airportCode || 'SGN'} → ${searchData.arrivalAirport?.airportCode || 'HAN'}`;
    const returnRouteLabel = `${searchData.arrivalAirport?.airportCode || 'HAN'} → ${searchData.departureAirport?.airportCode || 'SGN'}`;
    const seatRouteDetails = isOneWay ? departureRouteLabel : `${departureRouteLabel}, ${returnRouteLabel}`;

    // State cho các dịch vụ - cập nhật details dựa trên loại chuyến bay
    const [services, setServices] = useState<Service[]>(() => {
        return [
            {
                id: 'seat-selection',
                name: 'Chọn chỗ ngồi yêu thích',
                description: 'Hãy chọn chỗ ngồi yêu thích của bạn',
                price: 90000,
                isSelected: false,
                icon: 'seat',
                details: seatRouteDetails
            },
            {
                id: 'baggage',
                name: 'Chọn hành lý/Dịch vụ nối chuyến',
                description: 'Hãy lựa chọn gói hành lý phù hợp',
                price: 400000,
                isSelected: false,
                icon: 'baggage',
                details: isOneWay ? `${departureRouteLabel} Gói 20kg` : `${departureRouteLabel} Gói 20kg, ${returnRouteLabel} Gói 20kg`
            },
            {
                id: 'insurance',
                name: 'Bảo hiểm du lịch FlyGo Travel Safe',
                description: 'Giấy chứng nhận bảo hiểm sẽ được cấp cùng vé máy bay, và không thể cấp lại sau chuyến bay.',
                price: 160000,
                isSelected: false,
                icon: 'insurance',
                details: departureRouteLabel
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
    const [seats, setSeats] = useState<Seat[]>([]);
    const [seatLimitMessage, setSeatLimitMessage] = useState('');
    const [isSeatModalOpen, setSeatModalOpen] = useState(false);
    const [isLoadingSeats, setIsLoadingSeats] = useState(false);
    const [seatLoadError, setSeatLoadError] = useState<string | null>(null);
    const [seatLayoutConfig, setSeatLayoutConfig] = useState<Record<string, string>>({});
    const [seatFlightInfo, setSeatFlightInfo] = useState<{ flightId?: number; flightNumber?: string; aircraftCode?: string; legLabel?: string; routeLabel?: string } | null>(null);
    const [activeLegKey, setActiveLegKey] = useState<SeatLegKey>('departure');
    const [selectedSeatsByLeg, setSelectedSeatsByLeg] = useState<Record<SeatLegKey, Seat[]>>({
        departure: [],
        return: []
    });

    const seatCacheRef = useRef<Record<SeatLegKey, Seat[]>>({
        departure: [],
        return: []
    });
    const layoutCacheRef = useRef<Record<SeatLegKey, Record<string, string>>>({
        departure: {},
        return: {}
    });
    const flightInfoCacheRef = useRef<Record<SeatLegKey, { flightId?: number; flightNumber?: string; aircraftCode?: string; legLabel?: string; routeLabel?: string } | null>>({
        departure: null,
        return: null
    });
    const selectedSeatsRef = useRef(selectedSeatsByLeg);
    const seatToggleOpenedRef = useRef(false);
    useEffect(() => {
        selectedSeatsRef.current = selectedSeatsByLeg;
    }, [selectedSeatsByLeg]);

    const resetSeatSelectionFlags = (seatList: Seat[]) => {
        let hasChange = false;
        const updatedList = seatList.map(seat => {
            if (!seat.isSelected) return seat;
            hasChange = true;
            return { ...seat, isSelected: false };
        });
        return hasChange ? updatedList : seatList;
    };

    const clearAllSeatSelections = () => {
        setSelectedSeatsByLeg({ departure: [], return: [] });
        selectedSeatsRef.current = { departure: [], return: [] };
        setSeats(prev => (prev.length === 0 ? prev : resetSeatSelectionFlags(prev)));

        (['departure', 'return'] as SeatLegKey[]).forEach(legKey => {
            const cachedSeats = seatCacheRef.current[legKey] || [];
            if (cachedSeats.length > 0) {
                seatCacheRef.current[legKey] = resetSeatSelectionFlags(cachedSeats);
            }
        });

        if (typeof window !== 'undefined') {
            try {
                window.localStorage.removeItem('selectedSeats');
            } catch (error) {
                console.error('Không thể xóa selectedSeats khỏi localStorage:', error);
            }
        }
    };

    const seatSelectionLimit = Math.max(1, totalAdults + totalChildren || 0);

    const legInfos = useMemo<SeatLegInfo[]>(() => {
        const legs: SeatLegInfo[] = [];
        const departureLeg: SeatLegInfo = {
            key: 'departure',
            label: isOneWay ? 'Chuyến bay' : 'Chuyến đi',
            routeLabel: `${searchData.departureAirport?.city || ''} (${searchData.departureAirport?.airportCode || ''}) → ${searchData.arrivalAirport?.city || ''} (${searchData.arrivalAirport?.airportCode || ''})`,
            dateLabel: formatLegDateLabel(searchData.departureDate),
            flightNumber: state.selectedDeparture?.code,
            flightId: resolveFlightIdFromFare(state.selectedDeparture),
            storageKeys: ['selectedFlight', 'selectedDepartureFlight']
        };
        legs.push(departureLeg);

        if (!isOneWay) {
            const returnLeg: SeatLegInfo = {
                key: 'return',
                label: 'Chuyến về',
                routeLabel: `${searchData.arrivalAirport?.city || ''} (${searchData.arrivalAirport?.airportCode || ''}) → ${searchData.departureAirport?.city || ''} (${searchData.departureAirport?.airportCode || ''})`,
                dateLabel: formatLegDateLabel(searchData.returnDate),
                flightNumber: state.selectedReturn?.code,
                flightId: resolveFlightIdFromFare(state.selectedReturn),
                storageKeys: ['selectedReturnFlight']
            };
            legs.push(returnLeg);
        }

        return legs;
    }, [isOneWay, searchData.departureAirport, searchData.arrivalAirport, searchData.departureDate, searchData.returnDate, state.selectedDeparture, state.selectedReturn]);

    const currentLegInfo = useMemo(() => {
        if (legInfos.length === 0) return undefined;
        const found = legInfos.find(leg => leg.key === activeLegKey);
        return found || legInfos[0];
    }, [legInfos, activeLegKey]);

    useEffect(() => {
        if (legInfos.length === 0) return;
        if (!legInfos.some(leg => leg.key === activeLegKey)) {
            setActiveLegKey(legInfos[0].key);
        }
    }, [legInfos, activeLegKey]);

    const seatRowsLayout = useMemo(() => {
        if (seats.length === 0) return [];

        const rows: Record<number, Seat[]> = {};
        seats.forEach(seat => {
            if (!rows[seat.row]) {
                rows[seat.row] = [];
            }
            rows[seat.row].push(seat);
        });

        return Object.keys(rows)
            .map(Number)
            .sort((a, b) => a - b)
            .map(rowNum => {
                const rowSeats = rows[rowNum].sort((a, b) => seatLetters.indexOf(a.column) - seatLetters.indexOf(b.column));
                const cabin = rowSeats[0]?.travelClass || 'Economy';
                const layoutString = seatLayoutConfig?.[cabin] || defaultLayouts[cabin as SeatCabin] || '';
                const layoutSections = parseLayout(layoutString);
                const layout = layoutSections.length > 0 ? layoutSections : [rowSeats.length];
                const seatMap = createSeatMap(rowSeats, layout);
                return { rowNum, cabin, layout, seatMap };
            });
    }, [seats, seatLayoutConfig]);

    const cabinLabels = useMemo(() => {
        const labels: Array<{ rowNum: number; cabin: string }> = [];
        let lastCabin: string | null = null;
        seatRowsLayout.forEach(row => {
            if (row.cabin !== lastCabin) {
                labels.push({ rowNum: row.rowNum, cabin: row.cabin });
                lastCabin = row.cabin;
            }
        });
        return labels;
    }, [seatRowsLayout]);

    useEffect(() => {
        if (!currentLegInfo) {
            setSeats([]);
            setSeatFlightInfo(null);
            setSeatLoadError('Không tìm thấy thông tin chuyến bay.');
            return;
        }

        const cachedSeats = seatCacheRef.current[currentLegInfo.key];
        const cachedInfo = flightInfoCacheRef.current[currentLegInfo.key];
        const canReuseCache =
            cachedSeats &&
            cachedSeats.length > 0 &&
            (!currentLegInfo.flightId || (cachedInfo?.flightId && cachedInfo.flightId === currentLegInfo.flightId));

        if (canReuseCache) {
            setSeats(cachedSeats);
            setSeatLayoutConfig(layoutCacheRef.current[currentLegInfo.key] || {});
            setSeatFlightInfo(cachedInfo || {
                legLabel: currentLegInfo.label,
                routeLabel: currentLegInfo.routeLabel
            });
            setSeatLoadError(null);
            setIsLoadingSeats(false);
            return;
        } else {
            seatCacheRef.current[currentLegInfo.key] = [];
            layoutCacheRef.current[currentLegInfo.key] = {};
            flightInfoCacheRef.current[currentLegInfo.key] = null;
        }

        let resolvedFlightId = currentLegInfo.flightId;
        if (!resolvedFlightId) {
            const stored = getStoredFlightPayload(currentLegInfo.storageKeys);
            if (stored?.flightId && !isNaN(Number(stored.flightId))) {
                resolvedFlightId = Number(stored.flightId);
            }
        }

        if (!resolvedFlightId) {
            setSeats([]);
            setSeatLayoutConfig({});
            setSeatFlightInfo({
                legLabel: currentLegInfo.label,
                routeLabel: currentLegInfo.routeLabel
            });
            setSeatLoadError('Không xác định được chuyến bay cho chặng này.');
            setIsLoadingSeats(false);
            return;
        }

        let isMounted = true;
        const fetchSeats = async () => {
            setIsLoadingSeats(true);
            setSeatLoadError(null);

            try {
                const response = await requestApi(`flight-seats/flight/${resolvedFlightId}`, 'GET');
                if (!response?.success || !Array.isArray(response.data)) {
                    throw new Error(response?.message || 'Không thể tải danh sách ghế');
                }

                const payload: FlightSeatApi[] = response.data;
                const previousSelections = selectedSeatsRef.current[currentLegInfo.key] || [];
                const selectedIds = new Set(previousSelections.map(seat => seat.id));

                const normalizedSeats: Seat[] = payload
                    .map((item) => {
                        const parsed = parseSeatNumber(item.seat?.seatNumber);
                        if (!parsed) return null;

                        const seatId = `${item.seat?.seatId ?? item.flightSeatId}`;
                        return {
                            id: seatId,
                            seatId: item.seat?.seatId,
                            seatNumber: item.seat?.seatNumber || '',
                            row: parsed.row,
                            column: parsed.column,
                            travelClass: item.seat?.travelClass || 'Economy',
                            isSelected: selectedIds.has(seatId),
                            isOccupied: !(item.isAvailable && item.seat?.isAvailable !== false),
                        } as Seat;
                    })
                    .filter(Boolean) as Seat[];

                // Lấy layout từ aircraft - tìm từ bất kỳ item nào có aircraft
                let layout: Record<string, string> = {};
                let aircraftData = null;
                for (const item of payload) {
                    if (item.flight?.aircraft?.seatLayoutJSON?.layout) {
                        layout = item.flight.aircraft.seatLayoutJSON.layout as Record<string, string>;
                        aircraftData = item.flight.aircraft;
                        break;
                    }
                }

                // Fallback về default layouts nếu không tìm thấy
                if (Object.keys(layout).length === 0) {
                    layout = {
                        First: defaultLayouts.First,
                        Business: defaultLayouts.Business,
                        Economy: defaultLayouts.Economy
                    };
                }

                const flightInfo = {
                    flightId: payload[0]?.flight?.flightId ?? resolvedFlightId,
                    flightNumber: payload[0]?.flight?.flightNumber || currentLegInfo.flightNumber,
                    aircraftCode: aircraftData?.aircraftCode || payload[0]?.flight?.aircraft?.aircraftCode,
                    legLabel: currentLegInfo.label,
                    routeLabel: currentLegInfo.routeLabel
                };

                if (isMounted) {
                    seatCacheRef.current[currentLegInfo.key] = normalizedSeats;
                    layoutCacheRef.current[currentLegInfo.key] = layout;
                    flightInfoCacheRef.current[currentLegInfo.key] = flightInfo;
                    setSeats(normalizedSeats);
                    setSeatLayoutConfig(layout);
                    setSeatFlightInfo(flightInfo);
                    setSeatLoadError(null);
                }
            } catch (error: any) {
                if (isMounted) {
                    setSeatLoadError(error?.message || 'Không thể tải danh sách ghế');
                    setSeats([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoadingSeats(false);
                }
            }
        };

        fetchSeats();

        return () => {
            isMounted = false;
        };
    }, [currentLegInfo]);

    const updateSeatSelection = (seatId: string) => {
        const seat = seats.find(s => s.id === seatId);
        if (!seat || seat.isOccupied) return;

        const isCurrentlySelected = seat.isSelected;
        const currentSelections = selectedSeatsByLeg[activeLegKey] || [];
        const currentLegLabel = legInfos.find(leg => leg.key === activeLegKey)?.label || 'chặng này';

        if (!isCurrentlySelected && seatSelectionLimit > 0 && currentSelections.length >= seatSelectionLimit) {
            setSeatLimitMessage(`Bạn chỉ có thể chọn tối đa ${seatSelectionLimit} ghế cho ${currentLegLabel.toLowerCase()}.`);
            return;
        }

        setSeatLimitMessage('');

        setSeats(prev => {
            const updated = prev.map(s =>
                s.id === seatId ? { ...s, isSelected: !s.isSelected } : s
            );
            seatCacheRef.current[activeLegKey] = updated;
            return updated;
        });

        setSelectedSeatsByLeg(prev => {
            const current = prev[activeLegKey] || [];
            const updatedCurrent = isCurrentlySelected
                ? current.filter(s => s.id !== seatId)
                : [...current, { ...seat, isSelected: true }];
            return {
                ...prev,
                [activeLegKey]: updatedCurrent
            };
        });
    };

    const currentSelectedSeats = selectedSeatsByLeg[activeLegKey] || [];
    const currentLegIndex = legInfos.findIndex(leg => leg.key === activeLegKey);
    const nextLegLabel = currentLegIndex > -1 && currentLegIndex < legInfos.length - 1 ? legInfos[currentLegIndex + 1].label : null;

    useEffect(() => {
        setSeatLimitMessage('');
    }, [activeLegKey]);

    useEffect(() => {
        if (isOneWay) {
            setSelectedSeatsByLeg(prev => {
                if (prev.return.length === 0) return prev;
                return { ...prev, return: [] };
            });
            seatCacheRef.current.return = [];
            layoutCacheRef.current.return = {};
            flightInfoCacheRef.current.return = null;
        }
    }, [isOneWay]);

    const handleSeatModalOpen = (openedFromSeatToggle: boolean = false) => {
        if (legInfos.length > 0) {
            setActiveLegKey(legInfos[0].key);
        }
        setSeatLimitMessage('');
        seatToggleOpenedRef.current = openedFromSeatToggle;
        setSeatModalOpen(true);
    };

    const handleSeatModalClose = () => {
        setSeatModalOpen(false);
        if (seatToggleOpenedRef.current) {
            toggleService('seat-selection', false);
        }
        seatToggleOpenedRef.current = false;
        setSeatLimitMessage('');
    };

    const handleSeatModalConfirm = () => {
        if (legInfos.length === 0) {
            setSeatModalOpen(false);
            return;
        }
        const currentIndex = legInfos.findIndex(leg => leg.key === activeLegKey);
        const selections = selectedSeatsByLeg[activeLegKey] || [];
        const currentLegLabel = legInfos[currentIndex]?.label || 'chặng này';

        if (selections.length === 0) {
            setSeatLimitMessage(`Vui lòng chọn ghế cho ${currentLegLabel.toLowerCase()}.`);
            return;
        }

        toggleService('seat-selection', true);
        seatToggleOpenedRef.current = false;

        // Lưu ghế đã chọn vào localStorage để sử dụng sau khi thanh toán
        try {
            const currentLegInfo = legInfos[currentIndex];
            const flightInfo = flightInfoCacheRef.current[activeLegKey];

            if (currentLegInfo && flightInfo?.flightId) {
                // Lấy ghế đã chọn cho tất cả các chặng
                const allSelectedSeats: Record<SeatLegKey, Array<{ seatNumber: string; flightId: number }>> = {
                    departure: [],
                    return: []
                };

                // Lưu ghế cho chặng hiện tại
                if (flightInfo.flightId) {
                    allSelectedSeats[activeLegKey] = selections.map(seat => ({
                        seatNumber: seat.seatNumber,
                        flightId: flightInfo.flightId!
                    }));
                }

                // Lưu ghế cho các chặng khác đã chọn trước đó
                legInfos.forEach(leg => {
                    if (leg.key !== activeLegKey) {
                        const legSeats = selectedSeatsByLeg[leg.key] || [];
                        const legFlightInfo = flightInfoCacheRef.current[leg.key];
                        if (legSeats.length > 0 && legFlightInfo?.flightId) {
                            allSelectedSeats[leg.key] = legSeats.map(seat => ({
                                seatNumber: seat.seatNumber,
                                flightId: legFlightInfo.flightId!
                            }));
                        }
                    }
                });

                localStorage.setItem('selectedSeats', JSON.stringify(allSelectedSeats));
            }
        } catch (error) {
        }

        if (currentIndex < legInfos.length - 1) {
            setSeatLimitMessage('');
            setActiveLegKey(legInfos[currentIndex + 1].key);
            return;
        }

        setSeatModalOpen(false);
    };

    const toggleService = (serviceId: string, nextState?: boolean) => {
        let seatServiceTurnedOff = false;

        setServices(prev => {
            const updatedServices = prev.map(service => {
                if (service.id !== serviceId) {
                    return service;
                }
                const targetState = typeof nextState === 'boolean' ? nextState : !service.isSelected;
                if (service.id === 'seat-selection' && service.isSelected && !targetState) {
                    seatServiceTurnedOff = true;
                }
                return { ...service, isSelected: targetState };
            });

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

        if (seatServiceTurnedOff) {
            seatToggleOpenedRef.current = false;
            clearAllSeatSelections();
        }
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

    const seatDetailsByLegText = useMemo(() => {
        return legInfos
            .map(leg => {
                const seatsForLeg = selectedSeatsByLeg[leg.key] || [];
                if (seatsForLeg.length === 0) return null;
                const labels = seatsForLeg.map(seat => seat.seatNumber || `${seat.row}${seat.column}`).join(', ');
                return `${leg.label}: ${labels}`;
            })
            .filter(Boolean)
            .join(' | ');
    }, [legInfos, selectedSeatsByLeg]);

    const seatServiceDetails = useMemo(() => {
        if (seatDetailsByLegText && seatDetailsByLegText.trim() !== '') {
            return seatDetailsByLegText;
        }
        return seatRouteDetails;
    }, [seatDetailsByLegText, seatRouteDetails]);

    useEffect(() => {
        setServices(prev =>
            prev.map(service => {
                if (service.id !== 'seat-selection') return service;
                return { ...service, details: seatServiceDetails };
            })
        );
    }, [seatServiceDetails]);

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

    return (
        <div className="min-h-screen bg-gray-50">
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
                    {services.map((service, index) => {
                        const isSeatService = service.id === 'seat-selection';

                        return (
                            <div key={service.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div
                                        className={`flex items-center space-x-4 flex-1 ${isSeatService ? 'cursor-pointer' : ''}`}
                                        onClick={() => {
                                            if (isSeatService) {
                                                handleSeatModalOpen();
                                            }
                                        }}
                                    >
                                        <div className="flex-shrink-0">
                                            {getServiceIcon(service.icon)}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-black">{service.name}</h3>
                                            {service.description && (
                                                <p className="text-sm text-black mt-1">{service.description}</p>
                                            )}
                                            {service.details && !(isSeatService && !service.isSelected) && (
                                                <div className="mt-2">
                                                    {isSeatService && service.isSelected && seatDetailsByLegText && seatDetailsByLegText.trim() !== '' ? (
                                                        <div className="space-y-2">
                                                            <div className="text-xs font-semibold text-gray-500 uppercase">Ghế đã chọn:</div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {legInfos.map(leg => {
                                                                    const seatsForLeg = selectedSeatsByLeg[leg.key] || [];
                                                                    if (seatsForLeg.length === 0) return null;
                                                                    return (
                                                                        <div key={leg.key} className="flex items-center gap-2 flex-wrap">
                                                                            <span className="text-xs font-medium text-gray-600">{leg.label}:</span>
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {seatsForLeg.map(seat => (
                                                                                    <span
                                                                                        key={seat.id}
                                                                                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-semibold border border-blue-200"
                                                                                    >
                                                                                        {seat.seatNumber || `${seat.row}${seat.column}`}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-black">
                                                            <span>{service.details}</span>
                                                        </div>
                                                    )}
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
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                if (isSeatService) {
                                                    const nextState = !service.isSelected;
                                                    toggleService(service.id, nextState);
                                                    if (nextState) {
                                                        handleSeatModalOpen(true);
                                                    } else {
                                                        seatToggleOpenedRef.current = false;
                                                    }
                                                    return;
                                                }
                                                toggleService(service.id);
                                            }}
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
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                if (isSeatService) {
                                                    handleSeatModalOpen();
                                                } else {
                                                    toggleSection(service.id);
                                                }
                                            }}
                                            className={`p-1 rounded ${isSeatService ? 'bg-white hover:bg-blue-50 text-blue-500' : 'hover:bg-gray-100 text-gray-500'}`}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                {index < services.length - 1 && <div className="border-t border-gray-200 mt-4"></div>}
                            </div>
                        );
                    })}
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

            {isSeatModalOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[98vh] flex flex-col">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 flex-shrink-0 sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Chọn chỗ ngồi yêu thích</h3>
                                <p className="text-sm text-gray-500 mt-1">Chọn tối đa {seatSelectionLimit} ghế cho hành khách người lớn và trẻ em</p>
                                {seatFlightInfo && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        {seatFlightInfo.flightNumber ? `Chuyến ${seatFlightInfo.flightNumber}` : null}
                                        {seatFlightInfo.flightNumber && seatFlightInfo.aircraftCode ? ' · ' : null}
                                        {seatFlightInfo.aircraftCode ? `Máy bay ${seatFlightInfo.aircraftCode}` : null}
                                    </p>
                                )}
                            </div>
                            <button onClick={handleSeatModalClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {legInfos.length > 1 && (
                            <div className="px-6 pt-4 pb-2 border-b border-gray-100 flex flex-wrap gap-3 flex-shrink-0">
                                {legInfos.map(leg => {
                                    const isActive = leg.key === activeLegKey;
                                    return (
                                        <button
                                            key={leg.key}
                                            onClick={() => setActiveLegKey(leg.key)}
                                            className={`px-4 py-2 rounded-2xl border text-sm font-semibold transition ${isActive ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'}`}
                                        >
                                            <div>{leg.label}</div>
                                            <div className="text-xs font-normal text-gray-500">{leg.routeLabel}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,3.5fr),minmax(220px,1fr)] xl:grid-cols-[minmax(0,4fr),minmax(280px,1fr)] gap-8 overflow-y-auto">
                            <div className="space-y-6">
                                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                    {(seatFlightInfo?.routeLabel || currentLegInfo?.label) && (
                                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase">{currentLegInfo?.label || 'Chặng hiện tại'}</p>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {seatFlightInfo?.routeLabel || currentLegInfo?.routeLabel || ''}
                                                </p>
                                                {currentLegInfo?.dateLabel && (
                                                    <p className="text-xs text-gray-500 mt-1">{currentLegInfo.dateLabel}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-semibold text-gray-500 uppercase">Đã chọn</p>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {currentSelectedSeats.length} / {seatSelectionLimit}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="overflow-y-auto pr-4">
                                        {isLoadingSeats && (
                                            <div className="flex items-center justify-center py-16 text-gray-500">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                                                Đang tải sơ đồ ghế...
                                            </div>
                                        )}

                                        {!isLoadingSeats && seatLoadError && (
                                            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
                                                {seatLoadError}
                                            </div>
                                        )}

                                        {!isLoadingSeats && !seatLoadError && seatRowsLayout.length === 0 && (
                                            <div className="text-center text-gray-500 py-10">
                                                Không tìm thấy dữ liệu ghế cho chuyến bay này.
                                            </div>
                                        )}

                                        {!isLoadingSeats && !seatLoadError && seatRowsLayout.length > 0 && (
                                            <div className="aircraft-diagram-wrapper">
                                                <div className="aircraft-diagram">
                                                    <div className="aircraft-diagram__body">
                                                        <div className="plane-seat-stack">
                                                            {seatRowsLayout.map(({ rowNum, layout, seatMap, cabin }) => (
                                                                <div
                                                                    key={rowNum}
                                                                    className="plane-seat-row"
                                                                    data-cabin={cabin}
                                                                    data-row={rowNum}
                                                                >
                                                                    <span className="plane-seat-row__number">{rowNum}</span>
                                                                    <div className="plane-seat-row__groups">
                                                                        {layout.map((cols, sectionIndex) => (
                                                                            <div key={`${rowNum}-section-${sectionIndex}`} className="flex gap-1 plane-seat-block">
                                                                                {Array.from({ length: cols }).map((_, colIndex) => {
                                                                                    const seat = seatMap[sectionIndex]?.[colIndex];
                                                                                    if (!seat) {
                                                                                        return (
                                                                                            <div
                                                                                                key={`${rowNum}-${sectionIndex}-${colIndex}-empty`}
                                                                                                className="plane-seat plane-seat--empty w-8 h-8 sm:w-9 sm:h-9 border border-gray-200/80 rounded-xl bg-gray-50"
                                                                                            />
                                                                                        );
                                                                                    }

                                                                                    return (
                                                                                        <button
                                                                                            key={seat.id}
                                                                                            type="button"
                                                                                            onClick={() => updateSeatSelection(seat.id)}
                                                                                            disabled={seat.isOccupied}
                                                                                            className={`plane-seat w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 text-xs sm:text-sm font-semibold flex items-center justify-center transition-all ${getSeatVisualClass(seat)} ${seat.isSelected ? 'plane-seat--selected' : ''}`}
                                                                                        >
                                                                                            {seat.column}
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                                {sectionIndex < layout.length - 1 && (
                                                                                    <div className="plane-seat-gap" aria-hidden="true">
                                                                                        <span className="plane-seat-gap__line"></span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {cabinLabels.length > 0 && (
                                                    <div className="aircraft-cabin-labels">
                                                        {cabinLabels.map(({ cabin, rowNum }) => (
                                                            <div key={`${cabin}-${rowNum}`} className="aircraft-cabin-label" data-cabin={cabin}>
                                                                {cabin} CLASS
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>

                            <div className="space-y-4 sticky top-6 self-start">
                                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                                    <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">Chú thích</h4>
                                    <div className="space-y-3 text-sm text-gray-600">
                                        <div className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                                            <span className="w-4 h-4 rounded border border-gray-300 bg-white block"></span>
                                            <span>Ghế trống</span>
                                        </div>
                                        <div className="flex items-center gap-3 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                                            <span className="w-4 h-4 rounded bg-gray-300 border border-gray-400 block"></span>
                                            <span>Ghế đã có người</span>
                                        </div>
                                        <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                                            <span className="w-4 h-4 rounded bg-blue-600 border border-blue-600 block"></span>
                                            <span>Ghế đang chọn</span>
                                        </div>
                                        <div className="flex items-center gap-3 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                                            <span className="w-4 h-4 rounded bg-purple-200 border border-purple-400 block"></span>
                                            <span>Hạng First</span>
                                        </div>
                                        <div className="flex items-center gap-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                                            <span className="w-4 h-4 rounded bg-amber-200 border border-amber-400 block"></span>
                                            <span>Hạng Business</span>
                                        </div>
                                        <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                                            <span className="w-4 h-4 rounded bg-white border border-slate-300 block"></span>
                                            <span>Hạng Economy</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Tóm tắt ghế</h4>
                                    {legInfos.length === 0 ? (
                                        <p className="text-sm text-gray-500">Không có thông tin chặng bay.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {legInfos.map(leg => {
                                                const seatsForLeg = selectedSeatsByLeg[leg.key] || [];
                                                return (
                                                    <div key={leg.key} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                                                        <p className="text-xs font-semibold text-gray-500 uppercase">{leg.label}</p>
                                                        {seatsForLeg.length === 0 ? (
                                                            <p className="text-sm text-gray-500">Chưa chọn ghế.</p>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {seatsForLeg.map(seat => (
                                                                    <span key={`${leg.key}-${seat.id}`} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
                                                                        {seat.seatNumber || `${seat.row}${seat.column}`}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {seatLimitMessage && <p className="text-sm text-red-600 mt-3">{seatLimitMessage}</p>}
                                </div>


                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0">
                            <button
                                type="button"
                                onClick={handleSeatModalClose}
                                className="px-5 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-white transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleSeatModalConfirm}
                                className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                            >
                                {nextLegLabel ? `Tiếp tục ${nextLegLabel.toLowerCase()}` : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
