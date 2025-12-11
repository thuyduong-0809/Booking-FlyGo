import { Controller, Get, Post, Body, Patch, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { RefundHistoryService } from './refund-history.service';
import { CreateRefundHistoryDto } from './dto/create-refund-history.dto';
import { UpdateRefundHistoryDto } from './dto/update-refund-history.dto';

@Controller('refund-history')
export class RefundHistoryController {
    constructor(private readonly refundHistoryService: RefundHistoryService) { }

    @Post()
    @UsePipes(ValidationPipe)
    create(@Body() createRefundHistoryDto: CreateRefundHistoryDto) {
        return this.refundHistoryService.create(createRefundHistoryDto);
    }

    @Get()
    findAll() {
        return this.refundHistoryService.findAll();
    }

    @Get('booking/:bookingId')
    findByBooking(@Param('bookingId') bookingId: string) {
        return this.refundHistoryService.findByBooking(Number(bookingId));
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.refundHistoryService.findOne(Number(id));
    }

    @Patch(':id')
    @UsePipes(ValidationPipe)
    update(@Param('id') id: string, @Body() updateRefundHistoryDto: UpdateRefundHistoryDto) {
        return this.refundHistoryService.update(Number(id), updateRefundHistoryDto);
    }
}
