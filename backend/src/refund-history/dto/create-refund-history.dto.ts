import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, IsEmail } from 'class-validator';

export class CreateRefundHistoryDto {
    @IsOptional()
    @IsNumber()
    bookingId?: number;

    @IsNotEmpty()
    @IsString()
    bookingReference: string;

    @IsNotEmpty()
    @IsEnum([
        'AIRLINE_SCHEDULE_CHANGE',
        'CUSTOMER_CANCELLATION',
        'WRONG_INFORMATION',
        'PAYMENT_ERROR',
        'HEALTH_ISSUE',
        'OTHER'
    ])
    refundReason: string;

    @IsNotEmpty()
    @IsNumber()
    refundAmount: number;

    @IsNotEmpty()
    @IsString()
    passengerName: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    documents?: string; // JSON string array
}
