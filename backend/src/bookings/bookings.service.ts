import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { CreateBookingDto } from 'src/bookings/dto/create-booking.dto';
import { UpdateBookingDto } from 'src/bookings/dto/update-booking.dto';
import { Booking } from 'src/bookings/entities/bookings.entity';
import { common_response } from 'src/untils/common';
import { User } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BookingsService {
    constructor(@InjectRepository(Booking) private bookingRepository: Repository<Booking>,
        @InjectRepository(User) private userRepository: Repository<User>,
    ) { }


    async findAll(): Promise<any> {
        let response = { ...common_response };
        try {
            const bookings = await this.bookingRepository.find({
                relations: ['user'],
            });
            response.success = true;
            response.data = bookings;
            response.message = 'Successfully retrieved the list of  bookings';
        } catch (error) {
            console.error(error);
            response.success = false;
            response.message = 'Error while fetching the list of bookings';
        }
        return response;
    }

    async findByUserId(userId: number): Promise<any> {
        let response = { ...common_response };
        try {
            const bookings = await this.bookingRepository.find({
                where: { user: { userId } },
                relations: ['user', 'bookingFlights', 'bookingFlights.flight', 'bookingFlights.flight.arrivalAirport', 'bookingFlights.flight.departureAirport'],
                order: { bookingId: 'DESC' }
            });
            console.log('📋 Found bookings:', bookings.length);
            response.success = true;
            response.data = bookings;
            response.message = 'Successfully retrieved bookings for user';
        } catch (error) {
            response.success = false;
            response.message = 'Error while fetching bookings for user';
        }
        return response;
    }


    async create(createBookingDto: CreateBookingDto): Promise<any> {
        let response = { ...common_response };
        try {

            const user = await this.userRepository.findOneBy({ userId: createBookingDto.userId });
            if (!user) {
                response.success = false;
                response.message = 'User not found';
                return response;
            }
            const newBooking = this.bookingRepository.create({
                ...createBookingDto,
                user: user,
                bookingReference: this.generateBookingReference()
            });
            await this.bookingRepository.save(newBooking);
            response.success = true;
            response.message = 'Booking created successfully';
            response.data = newBooking;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY' || error.code === 'SQLITE_CONSTRAINT') {
                response.success = false;
                response.message = 'Duplicate booking reference, please try again.';
            } else {
                response.success = false;
                response.message = error.message || 'Error while creating booking';
            }
        }
        return response;
    }
    async findOne(id: number): Promise<any> {
        let response = { ...common_response };
        try {
            const booking = await this.bookingRepository.findOne({
                where: { bookingId: id },
                relations: [
                    'user',
                    'bookingFlights',
                    'bookingFlights.flight',
                    'bookingFlights.flight.arrivalAirport',
                    'bookingFlights.flight.departureAirport',
                    'bookingFlights.flight.airline',
                    'passengers'
                ],
            });

            if (booking) {
                response.success = true;
                response.data = booking;
                response.message = 'Successfully retrieved booking information';
            } else {
                response.success = false;
                response.message = 'Booking not found';
            }
        } catch (error) {
            console.error(error);
            response.success = false;
            response.message = 'Error while retrieving booking by ID';
        }
        return response;
    }


    async update(
        id: number,
        updateBookingDto: UpdateBookingDto,
    ): Promise<any> {
        let response = { ...common_response };
        try {
            const updateResult = await this.bookingRepository.update(id, updateBookingDto);

            if (updateResult.affected && updateResult.affected > 0) {
                response.success = true;
                response.message = 'Booking updated successfully';
            } else {
                response.success = false;
                response.message = 'Booking not found or no changes made';
            }
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while updating booking';
        }
        return response;
    }

    async delete(id: number): Promise<any> {
        let response = { ...common_response };
        try {
            const deleteResult = await this.bookingRepository.delete({ bookingId: id });
            if (deleteResult.affected && deleteResult.affected > 0) {
                response.success = true;
                response.message = 'Booking deleted successfully';
            } else {
                response.success = false;
                response.message = 'Booking not found';
            }
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while deleting aircraft';
        }
        return response;
    }


    private generateBookingReference(): string {
        const randomPart = randomBytes(2).toString('hex').toUpperCase();
        const timePart = Date.now().toString(36).toUpperCase().slice(-4);
        return `BK${randomPart}${timePart}`;
    }


}
