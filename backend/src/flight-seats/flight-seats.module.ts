import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flight } from 'src/flights/entities/flights.entity';
import { Seat } from 'src/seats/entities/seats.entity';
import { FlightSeat } from 'src/flight-seats/entities/flight-seats.entity';
import { FlightSeatsService } from 'src/flight-seats/flight-seats.service';
import { FlightSeatsController } from 'src/flight-seats/flight-seats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FlightSeat, Flight, Seat])],
  providers: [FlightSeatsService],
  controllers: [FlightSeatsController],
  exports: [FlightSeatsService],
})
export class FlightSeatsModule {}

