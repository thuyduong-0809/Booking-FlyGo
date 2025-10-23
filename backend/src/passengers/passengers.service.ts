import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/bookings/entities/bookings.entity';
import { Passenger } from 'src/passengers/entities/passengers.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PassengersService {
    constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,

    @InjectRepository(Passenger)
    private passengerRepository: Repository<Passenger>,
    ){}

    
}
