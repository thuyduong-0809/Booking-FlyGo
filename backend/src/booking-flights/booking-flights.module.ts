import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aircraft } from 'src/aircrafts/entities/aircrafts.entity';
import { BookingFlightsController } from 'src/booking-flights/booking-flights.controller';
import { BookingFlightsService } from 'src/booking-flights/booking-flights.service';
import { BookingFlight } from 'src/booking-flights/entities/booking-flights.entity';
import { Booking } from 'src/bookings/entities/bookings.entity';
import { Flight } from 'src/flights/entities/flights.entity';
import { Passenger } from 'src/passengers/entities/passengers.entity';
import { SeatAllocation } from 'src/seat-allocations/entities/seat-allocations.entity';
import { Seat } from 'src/seats/entities/seats.entity';

@Module({
    imports:[TypeOrmModule.forFeature([BookingFlight,Flight,Booking,Seat,Aircraft,SeatAllocation,Passenger])],
    providers:[BookingFlightsService],
    controllers:[BookingFlightsController]
})
export class BookingFlightsModule {}
