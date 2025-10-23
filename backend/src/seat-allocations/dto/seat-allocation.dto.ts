import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSeatAllocationDto {
  @IsNotEmpty()
  @IsNumber()
  bookingFlightId: number;

  @IsNotEmpty()
  @IsNumber()
  seatId: number;

  @IsNotEmpty()
  @IsNumber()
  passengerId: number;
  
}
