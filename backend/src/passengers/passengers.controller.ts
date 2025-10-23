import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreatePassengerDto } from 'src/passengers/dto/create-passenger.dto';
import { PassengersService } from 'src/passengers/passengers.service';

@Controller('passengers')
export class PassengersController {
    constructor(private passengersService: PassengersService) {}

        @Get()
        async findAll(): Promise<any> {
            return this.passengersService.findAll();
        }

        
        @UsePipes(ValidationPipe)
        @Post()
        async create(@Body() createPassengerDto:CreatePassengerDto): Promise<any> {
          return this.passengersService.create(createPassengerDto);
        }

        @Get(':id')
        async findOne(@Param('id') id:string): Promise<any> {
                return this.passengersService.findOne(Number(id));
        }
        
       @Get('booking/:id')
        async findByBooking(@Param('id') id:string): Promise<any> {
                return this.passengersService.findByBooking(Number(id));
        }   

}
