import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateSeatDto } from 'src/seats/dto/create-seat.dto';
import { SeatsService } from 'src/seats/seats.service';

@Controller('seats')
export class SeatsController {
    constructor(private seatsService:SeatsService){}

    @Get()
    async findAll(): Promise<any> {
        return this.seatsService.findAll();
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


    
}
