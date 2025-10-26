import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { BookingsService } from 'src/bookings/bookings.service';
import { CreateBookingDto } from 'src/bookings/dto/create-booking.dto';
import { UpdateBookingDto } from 'src/bookings/dto/update-booking.dto';

@Controller('bookings')
export class BookingsController {
     constructor(private bookingsService: BookingsService) {}
        @Get()
        findAll() {
         return this.bookingsService.findAll();
        }

        @Get(':id')
        findOne(@Param('id') id:string) {
            return this.bookingsService.findOne(Number(id));
        }
        
            
        @UsePipes(ValidationPipe)
        @Post()
        create(@Body() createBookingDto:CreateBookingDto) {
          return this.bookingsService.create(createBookingDto);
        }


        @UsePipes(ValidationPipe)
        @Put(':id')
        update(@Param('id') id:string, @Body() updateBookingDto:UpdateBookingDto) {
            return this.bookingsService.update(Number(id), updateBookingDto);
        }
    
        @Delete(':id')
        delete(@Param('id') id:string) {
            return this.bookingsService.delete(Number(id));
        }       
}
