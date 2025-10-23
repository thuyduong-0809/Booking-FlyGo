import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSeatDto {
  @IsNotEmpty()
  @IsNumber()
  aircraftId: number;

  @IsNotEmpty()
  @IsString()
  seatNumber: string;

  @IsNotEmpty()
  @IsEnum(['Economy', 'Business', 'First'])
  travelClass: 'Economy' | 'Business' | 'First';

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  features?: object;
}
