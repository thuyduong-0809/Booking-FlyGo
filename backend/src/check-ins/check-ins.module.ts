import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingFlight } from 'src/booking-flights/entities/booking-flights.entity';
import { Booking } from 'src/bookings/entities/bookings.entity';
import { CheckInsController } from 'src/check-ins/check-ins.controller';
import { CheckInsService } from 'src/check-ins/check-ins.service';
import { CheckIn } from 'src/check-ins/entities/check-ins.entity';
import { Passenger } from 'src/passengers/entities/passengers.entity';
import { SeatAllocation } from 'src/seat-allocations/entities/seat-allocations.entity';

@Module({
    imports:[TypeOrmModule.forFeature([CheckIn,Passenger,BookingFlight,SeatAllocation,Booking])],
    providers:[CheckInsService],
    controllers:[CheckInsController]
})
export class CheckInsModule {}
