import { IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';

export class SearchFlightsDto {
    @IsOptional()
    @IsString()
    departureAirportCode?: string;

    @IsOptional()
    @IsString()
    arrivalAirportCode?: string;

    @IsOptional()
    @IsDateString()
    departureDate?: string;

    @IsOptional()
    @IsDateString()
    minDepartureTime?: string; // Thời gian khởi hành tối thiểu (dùng để filter chuyến về sau thời gian đến của chuyến đi)
}

