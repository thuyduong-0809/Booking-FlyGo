import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingFlightsController } from 'src/booking-flights/booking-flights.controller';
import { BookingFlightsService } from 'src/booking-flights/booking-flights.service';
import { BookingFlight } from 'src/booking-flights/entities/booking-flights.entity';
import { Booking } from 'src/bookings/entities/bookings.entity';
import { Flight } from 'src/flights/entities/flights.entity';

@Module({
    imports:[TypeOrmModule.forFeature([BookingFlight,Flight,Booking])],
    providers:[BookingFlightsService],
    controllers:[BookingFlightsController]
})
export class BookingFlightsModule {}
