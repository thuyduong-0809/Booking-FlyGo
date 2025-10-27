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
}

