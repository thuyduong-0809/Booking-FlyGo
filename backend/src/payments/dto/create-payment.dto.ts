import {
    IsNotEmpty,
    IsNumber,
    IsString,
    IsOptional,
    Min,
} from 'class-validator';

export class CreatePaymentDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    amount: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    bookingId: number;

    @IsOptional()
    @IsString()
    orderInfo?: string;

    @IsOptional()
    @IsString()
    requestId?: string;
}

