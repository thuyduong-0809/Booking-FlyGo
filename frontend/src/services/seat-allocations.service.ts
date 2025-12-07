import { requestApi } from "@/lib/api";

export interface CreateSeatAllocationData {
    bookingFlightId: number;
    flightSeatId: number;
    passengerId: number;
}

export interface SeatAllocation {
    allocationId: number;
    bookingFlightId: number;
    flightSeatId: number;
    passengerId: number;
}

export const seatAllocationsService = {
    // Tạo seat allocation
    create: async (data: CreateSeatAllocationData): Promise<any> => {
        const response = await requestApi("seat-allocations", "POST", data);
        return response?.data || response;
    },

    // Lấy tất cả seat allocations
    getAll: async (): Promise<SeatAllocation[]> => {
        const response = await requestApi("seat-allocations", "GET");
        return response?.data || response;
    },
};

