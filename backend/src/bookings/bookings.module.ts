import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from 'src/bookings/bookings.controller';
import { BookingsService } from 'src/bookings/bookings.service';
import { Booking } from 'src/bookings/entities/bookings.entity';
import { User } from 'src/users/entities/users.entity';

@Module({
     imports:[TypeOrmModule.forFeature([Booking,User])],
     providers:[BookingsService],
     controllers:[BookingsController],
})
export class BookingsModule {}
