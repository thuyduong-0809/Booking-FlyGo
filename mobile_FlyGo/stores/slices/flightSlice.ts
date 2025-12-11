import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
}

interface Airline {
  id: string;
  code: string;
  name: string;
  logo?: string;
}

interface Flight {
  id: string;
  flightNumber: string;
  airline: Airline;
  departure: {
    airport: Airport;
    time: string;
    date: string;
  };
  arrival: {
    airport: Airport;
    time: string;
    date: string;
  };
  duration: string;
  aircraft: string;
  price: {
    economy: number;
    business: number;
    first: number;
  };
  availableSeats: {
    economy: number;
    business: number;
    first: number;
  };
  stops: number;
  status: string;
}

interface SearchParams {
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  class: 'economy' | 'business' | 'first';
  tripType: 'one-way' | 'round-trip';
}

interface FlightState {
  searchParams: SearchParams | null;
  searchResults: Flight[];
  selectedOutboundFlight: Flight | null;
  selectedReturnFlight: Flight | null;
  airports: Airport[];
  airlines: Airline[];
  isLoading: boolean;
  error: string | null;
  filters: {
    priceRange: [number, number];
    airlines: string[];
    stops: number[];
    departureTime: string[];
    duration: [number, number];
  };
}

const initialState: FlightState = {
  searchParams: null,
  searchResults: [],
  selectedOutboundFlight: null,
  selectedReturnFlight: null,
  airports: [],
  airlines: [],
  isLoading: false,
  error: null,
  filters: {
    priceRange: [0, 10000000],
    airlines: [],
    stops: [],
    departureTime: [],
    duration: [0, 24],
  },
};

const flightSlice = createSlice({
  name: 'flights',
  initialState,
  reducers: {
    setSearchParams: (state, action: PayloadAction<SearchParams>) => {
      state.searchParams = action.payload;
    },
    searchFlightsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    searchFlightsSuccess: (state, action: PayloadAction<Flight[]>) => {
      state.isLoading = false;
      state.searchResults = action.payload;
      state.error = null;
    },
    searchFlightsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    selectOutboundFlight: (state, action: PayloadAction<Flight>) => {
      state.selectedOutboundFlight = action.payload;
    },
    selectReturnFlight: (state, action: PayloadAction<Flight>) => {
      state.selectedReturnFlight = action.payload;
    },
    clearSelectedFlights: (state) => {
      state.selectedOutboundFlight = null;
      state.selectedReturnFlight = null;
    },
    setAirports: (state, action: PayloadAction<Airport[]>) => {
      state.airports = action.payload;
    },
    setAirlines: (state, action: PayloadAction<Airline[]>) => {
      state.airlines = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<FlightState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setSearchParams,
  searchFlightsStart,
  searchFlightsSuccess,
  searchFlightsFailure,
  selectOutboundFlight,
  selectReturnFlight,
  clearSelectedFlights,
  setAirports,
  setAirlines,
  updateFilters,
  clearFilters,
  clearError,
} = flightSlice.actions;

export default flightSlice.reducer;