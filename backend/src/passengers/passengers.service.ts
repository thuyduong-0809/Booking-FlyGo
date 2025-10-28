import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/bookings/entities/bookings.entity';
import { CreatePassengerDto } from 'src/passengers/dto/create-passenger.dto';
import { Passenger } from 'src/passengers/entities/passengers.entity';
import { common_response } from 'src/untils/common';
import { Repository } from 'typeorm';

@Injectable()
export class PassengersService {
    constructor(
        @InjectRepository(Booking)
        private bookingRepository: Repository<Booking>,

        @InjectRepository(Passenger)
        private passengerRepository: Repository<Passenger>,
    ) { }

    async findAll(): Promise<any> {
        let response = { ...common_response };
        try {
            const passengers = await this.passengerRepository.find({
                relations: ['booking'],
            });
            response.success = true;
            response.data = passengers;
            response.message = 'Successfully retrieved the list of  passengers';
        } catch (error) {
            console.error(error);
            response.success = false;
            response.message = 'Error while fetching the list of  passengers';
        }
        return response;
    }


    async create(createPassengerDto: CreatePassengerDto) {
        const booking = await this.bookingRepository.findOne({ where: { bookingId: createPassengerDto.bookingId }, relations: ['passengers'] });

        if (!booking) {
            throw new NotFoundException(`Booking with ID ${createPassengerDto.bookingId} not found`);
        }

        // Nếu là Child/Infant và thiếu tên → lấy tên của một Adult cùng booking
        const isChildOrInfant = createPassengerDto.passengerType === 'Child' || createPassengerDto.passengerType === 'Infant';
        const missingName = !createPassengerDto.firstName || !createPassengerDto.lastName;
        if (isChildOrInfant && missingName) {
            const adult = (booking.passengers || []).find(p => p.passengerType === 'Adult');
            if (adult) {
                createPassengerDto.firstName = createPassengerDto.firstName || adult.firstName;
                createPassengerDto.lastName = createPassengerDto.lastName || adult.lastName;
            }
        }

        const passenger = this.passengerRepository.create({
            ...createPassengerDto,
            booking,
        });

        return await this.passengerRepository.save(passenger);
    }


    async findOne(id: number): Promise<any> {
        let response = { ...common_response }
        try {
            const passenger = await this.passengerRepository.findOne({
                where: { passengerId: id },
                relations: ['booking']
            });
            if (!passenger) {
                response.success = false;
                response.message = 'passenger not found';
                return response;
            }
            response.success = true;
            response.message = 'passenger retrieved successfully';
            response.data = passenger;
            return response;
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error retrieving passenger';
            return response;
        }

    }
    async findByBooking(id: number): Promise<any> {
        let response = { ...common_response };
        try {
            const passengers = await this.passengerRepository.find({
                where: { booking: { bookingId: id } },
                relations: ['booking'],
            });

            if (passengers.length > 0) {
                response.success = true;
                response.data = passengers;
                response.message = 'Successfully retrieved seats for this booking';
            } else {
                response.success = false;
                response.message = 'No seats found for this booking';
                response.errorCode = 'PASSENGER_EXISTS';
            }
        } catch (error) {
            console.error(error);
            response.success = false;
            response.message = 'Error while retrieving aicraft by booking ID';
        }
        return response;
    }

}
