import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateSeatDto } from 'src/seats/dto/create-seat.dto';
import { SeatsService } from 'src/seats/seats.service';

@Controller('seats')
export class SeatsController {
    constructor(private seatsService:SeatsService){}

    @Get()
    async findAll(): Promise<any> {
        return this.seatsService.findAll();
    }


    @UsePipes(ValidationPipe)
    @Post()
    async create(@Body() createSeatDto:CreateSeatDto): Promise<any> {
        return this.seatsService.create(createSeatDto);
    }
    
}
