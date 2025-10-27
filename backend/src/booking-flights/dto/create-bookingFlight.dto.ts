import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateBookingFlightDto {

  @IsNotEmpty()
  bookingId: number;

  @IsNotEmpty()
  flightId: number;

  @IsEnum(['Economy', 'Business', 'First'])
  travelClass: string;

  @IsNumber()
  baggageAllowance: number = 0;

  seatNumber?: string; // có thể null

  @IsOptional()
  @IsInt()
  passengerId?: number; // Có thể null - sẽ được tạo seatAllocation tự động nếu có
}
