import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aircraft } from 'src/aircrafts/entities/aircrafts.entity';
import { Airline } from 'src/airlines/entities/airlines.entity';
import { Airport } from 'src/airports/entities/airports.entity';
import { Flight } from 'src/flights/entities/flights.entity';
import { FlightsController } from 'src/flights/flights.controller';
import { FlightsService } from 'src/flights/flights.service';
import { Terminal } from 'src/terminals/entities/terminals.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Flight,Airline,Airport,Aircraft,Terminal])],
    providers: [FlightsService],
    controllers: [FlightsController],
})
export class FlightsModule {}
