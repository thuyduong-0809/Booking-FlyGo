import { IsString, IsEmail, IsNumber, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
 @IsOptional()
  @IsString()
  bookingReference: string;

  @IsNumber()
  @Type(() => Number)
  totalAmount: number;

  @IsEnum(['Pending', 'Paid', 'Failed', 'Refunded'])
  @IsOptional()
  paymentStatus?: 'Pending' | 'Paid' | 'Failed' | 'Refunded';

  @IsEnum(['Reserved', 'Confirmed', 'Cancelled', 'Completed'])
  @IsOptional()
  bookingStatus?: 'Reserved' | 'Confirmed' | 'Cancelled' | 'Completed';

  @IsEmail()
  contactEmail: string;

  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @IsString()
  @IsOptional()
  specialRequests?: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  userId: number;
}
