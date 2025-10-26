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
            console.log('📦 getPaymentsByBooking response:', response);
            // Response từ NestJS có format { success, data, message }
            return response?.data || response;
        } catch (error) {
            console.error('❌ getPaymentsByBooking error:', error);
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
            console.log(`🔄 Updating payment ${paymentId} to status: ${status}`);
            const response = await requestApi(
                `payments/${paymentId}/status`,
                "PUT",
                { status, transactionId }
            );
            console.log('✅ Update response:', response);
            return response?.data || response;
        } catch (error) {
            console.error('❌ updatePaymentStatus error:', error);
            throw error;
        }
    },

    // Lấy bookingId từ MoMo orderId
    getBookingByOrderId: async (orderId: string): Promise<number | null> => {
        try {
            console.log('🔍 Getting bookingId for orderId:', orderId);
            const response = await requestApi(`payments/momo/get-booking/${orderId}`, "GET");
            console.log('✅ Booking response:', response);
            return response?.bookingId || null;
        } catch (error) {
            console.error('❌ getBookingByOrderId error:', error);
            return null;
        }
    },
};

