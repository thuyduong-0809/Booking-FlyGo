import { requestApi } from "@/lib/api";

export interface SearchFlightsParams {
    departureAirportCode?: string;
    arrivalAirportCode?: string;
    departureDate?: string;
    minDepartureTime?: string; // Thời gian khởi hành tối thiểu (ISO string) - dùng để filter chuyến về sau thời gian đến của chuyến đi
    [key: string]: any;
}

export interface Flight {
    flightId: number;
    flightNumber: string;
    airline: any;
    departureAirport: any;
    arrivalAirport: any;
    departureTime: string;
    arrivalTime: string;
    duration: number;
    status: string;
    economyPrice: number;
    businessPrice: number;
    firstClassPrice: number;
    availableEconomySeats: number;
    availableBusinessSeats: number;
    availableFirstClassSeats: number;
    [key: string]: any;
}

export interface FlightResponse {
    success: boolean;
    message: string;
    data: Flight[];
}

export const flightsService = {
    // Lấy danh sách tất cả flights
    getAllFlights: async (): Promise<FlightResponse> => {
        return await requestApi("flights", "GET");
    },

    // Lấy flight theo ID
    getFlightById: async (id: number): Promise<FlightResponse> => {
        return await requestApi(`flights/${id}`, "GET");
    },

    // Search flights với các tham số tùy chọn
    searchFlights: async (params: SearchFlightsParams): Promise<FlightResponse> => {
        // Tạo query string từ params
        const queryParams = new URLSearchParams();

        if (params.departureAirportCode) {
            queryParams.append('departureAirportCode', params.departureAirportCode);
        }
        if (params.arrivalAirportCode) {
            queryParams.append('arrivalAirportCode', params.arrivalAirportCode);
        }
        if (params.departureDate) {
            queryParams.append('departureDate', params.departureDate);
        }
        if (params.minDepartureTime) {
            queryParams.append('minDepartureTime', params.minDepartureTime);
        }

        const queryString = queryParams.toString();
        const url = queryString ? `flights/search?${queryString}` : "flights";

        const response = await requestApi(url, "GET");

        return response;
    },
};
