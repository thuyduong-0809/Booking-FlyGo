import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingFlight } from 'src/booking-flights/entities/booking-flights.entity';
import { Flight } from 'src/flights/entities/flights.entity';
import { Passenger } from 'src/passengers/entities/passengers.entity';
import { SeatAllocation } from 'src/seat-allocations/entities/seat-allocations.entity';
import { SeatAllocationsController } from 'src/seat-allocations/seat-allocations.controller';
import { SeatAllocationsService } from 'src/seat-allocations/seat-allocations.service';
import { Seat } from 'src/seats/entities/seats.entity';

@Module({
    imports:[TypeOrmModule.forFeature([SeatAllocation,Seat,BookingFlight,Passenger,Flight])],
    providers:[SeatAllocationsService],
    controllers:[SeatAllocationsController]
})
export class SeatAllocationsModule {}
