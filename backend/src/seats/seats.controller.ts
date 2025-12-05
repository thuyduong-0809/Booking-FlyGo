import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateSeatDto } from 'src/seats/dto/create-seat.dto';
import { UpdateSeatDto } from 'src/seats/dto/update-seat.fto';
import { SeatsService } from 'src/seats/seats.service';

@Controller('seats')
export class SeatsController {
    constructor(private seatsService: SeatsService) { }

    @Get()
    async findAll(): Promise<any> {
        return this.seatsService.findAll();
    }

    // Các route cụ thể phải đặt TRƯỚC route có parameter (:id)
    @Get('seat/:id')
    async findSeatNumberByAircraft(@Param('id') id: string, @Query('seatNumber') seatNumber: string): Promise<any> {
        return this.seatsService.findOneSeatNumberByAircraft(Number(id), seatNumber)
    }

    @Get('aircraft/:id')
    async findByAircraft(@Param('id') id: string): Promise<any> {
        return this.seatsService.findByAircraft(Number(id))
    }

    // Route có parameter phải đặt SAU các route cụ thể
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<any> {
        return this.seatsService.findOne(Number(id))
    }

    @Get(':id/flight-seats')
    async findFlightSeatsBySeat(@Param('id') id: string): Promise<any> {
        return this.seatsService.findFlightSeatsBySeat(Number(id));
    }

    @Get(':id/flights')
    async findFlightsBySeat(@Param('id') id: string): Promise<any> {
        return this.seatsService.findFlightsBySeat(Number(id));
    }

    @Post(':id/sync-flight-seats')
    async forceSyncFlightSeats(@Param('id') id: string): Promise<any> {
        return this.seatsService.forceSyncFlightSeats(Number(id));
    }

    // POST routes - các route cụ thể đặt trước
    @Post('reset-auto-increment')
    async resetAutoIncrement(): Promise<any> {
        return this.seatsService.resetSeatIdAutoIncrement();
    }

    @Post('reset-all-ids')
    async resetAllIds(): Promise<any> {
        return this.seatsService.resetAllSeatIds();
    }

    @UsePipes(ValidationPipe)
    @Post()
    async create(@Body() createSeatDto: CreateSeatDto): Promise<any> {
        return this.seatsService.create(createSeatDto);
    }

    @UsePipes(ValidationPipe)
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateSeatDto: UpdateSeatDto): Promise<any> {
        return this.seatsService.update(Number(id), updateSeatDto)
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<any> {
        return this.seatsService.remove(Number(id));
    }

}
