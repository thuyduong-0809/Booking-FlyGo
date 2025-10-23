import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBookingFlightDto {
  @IsNotEmpty()
  bookingId: number;

  @IsNotEmpty()
  flightId: number;

  @IsEnum(['Economy', 'Business', 'First'])
  travelClass: string;

  @IsNumber()
  baggageAllowance: number;

  seatNumber?: string; // có thể null
}
