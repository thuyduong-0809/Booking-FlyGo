"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type FareClassName = "Business" | "SkyBoss" | "Deluxe" | "Eco";

export interface SelectedFare {
  flightId: string;
  fareIndex: number;
  fareName: FareClassName | string;
  price: number;
  tax: number;
  service: number;
  code?: string;
  departTime?: string;
  arriveTime?: string;
}

export interface BookingState {
  tripType: "round" | "oneway";
  origin: string;
  destination: string;
  passengers: number;
  departureDate?: string; // ISO yyyy-mm-dd
  returnDate?: string; // ISO
  selectedDeparture?: SelectedFare;
  selectedReturn?: SelectedFare;
}

const initialState: BookingState = {
  tripType: "round",
  origin: "HAN",
  destination: "VCA",
  passengers: 2,
};

interface BookingContextValue {
  state: BookingState;
  setPassengers: (num: number) => void;
  setRoute: (from: string, to: string) => void;
  setDates: (departureISO?: string, returnISO?: string) => void;
  setSelectedDeparture: (fare: SelectedFare | undefined) => void;
  setSelectedReturn: (fare: SelectedFare | undefined) => void;
  grandTotal: number;
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingState>(initialState);

  const setPassengers = useCallback((num: number) => {
    setState(prev => ({ ...prev, passengers: Math.max(1, Math.floor(num)) }));
  }, []);

  const setRoute = useCallback((from: string, to: string) => {
    setState(prev => ({ ...prev, origin: from, destination: to }));
  }, []);

  const setDates = useCallback((departureISO?: string, returnISO?: string) => {
    setState(prev => ({ ...prev, departureDate: departureISO, returnDate: returnISO }));
  }, []);

  const setSelectedDeparture = useCallback((fare: SelectedFare | undefined) => {
    setState(prev => ({ ...prev, selectedDeparture: fare }));
  }, []);

  const setSelectedReturn = useCallback((fare: SelectedFare | undefined) => {
    setState(prev => ({ ...prev, selectedReturn: fare }));
  }, []);

  const grandTotal = useMemo(() => {
    const dep = state.selectedDeparture ? (state.selectedDeparture.price + state.selectedDeparture.tax + state.selectedDeparture.service) : 0;
    const ret = state.selectedReturn ? (state.selectedReturn.price + state.selectedReturn.tax + state.selectedReturn.service) : 0;
    return (dep + ret) * state.passengers;
  }, [state.selectedDeparture, state.selectedReturn, state.passengers]);

  const value: BookingContextValue = useMemo(() => ({
    state,
    setPassengers,
    setRoute,
    setDates,
    setSelectedDeparture,
    setSelectedReturn,
    grandTotal,
  }), [state, setPassengers, setRoute, setDates, setSelectedDeparture, setSelectedReturn, grandTotal]);

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}


