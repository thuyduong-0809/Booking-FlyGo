export class CreateCancelHistoryDto {
    bookingId: number;
    bookingReference: string;
    cancellationFee: number;
    refundAmount: number;
    totalAmount: number;
    reason?: string;
    cancelledBy?: number;
}
