"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Airport } from '../../services/airports.service';

export interface SearchData {
    departureAirport: Airport | null;
    arrivalAirport: Airport | null;
    departureDate: Date | null;
    returnDate: Date | null;
    tripType: 'roundTrip' | 'oneWay';
    passengers: {
        adults: number;
        children: number;
        infants: number;
    };
}

interface SearchContextType {
    searchData: SearchData;
    setSearchData: (data: SearchData) => void;
    updateDepartureAirport: (airport: Airport | null) => void;
    updateArrivalAirport: (airport: Airport | null) => void;
    updateDepartureDate: (date: Date | null) => void;
    updateReturnDate: (date: Date | null) => void;
    updateTripType: (type: 'roundTrip' | 'oneWay') => void;
    updatePassengers: (passengers: { adults: number; children: number; infants: number }) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};

interface SearchProviderProps {
    children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
    // Khởi tạo state từ localStorage nếu có
    const [searchData, setSearchData] = useState<SearchData>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('searchData');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Parse dates từ string về Date object
                    if (parsed.departureDate) {
                        parsed.departureDate = new Date(parsed.departureDate);
                    }
                    if (parsed.returnDate) {
                        parsed.returnDate = new Date(parsed.returnDate);
                    }
                    return parsed;
                } catch (error) {
                    console.error('Error parsing searchData from localStorage:', error);
                }
            }
        }
        return {
            departureAirport: null,
            arrivalAirport: null,
            departureDate: null,
            returnDate: null,
            tripType: 'roundTrip',
            passengers: {
                adults: 1,
                children: 0,
                infants: 0,
            },
        };
    });

    const updateDepartureAirport = (airport: Airport | null) => {
        setSearchData(prev => ({ ...prev, departureAirport: airport }));
    };

    const updateArrivalAirport = (airport: Airport | null) => {
        setSearchData(prev => ({ ...prev, arrivalAirport: airport }));
    };

    const updateDepartureDate = (date: Date | null) => {
        setSearchData(prev => ({ ...prev, departureDate: date }));
    };

    const updateReturnDate = (date: Date | null) => {
        setSearchData(prev => ({ ...prev, returnDate: date }));
    };

    const updateTripType = (type: 'roundTrip' | 'oneWay') => {
        setSearchData(prev => ({ ...prev, tripType: type }));
    };

    const updatePassengers = (passengers: { adults: number; children: number; infants: number }) => {
        setSearchData(prev => ({ ...prev, passengers }));
    };

    // Lưu searchData vào localStorage mỗi khi thay đổi
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('searchData', JSON.stringify(searchData));
                // Lưu riêng passengerCounts để dễ truy cập
                if (searchData.passengers) {
                    localStorage.setItem('passengerCounts', JSON.stringify({
                        adults: searchData.passengers.adults,
                        children: searchData.passengers.children,
                        infants: searchData.passengers.infants
                    }));
                }
            } catch (error) {
                console.error('Error saving searchData to localStorage:', error);
            }
        }
    }, [searchData]);

    return (
        <SearchContext.Provider value={{
            searchData,
            setSearchData,
            updateDepartureAirport,
            updateArrivalAirport,
            updateDepartureDate,
            updateReturnDate,
            updateTripType,
            updatePassengers,
        }}>
            {children}
        </SearchContext.Provider>
    );
};
