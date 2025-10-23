import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aircraft } from 'src/aircrafts/entities/aircrafts.entity';
import { Seat } from 'src/seats/entities/seats.entity';
import { SeatsController } from 'src/seats/seats.controller';
import { SeatsService } from 'src/seats/seats.service';

@Module({
    imports:[TypeOrmModule.forFeature([Seat,Aircraft])],
    providers:[SeatsService],
    controllers:[SeatsController]
})
export class SeatsModule {}
