import { IsString, Length, MaxLength, IsOptional, IsNumber } from 'class-validator';

export class CreateAirportDto {
  @IsString({ message: 'Airport code must be a string' })
  @Length(3, 3, { message: 'Airport code must be exactly 3 characters long (e.g., SGN, HAN)' })
  airportCode: string;

  @IsString({ message: 'Airport name is required' })
  @MaxLength(100, { message: 'Airport name must not exceed 100 characters' })
  airportName: string;

  @IsString({ message: 'City name is required' })
  @MaxLength(100, { message: 'City name must not exceed 100 characters' })
  city: string;

  @IsString({ message: 'Country name is required' })
  @MaxLength(100, { message: 'Country name must not exceed 100 characters' })
  country: string;

  @IsOptional()
  @IsString({ message: 'Timezone must be a string' })
  @MaxLength(50, { message: 'Timezone must not exceed 50 characters' })
  timezone?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a number' })
  latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a number' })
  longitude?: number;
}
