import { Body, Controller, Get, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateSeatDto } from 'src/seats/dto/create-seat.dto';
import { UpdateSeatDto } from 'src/seats/dto/update-seat.fto';
import { SeatsService } from 'src/seats/seats.service';

@Controller('seats')
export class SeatsController {
    constructor(private seatsService:SeatsService){}

    @Get()
    async findAll(): Promise<any> {
        return this.seatsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id:string): Promise<any> {
        return this.seatsService.findOne(Number(id))
    }

    @Get('seat/:id')
    async findSeatNumberByAircraft(@Param('id') id:string,@Query('seatNumber') seatNumber:string): Promise<any> {
        return this.seatsService.findOneSeatNumberByAircraft(Number(id),seatNumber)
    }

    @Get('aircraft/:id')
    async findByAircraft(@Param('id') id:string): Promise<any> {
        return this.seatsService.findByAircraft(Number(id))
    }


    @UsePipes(ValidationPipe)
    @Post()
    async create(@Body() createSeatDto:CreateSeatDto): Promise<any> {
        return this.seatsService.create(createSeatDto);
    }

    @UsePipes(ValidationPipe)
    @Put(':id')
    async update(@Param('id') id:string,@Body() updateSeatDto:UpdateSeatDto): Promise<any> {
        return this.seatsService.update(Number(id),updateSeatDto)
    }




    
}
