import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/bookings/entities/bookings.entity';
import { Payment } from 'src/payments/entities/payments.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentsService {
 constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,

    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    ){}
}
