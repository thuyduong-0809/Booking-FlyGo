import { Body, Controller, Delete, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { BookingFlightsService } from 'src/booking-flights/booking-flights.service';
import { CreateBookingFlightDto } from 'src/booking-flights/dto/create-bookingFlight.dto';

@Controller('booking-flights')
export class BookingFlightsController {
    constructor(private bookingflightsService:BookingFlightsService){}

        @Get()
        findAll() {
         return this.bookingflightsService.findAll();
        }

        @Get('booking/:id')
        findByBookingId(@Param('id') id:string) {
            return this.bookingflightsService.findByBookingId(Number(id));
        }
            
        @UsePipes(ValidationPipe)
        @Post()
        create(@Body() createBookingFlightDto:CreateBookingFlightDto) {
          return this.bookingflightsService.create(createBookingFlightDto);
        }    

        @Delete(':id')
        delete(@Param('id') id:string ){
          return this.bookingflightsService.delete(Number(id))
        }
}
