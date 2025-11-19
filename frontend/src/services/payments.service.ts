import { requestApi } from "@/lib/api";

export interface MoMoPaymentRequest {
    amount: number;
    bookingId: number;
    orderInfo?: string;
    redirectUrl: string;
    ipnUrl: string;
}

export interface MoMoPaymentResponse {
    paymentId: number;
    payUrl: string;
    deepLink?: string;
    qrCodeUrl?: string;
    orderId: string;
    requestId: string;
    message?: string;
}

export interface PaymentStatus {
    paymentId: number;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
    transactionId?: string;
    paidAt?: Date;
}

export interface Payment {
    paymentId: number;
    amount: number;
    paymentMethod: string;
    paymentStatus: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
    transactionId?: string;
    paymentDetails?: any;
    paidAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    booking?: any;
}

export const paymentsService = {
    // Tạo thanh toán MoMo
    createMoMoPayment: async (data: MoMoPaymentRequest): Promise<MoMoPaymentResponse> => {
        const response = await requestApi("payments/momo/create", "POST", data);
        // response có thể là { data: {...} } hoặc trực tiếp {...}
        return response?.data || response;
    },

    // Lấy thông tin payment theo ID
    getPaymentById: async (id: number): Promise<Payment> => {
        const response = await requestApi(`payments/${id}`, "GET");
        return response.data;
    },

    // Lấy tất cả payments theo bookingId
    getPaymentsByBooking: async (bookingId: number): Promise<Payment[]> => {
        try {
            const response = await requestApi(`payments/booking/${bookingId}`, "GET");
            return response?.data || response;
        } catch (error) {
            throw error;
        }
    },

    // Cập nhật trạng thái payment
    updatePaymentStatus: async (
        paymentId: number,
        status: string,
        transactionId?: string
    ): Promise<Payment> => {
        try {
            const response = await requestApi(
                `payments/${paymentId}/status`,
                "PUT",
                { status, transactionId }
            );
            return response?.data || response;
        } catch (error) {
            throw error;
        }
    },

    // Lấy bookingId từ MoMo orderId
    getBookingByOrderId: async (orderId: string): Promise<number | null> => {
        try {
            const response = await requestApi(`payments/momo/get-booking/${orderId}`, "GET");
            return response?.bookingId || null;
        } catch (error) {
            return null;
        }
    },
};

