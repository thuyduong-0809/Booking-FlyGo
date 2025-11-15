import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateFlightDto } from 'src/flights/dto/create-flight.dto';
import { UpdateFlightDto } from 'src/flights/dto/update-flight.dto';
import { SearchFlightsDto } from 'src/flights/dto/search-flights.dto';
import { FlightsService } from 'src/flights/flights.service';

@Controller('flights')
export class FlightsController {
    constructor(private flightsService: FlightsService) { }

    @Get('search')
    async searchFlights(
        @Query('departureAirportCode') departureAirportCode?: string,
        @Query('arrivalAirportCode') arrivalAirportCode?: string,
        @Query('departureDate') departureDate?: string,
        @Query('minDepartureTime') minDepartureTime?: string,
    ): Promise<any> {
        return this.flightsService.searchFlights(departureAirportCode, arrivalAirportCode, departureDate, minDepartureTime);
    }

    @Get('generate-flight-number/:airlineId')
    async generateFlightNumber(@Param('airlineId') airlineId: number) {
        return this.flightsService.generateFlightNumber(airlineId);
    }

    @Get()
    async findAll(): Promise<any> {
        return this.flightsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<any> {
        return this.flightsService.findOne(Number(id));
    }

    @UsePipes(ValidationPipe)
    @Post()
    async create(@Body() createFlightDto: CreateFlightDto): Promise<any> {
        return this.flightsService.create(createFlightDto);
    }

    @UsePipes(ValidationPipe)
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateFlightDto: UpdateFlightDto): Promise<any> {
        return this.flightsService.update(Number(id), updateFlightDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<any> {
        return this.flightsService.delete(Number(id));
    }
}
