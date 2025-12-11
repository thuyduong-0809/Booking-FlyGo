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
    flightSeatId?: number;  // ✅ ID duy nhất của ghế trên chuyến bay cụ thể
    seatId?: number;        // ID ghế vật lý (để hiển thị thông tin)
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

interface MealOption {
    id: string;
    name: string;
    description: string;
    price: number;
    calories?: number;
    image?: string;
}

type MealSelectionsState = Record<SeatLegKey, { optionId: string; quantity: number } | null>;

interface PetServiceState {
    enabled: boolean;
    price: number;
    note?: string;
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

// Mapping từ FareClassName sang SeatCabin
const fareClassToSeatCabin: Record<string, SeatCabin> = {
    // First Class variants
    'FIST CLASS': 'First',
    'FIRST CLASS': 'First',
    'First': 'First',
    'first': 'First',

    // Business Class variants  
    'BUSINESS': 'Business',
    'Business': 'Business',
    'business': 'Business',

    // Economy Class variants
    'ECONOMY': 'Economy',
    'Economy': 'Economy',
    'economy': 'Economy',
    'ECO': 'Economy',
    'Eco': 'Economy',
    'eco': 'Economy'
};

// Giá ghế theo hạng và vị trí
const seatPrices: Record<SeatCabin, { window: number; middle: number; aisle: number }> = {
    First: { window: 0, middle: 0, aisle: 0 }, // First class miễn phí
    Business: { window: 100000, middle: 80000, aisle: 100000 },
    Economy: { window: 100000, middle: 80000, aisle: 100000 }
};

const defaultLayouts: Record<SeatCabin, string> = {
    First: '1-2-1',
    Business: '2-2-2',
    Economy: '3-3-3'
};

const defaultBaggageSelection: Record<SeatLegKey, { weight: string; price: number }> = {
    departure: { weight: '20kg', price: 200000 },
    return: { weight: '20kg', price: 200000 }
};

const defaultMealSelections: MealSelectionsState = {
    departure: null,
    return: null
};

const defaultPetServiceState: PetServiceState = {
    enabled: false,
    price: 4000000,
    note: 'Vận chuyển thú cưng an toàn cùng FlyGo'
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

// Xác định hạng vé từ SelectedFare
const getTravelClassFromFare = (fare?: SelectedFare): SeatCabin => {
    if (!fare?.fareName) return 'Economy';
    return fareClassToSeatCabin[fare.fareName] || 'Economy';
};

// Lấy hạng vé từ thông tin đặt chỗ (state booking)
const getTravelClassFromBookingState = (departureFare?: SelectedFare, returnFare?: SelectedFare, legKey?: SeatLegKey): SeatCabin => {

    // Nếu có legKey cụ thể, ưu tiên lấy theo chặng đó
    if (legKey) {
        const targetFare = legKey === 'departure' ? departureFare : returnFare;
        if (targetFare?.fareName) {
            const mappedClass = fareClassToSeatCabin[targetFare.fareName] || 'Economy';
            return mappedClass;
        }
    }

    // Fallback: lấy hạng cao nhất giữa 2 chuyến
    const departureClass = getTravelClassFromFare(departureFare);
    const returnClass = getTravelClassFromFare(returnFare);

    const classHierarchy: Record<SeatCabin, number> = {
        'First': 3,
        'Business': 2,
        'Economy': 1
    };

    const finalClass = classHierarchy[returnClass] > classHierarchy[departureClass] ? returnClass : departureClass;
    return finalClass;
};

// Lấy hạng vé từ localStorage selectedFlight
const getTravelClassFromLocalStorage = (): SeatCabin => {
    if (typeof window === 'undefined') return 'Economy';

    try {
        // Kiểm tra các keys có thể có trong localStorage
        const storageKeys = ['selectedDepartureFlight', 'selectedReturnFlight', 'selectedFlight'];

        let highestClass: SeatCabin = 'Economy';
        const classHierarchy: Record<SeatCabin, number> = {
            'First': 3,
            'Business': 2,
            'Economy': 1
        };

        for (const key of storageKeys) {
            const flightData = window.localStorage.getItem(key);
            if (flightData) {
                const parsed = JSON.parse(flightData);
                if (parsed?.travelClass) {
                    const travelClass = parsed.travelClass;
                    const mappedClass = fareClassToSeatCabin[travelClass] || 'Economy';

                    // Chọn hạng cao nhất
                    if (classHierarchy[mappedClass] > classHierarchy[highestClass]) {
                        highestClass = mappedClass;
                    }
                }
            }
        }

        return highestClass;
    } catch (error) {
        console.error('Không thể đọc dữ liệu flight từ localStorage:', error);
    }

    return 'Economy';
};

// Lấy hạng vé cho chặng cụ thể từ localStorage
const getTravelClassForLeg = (legKey: SeatLegKey): SeatCabin => {
    if (typeof window === 'undefined') return 'Economy';

    try {
        const storageKey = legKey === 'departure' ? 'selectedDepartureFlight' : 'selectedReturnFlight';
        const fallbackKey = 'selectedFlight';

        // Ưu tiên key chính, fallback về selectedFlight
        const keys = [storageKey, fallbackKey];

        for (const key of keys) {
            const flightData = window.localStorage.getItem(key);
            if (flightData) {
                const parsed = JSON.parse(flightData);
                if (parsed?.travelClass) {
                    const travelClass = parsed.travelClass;
                    const mappedClass = fareClassToSeatCabin[travelClass] || 'Economy';
                    return mappedClass;
                }
            }
        }
    } catch (error) {
        console.error(`Không thể đọc dữ liệu flight cho ${legKey} từ localStorage:`, error);
    }

    return 'Economy';
};

// Xác định vị trí ghế (cửa sổ, giữa, lối đi)
const getSeatPosition = (seat: Seat, layout: number[]): 'window' | 'middle' | 'aisle' => {
    const position = getSeatPositionInLayout(seat.column, layout);
    if (!position) {
        // Fallback: dựa vào chữ cái đầu/cuối
        const seatLetter = seat.column;
        if (seatLetter === 'A' || seatLetter === 'F') return 'window';
        if (seatLetter === 'C' || seatLetter === 'D') return 'aisle';
        return 'middle';
    }

    const { section, position: posInSection } = position;
    const sectionSize = layout[section];

    // Ghế ở section đầu tiên, vị trí đầu tiên = cửa sổ bên trái
    if (section === 0 && posInSection === 0) return 'window';

    // Ghế ở section cuối cùng, vị trí cuối cùng = cửa sổ bên phải  
    if (section === layout.length - 1 && posInSection === sectionSize - 1) return 'window';

    // Ghế ở cuối section (trừ section cuối) hoặc đầu section (trừ section đầu) = lối đi
    if (posInSection === sectionSize - 1 && section < layout.length - 1) return 'aisle';
    if (posInSection === 0 && section > 0) return 'aisle';

    return 'middle';
};

// Tính giá ghế dựa trên hạng và vị trí
const calculateSeatPrice = (seat: Seat, allowedClass: SeatCabin, layout: number[]): number => {
    // Nếu ghế không thuộc hạng được phép, không tính tiền
    if (seat.travelClass !== allowedClass) return 0;

    // Nếu là First class, miễn phí
    if (allowedClass === 'First') return 0;

    const position = getSeatPosition(seat, layout);
    const basePrice = seatPrices[allowedClass][position] || 0;

    console.log(`Calculating price for seat ${seat.seatNumber} (${allowedClass}, ${position}): ${basePrice}`);
    return basePrice;
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

const readFromStorage = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
            return parsed as T;
        }
    } catch (error) {
        console.error(`Không thể đọc dữ liệu ${key} từ localStorage:`, error);
    }
    return fallback;
};

