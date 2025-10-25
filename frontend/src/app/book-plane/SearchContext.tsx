"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
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
    const [searchData, setSearchData] = useState<SearchData>({
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
