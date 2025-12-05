import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { BookingsService } from 'src/bookings/bookings.service';
import { CreateBookingDto } from 'src/bookings/dto/create-booking.dto';
import { UpdateBookingDto } from 'src/bookings/dto/update-booking.dto';

@Controller('bookings')
export class BookingsController {
    constructor(private bookingsService: BookingsService) { }

    @Get('summary')
    async getBookingSummaries() {
        return this.bookingsService.getBookingSummaries();
    }
    @Get(':id/detail')
    async getDetail(@Param('id') id: number) {
        return this.bookingsService.getBookingDetail(id);
    }
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

    // Tra cứu đơn hàng cho khách vãng lai
    @Get('guest/lookup')
    async lookupGuestBooking(
        @Query('email') email: string,
        @Query('bookingReference') bookingReference?: string
    ) {
        // Nếu không có bookingReference, tìm tất cả booking theo email
        if (!bookingReference) {
            return this.bookingsService.findBookingsByEmail(email);
        }
        return this.bookingsService.lookupGuestBooking(email, bookingReference);
    }
    //reports
    @Get("/reports/current-month-revenue")
    getCurrentMonthRevenue() {
    return this.bookingsService.getThisMonthRevenue();
    }

    @Get("/reports/current-week-revenue")
    getCurrentWeekRevenue() {
    return this.bookingsService.getThisWeekRevenue();
    }

    @Get("/reports/current-quarter-revenue")
    getCurrentQuarterRevenue() {
    return this.bookingsService.getThisQuarterRevenue();
    }

    @Get("/reports/current-year-revenue")
    getCurrentYearRevenue() {
    return this.bookingsService.getThisYearRevenue();
    }

    


}
