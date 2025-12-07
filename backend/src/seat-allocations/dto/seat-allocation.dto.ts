import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSeatAllocationDto {
  @IsNotEmpty()
  @IsNumber()
  bookingFlightId: number;

  @IsNotEmpty({ message: 'flightSeatId is required' })
  @IsInt({ message: 'flightSeatId must be a number conforming to the specified constraints' })
  flightSeatId: number;

  @IsNotEmpty()
  @IsNumber()
  passengerId: number;
}
