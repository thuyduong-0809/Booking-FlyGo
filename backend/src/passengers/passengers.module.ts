import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/bookings/entities/bookings.entity';
import { Passenger } from 'src/passengers/entities/passengers.entity';
import { PassengersController } from 'src/passengers/passengers.controller';
import { PassengersService } from 'src/passengers/passengers.service';

@Module({
    imports:[TypeOrmModule.forFeature([Passenger,Booking])],
    providers:[PassengersService],
    controllers:[PassengersController]
})
export class PassengersModule {}
