import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/bookings/entities/bookings.entity';
import { Payment } from 'src/payments/entities/payments.entity';
import { PaymentsController } from 'src/payments/payments.controller';
import { PaymentsService } from 'src/payments/payments.service';

@Module({
    imports: [TypeOrmModule.forFeature([Payment, Booking])],
    providers: [PaymentsService],
    controllers: [PaymentsController]
})
export class PaymentsModule { }
