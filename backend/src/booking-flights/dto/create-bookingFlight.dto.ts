import { IsEnum, IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBookingFlightDto {

  @IsNotEmpty()
  bookingId: number;

  @IsNotEmpty()
  flightId: number;

  @IsEnum(['Economy', 'Business', 'First'])
  travelClass: string;

  @IsNumber()
  baggageAllowance: number=0;

  seatNumber?: string; // có thể null

  @IsInt()
 passengerId: number;
}
