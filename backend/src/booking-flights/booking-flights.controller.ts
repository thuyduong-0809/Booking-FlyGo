import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { BookingFlightsService } from 'src/booking-flights/booking-flights.service';
import { CreateBookingFlightDto } from 'src/booking-flights/dto/create-bookingFlight.dto';

@Controller('booking-flights')
export class BookingFlightsController {
    constructor(private bookingflightsService:BookingFlightsService){}

        @Get()
        findAll() {
         return this.bookingflightsService.findAll();
        }

        // @Get(':id')
        // findOne(@Param('id') id:string) {
        //     return this.bookingflightsService.findOne(Number(id));
        // }
            
        @UsePipes(ValidationPipe)
        @Post()
        create(@Body() createBookingFlightDto:CreateBookingFlightDto) {
          return this.bookingflightsService.create(createBookingFlightDto);
        }    
}
