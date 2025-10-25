import { requestApi } from "@/lib/api";

export interface Airport {
    airportId: number;
    airportCode: string;
    airportName: string;
    city: string;
    country: string;
    timezone: string;
    latitude: number;
    longitude: number;
}

export interface AirportResponse {
    success: boolean;
    message: string;
    data: Airport[];
}

export const airportsService = {
    // Lấy danh sách tất cả airports
    getAllAirports: async (): Promise<AirportResponse> => {
        return await requestApi("airports", "GET");
    },

    // Lấy airports theo city
    getAirportsByCity: async (city: string): Promise<AirportResponse> => {
        const response = await requestApi("airports", "GET");
        if (response.success && response.data) {
            const filteredAirports = response.data.filter((airport: Airport) =>
                airport.city.toLowerCase().includes(city.toLowerCase())
            );
            return {
                ...response,
                data: filteredAirports,
            };
        }
        return response;
    },

    // Tìm kiếm airports theo từ khóa
    searchAirports: async (searchTerm: string): Promise<AirportResponse> => {
        const response = await requestApi("airports", "GET");
        if (response.success && response.data) {
            const filteredAirports = response.data.filter((airport: Airport) =>
                airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                airport.airportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                airport.airportCode.toLowerCase().includes(searchTerm.toLowerCase())
            );
            return {
                ...response,
                data: filteredAirports,
            };
        }
        return response;
    },
};
