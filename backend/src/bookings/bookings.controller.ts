import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { BookingsService } from 'src/bookings/bookings.service';
import { CreateBookingDto } from 'src/bookings/dto/create-booking.dto';
import { UpdateBookingDto } from 'src/bookings/dto/update-booking.dto';

@Controller('bookings')
export class BookingsController {
    constructor(private bookingsService: BookingsService) { }
    @Get()
    findAll(@Query('userId') userId?: string) {
        // Nếu có userId trong query, lấy bookings của user đó
        if (userId) {
            return this.bookingsService.findByUserId(Number(userId));
        }
        return this.bookingsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bookingsService.findOne(Number(id));
    }

    @Get('user/:userId')
    findByUserId(@Param('userId') userId: string) {
        console.log('🔍 Getting bookings for userId:', userId);
        return this.bookingsService.findByUserId(Number(userId));
    }


    @UsePipes(ValidationPipe)
    @Post()
    create(@Body() createBookingDto: CreateBookingDto) {
        return this.bookingsService.create(createBookingDto);
    }


    @UsePipes(ValidationPipe)
    @Put(':id')
    update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
        return this.bookingsService.update(Number(id), updateBookingDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.bookingsService.delete(Number(id));
    }
}
