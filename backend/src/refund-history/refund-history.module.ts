import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundHistoryService } from './refund-history.service';
import { RefundHistoryController } from './refund-history.controller';
import { RefundHistory } from './entities/refund-history.entity';
import { Booking } from 'src/bookings/entities/bookings.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RefundHistory, Booking])],
    controllers: [RefundHistoryController],
    providers: [RefundHistoryService],
    exports: [RefundHistoryService]
})
export class RefundHistoryModule { }