const writeToStorage = (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Không thể lưu dữ liệu ${key} vào localStorage:`, error);
    }
};

const mealOptions: MealOption[] = [
    {
        id: 'thai-chicken-rice',
        name: 'Combo Cơm chiên Thái & nước suối + hạt điều',
        description: 'Cơm chiên phong cách Thái kết hợp gà chiên giòn, phục vụ kèm nước suối và hạt điều rang.',
        price: 99000,
        image: '/images/meals/thai-fried-rice.jpg'
    },
    {
        id: 'shrimp-glass-noodle',
        name: 'Combo Miến xào tôm cua & nước suối + hạt điều',
        description: 'Miến xào tôm cua chuẩn vị Á Đông, đầy đủ dinh dưỡng và tiện lợi trên chuyến bay.',
        price: 99000,
        image: '/images/meals/shrimp-noodle.jpg'
    },
    {
        id: 'singapore-noodle',
        name: 'Combo Bún xào Singapore & nước suối + hạt điều',
        description: 'Bún xào Singapore cay nhẹ, kết hợp rau củ tươi và protein cân bằng.',
        price: 99000,
        image: '/images/meals/singapore-noodle.jpg'
    },
    {
        id: 'vegetarian-combo',
        name: 'Combo chay dương châu & nước suối + hạt điều',
        description: 'Lựa chọn thuần chay với cơm dương châu, bổ sung năng lượng nhẹ nhàng.',
        price: 99000,
        image: '/images/meals/vegan-rice.jpg'
    }
];

const getMealOptionById = (optionId?: string | null) => {
    if (!optionId) return undefined;
    return mealOptions.find(option => option.id === optionId);
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
                description: 'Chỉ được chọn ghế theo hạng vé đã mua. Giá thay đổi theo vị trí ghế.',
                price: 0, // Sẽ được cập nhật theo hạng vé
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
                id: 'meal',
                name: 'Chọn suất ăn Jet Café',
                description: 'Thực đơn nóng Jet Café dành riêng cho hành trình của bạn',
                price: 0,
                isSelected: false,
                icon: 'meal',
                details: 'Chưa chọn suất ăn'
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
    const [isBaggageModalOpen, setBaggageModalOpen] = useState(false);
    const [isInsuranceModalOpen, setInsuranceModalOpen] = useState(false);
    const [selectedBaggage, setSelectedBaggage] = useState<Record<SeatLegKey, { weight: string; price: number }>>(() => {
        const stored = readFromStorage<Record<SeatLegKey, { weight: string; price: number }>>('selectedBaggage', defaultBaggageSelection);
        return {
            departure: stored?.departure || defaultBaggageSelection.departure,
            return: stored?.return || defaultBaggageSelection.return
        };
    });
    const [isLoadingSeats, setIsLoadingSeats] = useState(false);
    const [seatLoadError, setSeatLoadError] = useState<string | null>(null);
    const [seatLayoutConfig, setSeatLayoutConfig] = useState<Record<string, string>>({});
    const [seatFlightInfo, setSeatFlightInfo] = useState<{ flightId?: number; flightNumber?: string; aircraftCode?: string; legLabel?: string; routeLabel?: string } | null>(null);
    const [activeLegKey, setActiveLegKey] = useState<SeatLegKey>('departure');
    const [selectedSeatsByLeg, setSelectedSeatsByLeg] = useState<Record<SeatLegKey, Seat[]>>({
        departure: [],
        return: []
    });
    const [mealSelections, setMealSelections] = useState<MealSelectionsState>(() => {
        const stored = readFromStorage<MealSelectionsState>('selectedMeals', defaultMealSelections);
        return {
            departure: stored?.departure || defaultMealSelections.departure,
            return: stored?.return || defaultMealSelections.return
        };
    });
    const [petServiceSelection, setPetServiceSelection] = useState<PetServiceState>(() => {
        const stored = readFromStorage<PetServiceState>('petServiceSelection', defaultPetServiceState);
        return {
            enabled: stored?.enabled ?? defaultPetServiceState.enabled,
            price: stored?.price ?? defaultPetServiceState.price,
            note: stored?.note || defaultPetServiceState.note
        };
    });
    const [isMealModalOpen, setMealModalOpen] = useState(false);
    const [mealActiveLegKey, setMealActiveLegKey] = useState<SeatLegKey>('departure');
    const [mealModalMessage, setMealModalMessage] = useState('');
    const [isPetModalOpen, setPetModalOpen] = useState(false);
    const [allowedTravelClass, setAllowedTravelClass] = useState<SeatCabin>('Economy');
    const [seatPricePerPerson, setSeatPricePerPerson] = useState(0);

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
    const baggageToggleOpenedRef = useRef(false);
    const mealToggleOpenedRef = useRef(false);
    const petToggleOpenedRef = useRef(false);
    useEffect(() => {
        selectedSeatsRef.current = selectedSeatsByLeg;
    }, [selectedSeatsByLeg]);

    // Xác định hạng vé được phép dựa trên chuyến bay đã chọn
    useEffect(() => {
        const departureFare = state.selectedDeparture;
        const returnFare = state.selectedReturn;

        // Ưu tiên 1: Lấy từ thông tin đặt chỗ (booking state)
        if (departureFare || returnFare) {
            const bookingClass = getTravelClassFromBookingState(departureFare, returnFare, activeLegKey);
            console.log(`Setting allowed travel class from booking state for ${activeLegKey}:`, bookingClass);
            setAllowedTravelClass(bookingClass);
            return;
        }

        // Ưu tiên 2: Lấy từ localStorage cho chặng hiện tại
        const currentLegClass = getTravelClassForLeg(activeLegKey);

        // Ưu tiên 3: Lấy hạng cao nhất từ tất cả chuyến bay trong localStorage
        const globalClass = getTravelClassFromLocalStorage();

        let finalClass: SeatCabin = currentLegClass;

        // Nếu không có dữ liệu cho chặng hiện tại, dùng hạng global
        if (currentLegClass === 'Economy' && globalClass !== 'Economy') {
            finalClass = globalClass;
        }

        console.log(`Setting allowed travel class from localStorage for ${activeLegKey}:`, finalClass);
        setAllowedTravelClass(finalClass);
    }, [state.selectedDeparture, state.selectedReturn, isOneWay, activeLegKey]);

    // Theo dõi thay đổi localStorage khi component mount (chỉ khi không có booking state)
    useEffect(() => {
        const updateTravelClassFromStorage = () => {
            // Chỉ update từ localStorage nếu không có booking state
            if (!state.selectedDeparture && !state.selectedReturn) {
                const currentLegClass = getTravelClassForLeg(activeLegKey);
                const globalClass = getTravelClassFromLocalStorage();

                // Ưu tiên hạng của chặng hiện tại, fallback về global
                const finalClass = currentLegClass !== 'Economy' ? currentLegClass : globalClass;

                console.log(`Updating travel class from storage for ${activeLegKey}:`, finalClass);
                setAllowedTravelClass(finalClass);
            }
        };

        // Chỉ cập nhật khi không có booking state
        if (!state.selectedDeparture && !state.selectedReturn) {
            updateTravelClassFromStorage();
        }

        // Lắng nghe sự kiện storage change (nếu localStorage thay đổi từ tab khác)
        window.addEventListener('storage', updateTravelClassFromStorage);

        return () => {
            window.removeEventListener('storage', updateTravelClassFromStorage);
        };
    }, [activeLegKey]);

    // Cập nhật giá dịch vụ chọn ghế dựa trên hạng vé
    useEffect(() => {
        const basePrice = allowedTravelClass === 'First' ? 0 :
            allowedTravelClass === 'Business' ? 120000 : 150000;
        setSeatPricePerPerson(basePrice);
    }, [allowedTravelClass]);

    useEffect(() => {
        writeToStorage('selectedBaggage', selectedBaggage);
    }, [selectedBaggage]);

    useEffect(() => {
        writeToStorage('selectedMeals', mealSelections);
    }, [mealSelections]);

    useEffect(() => {
        writeToStorage('petServiceSelection', petServiceSelection);
    }, [petServiceSelection]);

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

    const clearAllBaggageSelections = () => {
        setSelectedBaggage(defaultBaggageSelection);
        writeToStorage('selectedBaggage', defaultBaggageSelection);
    };

    const seatSelectionLimit = Math.max(1, totalAdults + totalChildren || 0);
    const mealSelectionLimit = Math.max(1, totalAdults + totalChildren || 0);

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

                        const seatId = `${item.flightSeatId}`; // Sử dụng flightSeatId làm unique ID
                        return {
                            id: seatId,
                            flightSeatId: item.flightSeatId,  // ✅ Lưu flightSeatId
                            seatId: item.seat?.seatId,        // Lưu seatId để hiển thị
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

        // Kiểm tra xem ghế có thuộc hạng được phép không
        if (seat.travelClass !== allowedTravelClass) {
            setSeatLimitMessage(`Bạn chỉ có thể chọn ghế hạng ${allowedTravelClass} theo vé đã mua.`);
            return;
        }

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

    useEffect(() => {
        if (isOneWay) {
            setMealSelections(prev => {
                if (!prev.return) return prev;
                return { ...prev, return: null };
            });
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
        let baggageServiceTurnedOff = false;
        let mealServiceTurnedOff = false;
        let petServiceTurnedOff = false;

        setServices(prev => {
            const updatedServices = prev.map(service => {
                if (service.id !== serviceId) {
                    return service;
                }
                const targetState = typeof nextState === 'boolean' ? nextState : !service.isSelected;
                if (service.id === 'seat-selection' && service.isSelected && !targetState) {
                    seatServiceTurnedOff = true;
                }
                if (service.id === 'baggage' && service.isSelected && !targetState) {
                    baggageServiceTurnedOff = true;
                }
                if (service.id === 'meal' && service.isSelected && !targetState) {
                    mealServiceTurnedOff = true;
                }
                if (service.id === 'pet' && service.isSelected && !targetState) {
                    petServiceTurnedOff = true;
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

        if (baggageServiceTurnedOff) {
            baggageToggleOpenedRef.current = false;
            clearAllBaggageSelections();
        }

        if (mealServiceTurnedOff) {
            mealToggleOpenedRef.current = false;
        }

        if (petServiceTurnedOff) {
            petToggleOpenedRef.current = false;
            setPetServiceSelection(prev => ({ ...prev, enabled: false }));
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

    const handleBaggageModalOpen = (openedFromToggle: boolean = false) => {
        baggageToggleOpenedRef.current = openedFromToggle;
        setBaggageModalOpen(true);
    };

    const handleBaggageModalClose = () => {
        setBaggageModalOpen(false);
        if (baggageToggleOpenedRef.current) {
            toggleService('baggage', false);
        }
        baggageToggleOpenedRef.current = false;
    };

    const handleBaggageModalConfirm = () => {
        // Giá và details đã được cập nhật tự động qua useEffect khi selectedBaggage thay đổi
        // Tự động tick chọn dịch vụ và đóng modal
        toggleService('baggage', true);
        baggageToggleOpenedRef.current = false;
        setBaggageModalOpen(false);
    };

    const handleMealModalOpen = (openedFromToggle: boolean = false) => {
        mealToggleOpenedRef.current = openedFromToggle;
        setMealModalMessage('');
        if (legInfos.length > 0) {
            setMealActiveLegKey(legInfos[0].key);
        }
        setMealModalOpen(true);
    };

    const handleMealModalClose = () => {
        setMealModalOpen(false);
        if (mealToggleOpenedRef.current) {
            toggleService('meal', false);
        }
        mealToggleOpenedRef.current = false;
        setMealModalMessage('');
    };

    const adjustMealQuantity = (legKey: SeatLegKey, optionId: string, delta: number) => {
        setMealModalMessage('');
        setMealSelections(prev => {
            const otherTotals = Object.entries(prev).reduce((sum, [key, value]) => {
                if (key === legKey) return sum;
                return sum + (value?.quantity || 0);
            }, 0);

            const current = prev[legKey];
            const isSameOption = current?.optionId === optionId;
            const baseQty = isSameOption ? current.quantity : 0;
            const nextQty = Math.max(0, baseQty + delta);
            const desiredTotal = otherTotals + nextQty;

            if (delta > 0 && mealSelectionLimit > 0 && desiredTotal > mealSelectionLimit) {
                setMealModalMessage(`Bạn chỉ có thể chọn tối đa ${mealSelectionLimit} suất ăn cho hành khách người lớn & trẻ em.`);
                return prev;
            }

            const updated: MealSelectionsState = { ...prev };
            if (nextQty === 0) {
                updated[legKey] = null;
            } else {
                updated[legKey] = { optionId, quantity: nextQty };
            }
            return updated;
        });
    };

    const handleMealModalConfirm = () => {
        if (mealTotalQuantity === 0) {
            setMealModalMessage('Vui lòng chọn ít nhất 1 suất ăn.');
            return;
        }
        toggleService('meal', true);
        mealToggleOpenedRef.current = false;
        setMealModalOpen(false);
    };

    const handlePetModalOpen = (openedFromToggle: boolean = false) => {
        petToggleOpenedRef.current = openedFromToggle;
        setPetModalOpen(true);
    };

    const handlePetModalClose = () => {
        setPetModalOpen(false);
        if (petToggleOpenedRef.current) {
            toggleService('pet', false);
        }
        petToggleOpenedRef.current = false;
    };

    const handlePetModalConfirm = () => {
        toggleService('pet', petServiceSelection.enabled);
        petToggleOpenedRef.current = false;
        setPetModalOpen(false);
    };

    const handleInsuranceModalOpen = () => {
        setInsuranceModalOpen(true);
    };

    const handleInsuranceModalClose = () => {
        setInsuranceModalOpen(false);
    };

    const handleInsuranceModalConfirm = () => {
        // Tự động tick chọn dịch vụ
        toggleService('insurance', true);
        setInsuranceModalOpen(false);
    };

    const baggageOptions = [
        { weight: '15kg', price: 150000 },
        { weight: '20kg', price: 200000 },
        { weight: '25kg', price: 250000 },
        { weight: '30kg', price: 300000 },
        { weight: '35kg', price: 350000 },
        { weight: '40kg', price: 400000 }
    ];

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
            case 'pet':
                return (
                    <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.5,12A1.5,1.5 0 0,0 6,13.5A1.5,1.5 0 0,0 4.5,12A1.5,1.5 0 0,0 3,10.5A1.5,1.5 0 0,0 4.5,12M19.5,12A1.5,1.5 0 0,0 21,10.5A1.5,1.5 0 0,0 19.5,9A1.5,1.5 0 0,0 18,10.5A1.5,1.5 0 0,0 19.5,12M12,6A3,3 0 0,1 15,9A3,3 0 0,1 12,12A3,3 0 0,1 9,9A3,3 0 0,1 12,6M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                    </svg>
                );
            case 'meal':
                return (
                    <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11 2a1 1 0 0 1 1 1v7a3 3 0 1 1-2 0V3a1 1 0 0 1 1-1zm6 1h2v9a2 2 0 0 1-1 1.732V22a1 1 0 0 1-2 0v-8.268A2 2 0 0 1 16 12V3h1zM5 3h2v6h1V3h2v9a3 3 0 1 1-6 0V3z" />
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
        // Tính tổng giá ghế đã chọn
        let totalSeatPrice = 0;

        // Tính giá cho từng chặng
        Object.entries(selectedSeatsByLeg).forEach(([legKey, seats]) => {
            seats.forEach(seat => {
                // Lấy hạng vé cho chặng này
                const legClass = legKey === 'departure'
                    ? getTravelClassFromBookingState(state.selectedDeparture, state.selectedReturn, 'departure')
                    : getTravelClassFromBookingState(state.selectedDeparture, state.selectedReturn, 'return');

                const layout = parseLayout(seatLayoutConfig?.[seat.travelClass] || defaultLayouts[seat.travelClass] || '');
                const price = calculateSeatPrice(seat, legClass, layout.length > 0 ? layout : [3, 3, 3]);
                totalSeatPrice += price;

                console.log(`Seat ${seat.seatNumber} on ${legKey}: ${legClass} class, price: ${price}`);
            });
        });

        console.log('Total seat price:', totalSeatPrice);

        setServices(prev =>
            prev.map(service => {
                if (service.id !== 'seat-selection') return service;
                return {
                    ...service,
                    details: seatServiceDetails,
                    price: totalSeatPrice
                };
            })
        );
    }, [seatServiceDetails, selectedSeatsByLeg, seatLayoutConfig, state.selectedDeparture, state.selectedReturn]);

    const mealTotalQuantity = useMemo(() => {
        return Object.values(mealSelections).reduce((total, selection) => total + (selection?.quantity || 0), 0);
    }, [mealSelections]);

    const mealTotalPrice = useMemo(() => {
        return Object.values(mealSelections).reduce((total, selection) => {
            if (!selection) return total;
            const option = getMealOptionById(selection.optionId);
            if (!option) return total;
            return total + option.price * selection.quantity;
        }, 0);
    }, [mealSelections]);

    const mealDetailsByLegText = useMemo(() => {
        return legInfos
            .map(leg => {
                const selection = mealSelections[leg.key];
                if (!selection || selection.quantity === 0) return null;
                const option = getMealOptionById(selection.optionId);
                if (!option) return null;
                return `${leg.label}: ${option.name} x${selection.quantity}`;
            })
            .filter(Boolean)
            .join(' | ');
    }, [legInfos, mealSelections]);

    useEffect(() => {
        setServices(prev =>
            prev.map(service => {
                if (service.id !== 'meal') return service;
                return {
                    ...service,
                    price: mealTotalPrice,
                    details: mealDetailsByLegText || 'Chưa chọn suất ăn'
                };
            })
        );
    }, [mealTotalPrice, mealDetailsByLegText]);

    const petServiceDetails = useMemo(() => {
        if (petServiceSelection.enabled) {
            return `${departureRouteLabel} · Mang theo thú cưng`;
        }
        return 'Chưa đăng ký';
    }, [petServiceSelection, departureRouteLabel]);

    const petServiceCharge = useMemo(() => (petServiceSelection.enabled ? petServiceSelection.price : 0), [petServiceSelection]);

    useEffect(() => {
        setServices(prev =>
            prev.map(service => {
                if (service.id !== 'pet') return service;
                return {
                    ...service,
                    price: petServiceCharge,
                    details: petServiceDetails
                };
            })
        );
    }, [petServiceCharge, petServiceDetails]);

    // Tính toán baggage details và price từ selectedBaggage
    const baggageDetails = useMemo(() => {
        return legInfos
            .map(leg => {
                const baggage = selectedBaggage[leg.key];
                if (!baggage) return null;
                const routeCode = leg.routeLabel.match(/\(([A-Z]+)\)\s*→\s*\(([A-Z]+)\)/);
                const routeLabel = routeCode ? `${routeCode[1]} → ${routeCode[2]}` : (leg.key === 'departure' ? departureRouteLabel : returnRouteLabel);
                return `${routeLabel} Gói ${baggage.weight}`;
            })
            .filter(Boolean)
            .join(', ');
    }, [legInfos, selectedBaggage, departureRouteLabel, returnRouteLabel]);

    // Giá hành lý là giá của chặng đã chọn (không phải tổng sum)
    const baggagePrice = useMemo(() => {
        // Lấy giá của chặng departure (hoặc chặng đầu tiên)
        if (legInfos.length > 0) {
            const firstLeg = legInfos[0];
            const baggage = selectedBaggage[firstLeg.key];
            return baggage?.price || 0;
        }
        return 0;
    }, [legInfos, selectedBaggage]);

    // Cập nhật service baggage khi selectedBaggage thay đổi
    useEffect(() => {
        setServices(prev =>
            prev.map(service => {
                if (service.id !== 'baggage') return service;
                return {
                    ...service,
                    price: baggagePrice,
                    details: baggageDetails || service.details
                };
            })
        );
    }, [baggagePrice, baggageDetails]);

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

    const serviceExtrasPayload = useMemo(() => {
        return {
            passengers: {
                adults: totalAdults,
                children: totalChildren,
                infants: totalInfants
            },
            seats: selectedSeatsByLeg,
            baggage: selectedBaggage,
            meals: mealSelections,
            petService: petServiceSelection,
            services: services
                .filter(service => service.isSelected)
                .map(({ id, name, price, details }) => ({ id, name, price, details }))
        };
    }, [totalAdults, totalChildren, totalInfants, selectedSeatsByLeg, selectedBaggage, mealSelections, petServiceSelection, services]);

    const serviceExtrasString = useMemo(() => JSON.stringify(serviceExtrasPayload), [serviceExtrasPayload]);

    // Effect để update booking total & extras khi calculatedTotal thay đổi
    useEffect(() => {
        if (!bookingId) return;

        requestApi(`bookings/${bookingId}`, 'PUT', {
            totalAmount: calculatedTotal,
            specialRequests: serviceExtrasString
        }).catch(err => {
            console.error('Failed to update booking info:', err);
        });
    }, [calculatedTotal, bookingId, serviceExtrasString]);

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
                        const isBaggageService = service.id === 'baggage';
                        const isMealService = service.id === 'meal';
                        const isPetService = service.id === 'pet';

                        return (
                            <div key={service.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div
                                        className={`flex items-center space-x-4 flex-1 ${(isSeatService || isBaggageService || isMealService || service.id === 'insurance' || isPetService) ? 'cursor-pointer' : ''}`}
                                        onClick={() => {
                                            if (isSeatService) {
                                                handleSeatModalOpen();
                                            } else if (isBaggageService) {
                                                handleBaggageModalOpen();
                                            } else if (service.id === 'insurance') {
                                                handleInsuranceModalOpen();
                                            } else if (isMealService) {
                                                handleMealModalOpen();
                                            } else if (isPetService) {
                                                handlePetModalOpen();
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
                                            {service.details && !(isSeatService && !service.isSelected) && !(isBaggageService && !service.isSelected) && !(isMealService && !service.isSelected) && !(isPetService && !service.isSelected) && (
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
                                                    ) : isBaggageService && service.isSelected && baggageDetails && baggageDetails.trim() !== '' ? (
                                                        <div className="space-y-2">
                                                            <div className="text-xs font-semibold text-gray-500 uppercase">Gói hành lý đã chọn:</div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {legInfos.map(leg => {
                                                                    const baggage = selectedBaggage[leg.key];
                                                                    if (!baggage) return null;
                                                                    const routeCode = leg.routeLabel.match(/\(([A-Z]+)\)\s*→\s*\(([A-Z]+)\)/);
                                                                    const routeLabel = routeCode ? `${routeCode[1]} → ${routeCode[2]}` : (leg.key === 'departure' ? departureRouteLabel : returnRouteLabel);
                                                                    return (
                                                                        <div key={leg.key} className="flex items-center gap-2 flex-wrap">
                                                                            <span className="text-xs font-medium text-gray-600">{leg.label}:</span>
                                                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-sm font-semibold border border-green-200">
                                                                                {routeLabel} Gói {baggage.weight}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ) : isMealService && service.isSelected && mealDetailsByLegText && mealDetailsByLegText.trim() !== '' ? (
                                                        <div className="space-y-2">
                                                            <div className="text-xs font-semibold text-gray-500 uppercase">Suất ăn đã chọn:</div>
                                                            <div className="flex flex-col gap-2">
                                                                {legInfos.map(leg => {
                                                                    const selection = mealSelections[leg.key];
                                                                    if (!selection || selection.quantity === 0) return null;
                                                                    const option = getMealOptionById(selection.optionId);
                                                                    if (!option) return null;
                                                                    return (
                                                                        <div key={leg.key} className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                                                                            <span className="font-semibold text-gray-600">{leg.label}:</span>
                                                                            <span className="px-2 py-1 bg-red-50 text-red-600 rounded-full border border-red-200 font-semibold">
                                                                                {option.name} × {selection.quantity}
                                                                            </span>
                                                                            <span className="text-xs text-gray-500">{formatVnd(option.price)} VND / suất</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ) : isPetService && service.isSelected && petServiceSelection.enabled ? (
                                                        <div className="space-y-2 text-sm text-gray-700">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-semibold text-gray-600">Gói thú cưng</span>
                                                                <span>Mang thú cưng lên khoang hành khách theo quy định Vietjet.</span>
                                                                <span className="text-xs text-gray-500">Chi phí: {formatVnd(petServiceSelection.price)} VND</span>
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
                                                if (isBaggageService) {
                                                    const nextState = !service.isSelected;
                                                    toggleService(service.id, nextState);
                                                    if (nextState) {
                                                        handleBaggageModalOpen(true);
                                                    } else {
                                                        baggageToggleOpenedRef.current = false;
                                                    }
                                                    return;
                                                }
                                                if (isMealService) {
                                                    const nextState = !service.isSelected;
                                                    toggleService(service.id, nextState);
                                                    if (nextState) {
                                                        handleMealModalOpen(true);
                                                    } else {
                                                        mealToggleOpenedRef.current = false;
                                                    }
                                                    return;
                                                }
                                                if (isPetService) {
                                                    const nextState = !service.isSelected;
                                                    toggleService(service.id, nextState);
                                                    if (nextState) {
                                                        handlePetModalOpen(true);
                                                    } else {
                                                        petToggleOpenedRef.current = false;
                                                        setPetServiceSelection(prev => ({ ...prev, enabled: false }));
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
                                                } else if (isBaggageService) {
                                                    handleBaggageModalOpen();
                                                } else if (service.id === 'insurance') {
                                                    handleInsuranceModalOpen();
                                                } else if (isMealService) {
                                                    handleMealModalOpen();
                                                } else if (isPetService) {
                                                    handlePetModalOpen();
                                                } else {
                                                    toggleSection(service.id);
                                                }
                                            }}
                                            className={`p-1 rounded ${(isSeatService || isBaggageService || service.id === 'insurance' || isMealService || isPetService) ? 'bg-white hover:bg-blue-50 text-blue-500' : 'hover:bg-gray-100 text-gray-500'}`}
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
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                                        Hạng {allowedTravelClass}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {allowedTravelClass === 'First' ? 'Miễn phí chọn ghế' :
                                            allowedTravelClass === 'Business' ? 'Từ 80,000đ' : 'Từ 80,000đ'}
                                    </span>
                                </div>
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

                                                                                    const seatLayout = parseLayout(seatLayoutConfig?.[seat.travelClass] || defaultLayouts[seat.travelClass] || '');
                                                                                    const seatPrice = calculateSeatPrice(seat, allowedTravelClass, seatLayout.length > 0 ? seatLayout : [3, 3, 3]);
                                                                                    const seatPosition = getSeatPosition(seat, seatLayout.length > 0 ? seatLayout : [3, 3, 3]);

                                                                                    let tooltipText = '';
                                                                                    if (seat.travelClass !== allowedTravelClass) {
                                                                                        tooltipText = `Bạn chỉ có thể chọn hạng ${allowedTravelClass}`;
                                                                                    } else if (seat.isOccupied) {
                                                                                        tooltipText = `Ghế ${seat.seatNumber} đã có người`;
                                                                                    } else {
                                                                                        const positionText = seatPosition === 'window' ? 'Cửa sổ' : seatPosition === 'aisle' ? 'Lối đi' : 'Giữa';
                                                                                        const priceText = seatPrice === 0 ? 'Miễn phí' : `${new Intl.NumberFormat('vi-VN').format(seatPrice)}đ`;
                                                                                        tooltipText = `${positionText} ${priceText}`;
                                                                                    }

                                                                                    return (
                                                                                        <button
                                                                                            key={seat.id}
                                                                                            type="button"
                                                                                            onClick={() => updateSeatSelection(seat.id)}
                                                                                            disabled={seat.isOccupied || seat.travelClass !== allowedTravelClass}
                                                                                            className={`plane-seat w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 text-xs sm:text-sm font-semibold flex items-center justify-center transition-all ${seat.travelClass !== allowedTravelClass
                                                                                                ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                                                                                : getSeatVisualClass(seat)
                                                                                                } ${seat.isSelected ? 'plane-seat--selected' : ''} hover:scale-105 relative group`}
                                                                                            title={tooltipText}
                                                                                        >
                                                                                            {seat.column}
                                                                                            {/* Tooltip hiển thị khi hover */}
                                                                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-black text-white text-sm font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 pointer-events-none shadow-lg scale-95 group-hover:scale-100">
                                                                                                {tooltipText}
                                                                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-black"></div>
                                                                                            </div>
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
                                    <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">Thông tin vé</h4>
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
                                        <div className="text-sm font-semibold text-blue-800 mb-1">Hạng vé hiện tại</div>
                                        <div className="text-lg font-bold text-blue-900">{allowedTravelClass}</div>
                                        <div className="text-xs text-blue-600 mt-1">
                                            {allowedTravelClass === 'First' ? 'Miễn phí chọn ghế' :
                                                allowedTravelClass === 'Business' ? 'Giá ghế từ 80,000 VNĐ' :
                                                    'Giá ghế từ 80,000 VNĐ'}
                                        </div>
                                        {allowedTravelClass !== 'First' && (
                                            <div className="text-xs text-blue-500 mt-2 pt-2 border-t border-blue-200">
                                                • Ghế cửa sổ: 100,000đ<br />
                                                • Ghế giữa: 80,000đ<br />
                                                • Ghế lối đi: 100,000đ
                                            </div>
                                        )}
                                    </div>
                                </div>



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
                                        <div className="flex items-center gap-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                                            <span className="w-4 h-4 rounded bg-gray-200 border border-gray-400 block"></span>
                                            <span>Ghế không được phép chọn</span>
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
                            <div className="text-sm text-gray-600 mr-auto">
                                Hạng vé: <span className="font-semibold text-blue-600">{allowedTravelClass}</span>
                                {currentSelectedSeats.length > 0 && (
                                    <span className="ml-4">
                                        Đã chọn: <span className="font-semibold">{currentSelectedSeats.length}</span> ghế
                                    </span>
                                )}
                            </div>
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

            {/* Baggage Modal */}
            {isBaggageModalOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[98vh] flex flex-col">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 flex-shrink-0 sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Chọn hành lý/Dịch vụ nối chuyến</h3>
                                <p className="text-sm text-gray-500 mt-1">Hãy lựa chọn gói hành lý phù hợp cho chuyến bay của bạn</p>
                            </div>
                            <button onClick={handleBaggageModalClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="px-6 py-6 overflow-y-auto flex-1">
                            <div className="space-y-6">
                                {legInfos.map((leg) => {
                                    const currentBaggage = selectedBaggage[leg.key] || { weight: '20kg', price: 200000 };
                                    return (
                                        <div key={leg.key} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                            <div className="mb-4">
                                                <h4 className="text-lg font-bold text-gray-900">{leg.label}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{leg.routeLabel}</p>
                                                {leg.dateLabel && (
                                                    <p className="text-xs text-gray-500 mt-1">{leg.dateLabel}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {baggageOptions.map((option) => {
                                                    const isSelected = currentBaggage.weight === option.weight;
                                                    return (
                                                        <button
                                                            key={option.weight}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedBaggage(prev => ({
                                                                    ...prev,
                                                                    [leg.key]: { weight: option.weight, price: option.price }
                                                                }));
                                                            }}
                                                            className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                                                ? 'border-blue-600 bg-blue-50 shadow-md'
                                                                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                                                                }`}
                                                        >
                                                            <div className="font-semibold text-gray-900 mb-1">{option.weight}</div>
                                                            <div className="text-sm font-bold text-blue-600">{formatVnd(option.price)} VND</div>
                                                            {isSelected && (
                                                                <div className="mt-2 flex items-center text-blue-600 text-xs">
                                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                    Đã chọn
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-gray-700">Gói đã chọn:</span>
                                                    <span className="text-lg font-bold text-blue-600">{currentBaggage.weight} - {formatVnd(currentBaggage.price)} VND</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0">
                            <button
                                type="button"
                                onClick={handleBaggageModalClose}
                                className="px-5 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-white transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleBaggageModalConfirm}
                                className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Meal Modal */}
            {isMealModalOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[98vh] flex flex-col">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 flex-shrink-0 sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Chọn suất ăn Jet Café</h3>
                                <p className="text-sm text-gray-500 mt-1">Áp dụng cho tối đa {mealSelectionLimit} hành khách người lớn & trẻ em</p>
                            </div>
                            <button onClick={handleMealModalClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {legInfos.length > 1 && (
                            <div className="px-6 pt-4 pb-2 border-b border-gray-100 flex flex-wrap gap-3 flex-shrink-0">
                                {legInfos.map(leg => {
                                    const isActive = leg.key === mealActiveLegKey;
                                    return (
                                        <button
                                            key={leg.key}
                                            onClick={() => setMealActiveLegKey(leg.key)}
                                            className={`px-4 py-2 rounded-2xl border text-sm font-semibold transition ${isActive ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600'}`}
                                        >
                                            <div>{leg.label}</div>
                                            <div className="text-xs font-normal text-gray-500">{leg.routeLabel}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="px-6 py-6 overflow-y-auto flex-1 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mealOptions.map(option => {
                                    const currentSelection = mealSelections[mealActiveLegKey];
                                    const isActiveOption = currentSelection?.optionId === option.id;
                                    const quantity = isActiveOption ? currentSelection?.quantity || 0 : 0;
                                    return (
                                        <div
                                            key={option.id}
                                            className={`border-2 rounded-2xl p-4 transition-all ${isActiveOption ? 'border-red-500 bg-red-50 shadow-md' : 'border-gray-200 bg-white hover:border-red-300'}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex-1">
                                                    <h4 className="text-lg font-semibold text-gray-900">{option.name}</h4>
                                                    <p className="text-sm text-gray-600 mt-2">{option.description}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="text-lg font-bold text-red-600">{formatVnd(option.price)} VND</div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => adjustMealQuantity(mealActiveLegKey, option.id, -1)}
                                                        className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-10 text-center font-semibold">{quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => adjustMealQuantity(mealActiveLegKey, option.id, 1)}
                                                        className="w-8 h-8 rounded-full bg-red-600 text-white font-bold hover:bg-red-700"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex flex-col gap-2 text-sm text-yellow-800">
                                <span className="font-semibold text-yellow-900">Lưu ý</span>
                                <span>Mỗi suất ăn áp dụng cho một hành khách người lớn hoặc trẻ em. Vui lòng hoàn tất chọn suất ăn trước khi thanh toán để đảm bảo còn hàng.</span>
                            </div>

                            {mealModalMessage && <p className="text-sm text-red-600">{mealModalMessage}</p>}
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0">
                            <div className="text-sm text-gray-600">
                                Đã chọn <span className="font-semibold text-gray-900">{mealTotalQuantity}</span> / {mealSelectionLimit} suất ăn · Tổng tạm tính{' '}
                                <span className="font-semibold text-red-600">{formatVnd(mealTotalPrice)} VND</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleMealModalClose}
                                    className="px-5 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-white transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={handleMealModalConfirm}
                                    className="px-5 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pet Modal */}
            {isPetModalOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[98vh] flex flex-col">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 flex-shrink-0 sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Mang theo thú cưng</h3>
                                <p className="text-sm text-gray-500 mt-1">Dành cho hành khách cần mang chó/mèo trên chuyến bay</p>
                            </div>
                            <button onClick={handlePetModalClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="px-6 py-6 overflow-y-auto flex-1 space-y-6">
                            <div className="bg-gradient-to-r from-pink-50 to-orange-50 border border-orange-200 rounded-2xl p-5 text-sm text-gray-700 space-y-2">
                                <p>Vietjet cung cấp dịch vụ vận chuyển thú cưng (động vật cảnh) dành cho hành khách có nhu cầu du lịch cùng thú cưng. Hành khách cần chuẩn bị đầy đủ giấy tờ tiêm phòng, sức khỏe và lồng vận chuyển theo quy định.</p>
                                <a className="text-red-600 font-semibold text-sm" href="https://www.vietjetair.com" target="_blank" rel="noreferrer">
                                    Chi tiết xem tại đây
                                </a>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-3 border border-green-200 rounded-2xl p-4 cursor-pointer hover:bg-green-50">
                                    <input
                                        type="radio"
                                        name="pet-service"
                                        checked={petServiceSelection.enabled}
                                        onChange={() => setPetServiceSelection(prev => ({ ...prev, enabled: true }))}
                                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                                    />
                                    <div>
                                        <p className="text-base font-semibold text-gray-900">Mang theo thú cưng</p>
                                        <p className="text-sm text-gray-600 mt-1">Phí dịch vụ: {formatVnd(petServiceSelection.price)} VND</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 border border-gray-200 rounded-2xl p-4 cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="pet-service"
                                        checked={!petServiceSelection.enabled}
                                        onChange={() => setPetServiceSelection(prev => ({ ...prev, enabled: false }))}
                                        className="w-4 h-4 text-gray-600 focus:ring-gray-500"
                                    />
                                    <div>
                                        <p className="text-base font-semibold text-gray-900">Không, cảm ơn</p>
                                        <p className="text-sm text-gray-600 mt-1">Tôi không mang thú cưng trên chuyến bay</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0">
                            <button
                                type="button"
                                onClick={handlePetModalClose}
                                className="px-5 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-white transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handlePetModalConfirm}
                                className="px-5 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Insurance Modal */}
            {isInsuranceModalOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[98vh] flex flex-col">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 flex-shrink-0 sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Bảo hiểm du lịch FlyGo Travel Safe</h3>
                                <p className="text-sm text-gray-500 mt-1">Bảo vệ bạn trong suốt chuyến bay</p>
                            </div>
                            <button onClick={handleInsuranceModalClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="px-6 py-6 overflow-y-auto flex-1">
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V16H8V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-gray-900 mb-2">Quyền lợi bảo hiểm</h4>
                                            <ul className="space-y-2 text-sm text-gray-700">
                                                <li className="flex items-start">
                                                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Bảo hiểm tử vong và thương tật do tai nạn: Tối đa 1 tỷ VND</span>
                                                </li>
                                                <li className="flex items-start">
                                                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Chi phí y tế: Tối đa 50 triệu VND</span>
                                                </li>
                                                <li className="flex items-start">
                                                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Bảo hiểm hành lý: Tối đa 10 triệu VND</span>
                                                </li>
                                                <li className="flex items-start">
                                                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Hoãn/hủy chuyến bay: Lên đến giá trị vé</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                    <div className="flex items-start space-x-3">
                                        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-yellow-800 mb-1">Lưu ý quan trọng</p>
                                            <p className="text-sm text-yellow-700">
                                                Giấy chứng nhận bảo hiểm sẽ được cấp cùng vé máy bay, và không thể cấp lại sau chuyến bay. Vui lòng lưu giữ cẩn thận.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-semibold text-gray-900">Phí bảo hiểm:</span>
                                        <span className="text-2xl font-bold text-blue-600">{formatVnd(160000)} VND</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0">
                            <button
                                type="button"
                                onClick={handleInsuranceModalClose}
                                className="px-5 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-white transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleInsuranceModalConfirm}
                                className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
