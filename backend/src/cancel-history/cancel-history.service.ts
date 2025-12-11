import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CancelHistory } from './entities/cancel-history.entity';
import { Booking } from 'src/bookings/entities/bookings.entity';

@Injectable()
export class CancelHistoryService {
    constructor(
        @InjectRepository(CancelHistory)
        private cancelHistoryRepository: Repository<CancelHistory>,
    ) { }

    async logCancellation(data: {
        booking: Booking;
        bookingReference: string;
        reason: string;
        cancellationFee: number;
        refundAmount: number;
        totalAmount: number;
        cancelledBy?: any;
    }): Promise<CancelHistory> {
        const cancelHistory = this.cancelHistoryRepository.create({
            booking: data.booking,
            bookingReference: data.bookingReference,
            cancellationFee: data.cancellationFee,
            refundAmount: data.refundAmount,
            totalAmount: data.totalAmount,
            reason: data.reason,
            cancelledBy: data.cancelledBy,
        });

        return await this.cancelHistoryRepository.save(cancelHistory);
    }

    async findByBooking(bookingId: number): Promise<CancelHistory[]> {
        return await this.cancelHistoryRepository.find({
            where: { booking: { bookingId } },
            relations: ['booking', 'cancelledBy'],
            order: { cancelledAt: 'DESC' },
        });
    }

    async findAll(): Promise<CancelHistory[]> {
        return await this.cancelHistoryRepository.find({
            relations: [
                'booking',
                'booking.user',
                'booking.bookingFlights',
                'booking.bookingFlights.flight',
                'booking.bookingFlights.flight.departureAirport',
                'booking.bookingFlights.flight.arrivalAirport',
                'cancelledBy'
            ],
            order: { cancelledAt: 'DESC' },
        });
    }
}
