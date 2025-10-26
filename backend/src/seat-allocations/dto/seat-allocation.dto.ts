import { IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateSeatAllocationDto {
  @IsNotEmpty()
  @IsNumber()
  bookingFlightId: number;

  @IsOptional() //Cho phép bỏ trống seatId để hệ thống tự chọn
  @IsInt({ message: 'seatId must be a number conforming to the specified constraints' })
  seatId?: number;


  @IsNotEmpty()
  @IsNumber()
  passengerId: number;
  
}
