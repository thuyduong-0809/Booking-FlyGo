import { requestApi } from "@/lib/api";

export interface CreateBookingFlightData {
  bookingId: number;
  flightId: number;
  travelClass: 'Economy' | 'Business' | 'First';
  baggageAllowance?: number;
  seatNumber?: string;
  passengerId?: number;
}

export interface BookingFlight {
  bookingFlightId: number;
  bookingId: number;
  flightId: number;
  travelClass: string;
  fare: number;
  seatNumber: string | null;
  baggageAllowance: number;
}

export const bookingFlightsService = {
  // Tạo booking flight
  create: async (data: CreateBookingFlightData): Promise<BookingFlight> => {
    const response = await requestApi("booking-flights", "POST", data);
    return response?.data || response;
  },

  // Lấy tất cả booking flights theo bookingId
  getByBookingId: async (bookingId: number): Promise<BookingFlight[]> => {
    const response = await requestApi(`booking-flights/booking/${bookingId}`, "GET");
    return response?.data || response;
  },

  // Xóa booking flight
  delete: async (bookingFlightId: number): Promise<any> => {
    const response = await requestApi(`booking-flights/${bookingFlightId}`, "DELETE");
    return response?.data || response;
  },

  // Tự động cập nhật booking flights với seatNumber
  autoUpdate: async (bookingId: number, flights?: Array<{ flightId: number, travelClass: string }>): Promise<any> => {
    const response = await requestApi(`booking-flights/auto-update/${bookingId}`, "POST", { flights });
    return response?.data || response;
  },
};

