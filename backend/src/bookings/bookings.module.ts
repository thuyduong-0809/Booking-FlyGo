import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingFlight } from 'src/booking-flights/entities/booking-flights.entity';
import { BookingsController } from 'src/bookings/bookings.controller';
import { BookingsService } from 'src/bookings/bookings.service';
import { Booking } from 'src/bookings/entities/bookings.entity';
import { Flight } from 'src/flights/entities/flights.entity';
import { Passenger } from 'src/passengers/entities/passengers.entity';
import { Payment } from 'src/payments/entities/payments.entity';
import { SeatAllocation } from 'src/seat-allocations/entities/seat-allocations.entity';
import { Seat } from 'src/seats/entities/seats.entity';
import { User } from 'src/users/entities/users.entity';

@Module({
     imports:[TypeOrmModule.forFeature([Booking,User,Passenger,Flight,Payment,BookingFlight,Seat,SeatAllocation])],
     providers:[BookingsService],
     controllers:[BookingsController],
})
export class BookingsModule {}
