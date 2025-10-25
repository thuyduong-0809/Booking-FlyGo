import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateFlightDto } from 'src/flights/dto/create-flight.dto';
import { UpdateFlightDto } from 'src/flights/dto/update-flight.dto';
import { FlightsService } from 'src/flights/flights.service';

@Controller('flights')
export class FlightsController {
    constructor(private flightsService: FlightsService) { }

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
    @Get('generate-flight-number/:airlineId')
    async generateFlightNumber(@Param('airlineId') airlineId: number) {
        return this.flightsService.generateFlightNumber(airlineId);
    }
}
