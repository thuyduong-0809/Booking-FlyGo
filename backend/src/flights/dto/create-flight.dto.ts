import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateFlightDto {
  @IsString({ message: 'Flight number must be a string' })
  flightNumber: string;

  @IsDateString({}, { message: 'Departure time must be a valid datetime' })
  departureTime: Date;

  @IsDateString({}, { message: 'Arrival time must be a valid datetime' })
  arrivalTime: Date;

  @IsNumber({}, { message: 'Duration must be a number (in minutes)' })
  @Min(1, { message: 'Duration must be greater than 0' })
  duration: number;

  @IsOptional()
  @IsEnum(['Scheduled', 'Boarding', 'Departed', 'Arrived', 'Delayed', 'Cancelled'], {
    message: 'Invalid flight status',
  })
  status?: string;

  @IsNumber({}, { message: 'Economy price must be a number' })
  @Min(0, { message: 'Economy price cannot be negative' })
  economyPrice: number;

  @IsNumber({}, { message: 'Business price must be a number' })
  @Min(0, { message: 'Business price cannot be negative' })
  businessPrice: number;

  @IsNumber({}, { message: 'First class price must be a number' })
  @Min(0, { message: 'First class price cannot be negative' })
  firstClassPrice: number;

  @IsNumber({}, { message: 'Available economy seats must be a number' })
  availableEconomySeats: number;

  @IsNumber({}, { message: 'Available business seats must be a number' })
  availableBusinessSeats: number;

  @IsNumber({}, { message: 'Available first class seats must be a number' })
  availableFirstClassSeats: number;

  // Foreign keys (IDs)
  @IsNumber({}, { message: 'Airline ID must be a number' })
  airlineId: number;

  @IsNumber({}, { message: 'Departure airport ID must be a number' })
  departureAirportId: number;

  @IsNumber({}, { message: 'Arrival airport ID must be a number' })
  arrivalAirportId: number;

  @IsOptional()
  @IsNumber({}, { message: 'Departure terminal ID must be a number' })
  departureTerminalId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Arrival terminal ID must be a number' })
  arrivalTerminalId?: number;

  @IsNumber({}, { message: 'Aircraft ID must be a number' })
  aircraftId: number;
}
