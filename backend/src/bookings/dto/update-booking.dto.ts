import { IsEnum, IsNumber, IsOptional, IsString, IsEmail, MaxLength } from 'class-validator';

export class UpdateBookingDto {
//   @IsOptional()
//   @IsString()
//   @MaxLength(10)
//   bookingReference?: string;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsEnum(['Pending', 'Paid', 'Failed', 'Refunded'])
  paymentStatus?: string;

  @IsOptional()
  @IsEnum(['Reserved', 'Confirmed', 'Cancelled', 'Completed'])
  bookingStatus?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;

//   @IsOptional()
//   @IsNumber()
//   userId?: number;
}
