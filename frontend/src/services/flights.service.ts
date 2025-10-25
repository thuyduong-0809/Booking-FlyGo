import { requestApi } from "@/lib/api";

export interface SearchFlightsParams {
    departureAirportCode?: string;
    arrivalAirportCode?: string;
    departureDate?: string;
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
        // Lấy tất cả flights trước
        const response = await requestApi("flights", "GET");

        if (response.success && response.data) {
            let filteredFlights = response.data;

            // Lọc theo departureAirportCode
            if (params.departureAirportCode) {
                filteredFlights = filteredFlights.filter((flight: Flight) =>
                    flight.departureAirport?.airportCode === params.departureAirportCode
                );
            }

            // Lọc theo arrivalAirportCode
            if (params.arrivalAirportCode) {
                filteredFlights = filteredFlights.filter((flight: Flight) =>
                    flight.arrivalAirport?.airportCode === params.arrivalAirportCode
                );
            }

            // Lọc theo departureDate
            if (params.departureDate) {
                filteredFlights = filteredFlights.filter((flight: Flight) => {
                    const flightDate = new Date(flight.departureTime).toISOString().split('T')[0];
                    return flightDate === params.departureDate;
                });
            }

            return {
                ...response,
                data: filteredFlights,
            };
        }

        return response;
    },
};
