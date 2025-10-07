import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AircraftsController } from 'src/aircrafts/aircrafts.controller';
import { AircraftsService } from 'src/aircrafts/aircrafts.service';
import { Aircraft } from 'src/aircrafts/entities/aircrafts.entity';
import { Airline } from 'src/airlines/entities/airlines.entity';

@Module({
        imports:[TypeOrmModule.forFeature([Aircraft,Airline])],
        providers:[AircraftsService],
        controllers:[AircraftsController],
})
export class AircraftsModule {}
