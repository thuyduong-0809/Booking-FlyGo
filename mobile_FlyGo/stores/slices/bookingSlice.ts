import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Passenger {
  id?: string;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string;
  type: 'adult' | 'child' | 'infant';
  seat?: {
    flightId: string;
    seatNumber: string;
    price: number;
  };
}

interface BookingFlight {
  id: string;
  flightNumber: string;
  departure: {
    airport: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    time: string;
    date: string;
  };
  seats: {
    seatNumber: string;
    class: string;
    price: number;
  }[];
}

interface Booking {
  id?: string;
  bookingReference?: string;
  status: 'draft' | 'confirmed' | 'cancelled' | 'completed';
  flights: {
    outbound: BookingFlight;
    return?: BookingFlight;
  };
  passengers: Passenger[];
  contactInfo: {
    email: string;
    phone: string;
  };
  payment: {
    method: string;
    status: 'pending' | 'completed' | 'failed';
    totalAmount: number;
    currency: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface BookingState {
  currentBooking: Booking | null;
  bookingHistory: Booking[];
  isLoading: boolean;
  error: string | null;
  step: 'flights' | 'passengers' | 'seats' | 'payment' | 'confirmation';
}

const initialState: BookingState = {
  currentBooking: null,
  bookingHistory: [],
  isLoading: false,
  error: null,
  step: 'flights',
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    initializeBooking: (state, action: PayloadAction<{ outbound: BookingFlight; return?: BookingFlight }>) => {
      state.currentBooking = {
        status: 'draft',
        flights: action.payload,
        passengers: [],
        contactInfo: {
          email: '',
          phone: '',
        },
        payment: {
          method: '',
          status: 'pending',
          totalAmount: 0,
          currency: 'VND',
        },
      };
      state.step = 'passengers';
    },
    updatePassengers: (state, action: PayloadAction<Passenger[]>) => {
      if (state.currentBooking) {
        state.currentBooking.passengers = action.payload;
      }
    },
    updateContactInfo: (state, action: PayloadAction<{ email: string; phone: string }>) => {
      if (state.currentBooking) {
        state.currentBooking.contactInfo = action.payload;
      }
    },
    updateSeatSelection: (state, action: PayloadAction<{ passengerId: string; seat: Passenger['seat'] }>) => {
      if (state.currentBooking) {
        const passenger = state.currentBooking.passengers.find(p => p.id === action.payload.passengerId);
        if (passenger) {
          passenger.seat = action.payload.seat;
        }
      }
    },
    updatePayment: (state, action: PayloadAction<Partial<Booking['payment']>>) => {
      if (state.currentBooking) {
        state.currentBooking.payment = { ...state.currentBooking.payment, ...action.payload };
      }
    },
    setBookingStep: (state, action: PayloadAction<BookingState['step']>) => {
      state.step = action.payload;
    },
    confirmBooking: (state, action: PayloadAction<{ id: string; bookingReference: string }>) => {
      if (state.currentBooking) {
        state.currentBooking.id = action.payload.id;
        state.currentBooking.bookingReference = action.payload.bookingReference;
        state.currentBooking.status = 'confirmed';
        state.currentBooking.createdAt = new Date().toISOString();
        state.bookingHistory.unshift({ ...state.currentBooking });
      }
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
      state.step = 'flights';
    },
    setBookingHistory: (state, action: PayloadAction<Booking[]>) => {
      state.bookingHistory = action.payload;
    },
    updateBookingStatus: (state, action: PayloadAction<{ bookingId: string; status: Booking['status'] }>) => {
      const booking = state.bookingHistory.find(b => b.id === action.payload.bookingId);
      if (booking) {
        booking.status = action.payload.status;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  initializeBooking,
  updatePassengers,
  updateContactInfo,
  updateSeatSelection,
  updatePayment,
  setBookingStep,
  confirmBooking,
  clearCurrentBooking,
  setBookingHistory,
  updateBookingStatus,
  setLoading,
  setError,
} = bookingSlice.actions;

export default bookingSlice.reducer;