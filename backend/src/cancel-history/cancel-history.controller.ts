import { Controller, Get, Param } from '@nestjs/common';
import { CancelHistoryService } from './cancel-history.service';

@Controller('cancel-history')
export class CancelHistoryController {
    constructor(private readonly cancelHistoryService: CancelHistoryService) { }

    @Get()
    findAll() {
        return this.cancelHistoryService.findAll();
    }

    @Get('booking/:bookingId')
    findByBooking(@Param('bookingId') bookingId: string) {
        return this.cancelHistoryService.findByBooking(Number(bookingId));
    }
}
