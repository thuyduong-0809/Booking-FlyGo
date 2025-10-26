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
     constructor(@InjectRepository(Booking) private bookingRepository:Repository<Booking>,
                @InjectRepository(User) private userRepository: Repository<User>,
            ) {}
    
    
            async findAll(): Promise<any> {
                    let response = { ...common_response };
                    try {
                        const bookings = await this.bookingRepository.find({
                        relations: ['user'],
                        });
                        response.success = true;
                        response.data =  bookings;
                        response.message = 'Successfully retrieved the list of  bookings';
                    } catch (error) {
                        console.error(error);
                        response.success = false;
                        response.message = 'Error while fetching the list of bookings';
                    }
                    return response;
                }

                async getBookingSummaries() {
                try {
                    // Lấy toàn bộ thông tin booking + liên kết các bảng cần thiết
                    const bookings = await this.bookingRepository
                    .createQueryBuilder('booking')
                    .leftJoinAndSelect('booking.user', 'user')
                    .leftJoinAndSelect('booking.bookingFlights', 'bf')
                    .leftJoinAndSelect('bf.flight', 'flight')
                    .leftJoinAndSelect('flight.departureAirport', 'dep')
                    .leftJoinAndSelect('flight.arrivalAirport', 'arr')
                    .orderBy('booking.bookedAt', 'DESC')
                    .getMany();

                    // Gộp dữ liệu lại cho dễ dùng ở frontend
                    const formatted = bookings.map(b => ({
                    bookingId: b.bookingId,
                    bookingReference: b.bookingReference,
                    totalAmount: b.totalAmount,
                    bookingStatus: b.bookingStatus,
                    paymentStatus: b.paymentStatus,
                    customerName: `${b.user.firstName} ${b.user.lastName}`,
                    bookedAt: b.bookedAt,
                    flights: b.bookingFlights.map(f => ({
                        bookingFlightId: f.bookingFlightId,
                        flightNumber: f.flight.flightNumber,
                        route: `${f.flight.departureAirport.airportCode} → ${f.flight.arrivalAirport.airportCode}`,
                        travelClass: f.travelClass,
                        fare: f.fare,
                        seatNumber: f.seatNumber,
                        departureTime: f.flight.departureTime,
                        arrivalTime: f.flight.arrivalTime,
                        status: f.flight.status,
                    })),
                    }));

                    return {
                    success: true,
                    message: 'Fetched full booking data successfully',
                    data: formatted,
                    };

                } catch (error) {
                    return {
                    success: false,
                    message: error.message || 'Error fetching booking data',
                    };
                }
                }
                
                async getBookingDetail(bookingId: number) {
                try {
                    const booking = await this.bookingRepository.findOne({
                    where: { bookingId },
                    relations: [
                        'user',
                        'bookingFlights',
                        'bookingFlights.flight',
                        'bookingFlights.flight.departureAirport',
                        'bookingFlights.flight.arrivalAirport',
                        'bookingFlights.seatAllocations',
                        'bookingFlights.seatAllocations.seat',
                        'bookingFlights.seatAllocations.passenger',
                    ],
                    });

                    if (!booking) {
                    return { success: false, message: 'Booking not found' };
                    }

                    const result = {
                    bookingId: booking.bookingId,
                    bookingReference: booking.bookingReference,
                    bookedAt: booking.bookedAt,
                    totalAmount: booking.totalAmount,
                    bookingStatus: booking.bookingStatus,
                    paymentStatus: booking.paymentStatus,
                    customer: {
                        name: `${booking.user.firstName} ${booking.user.lastName}`,
                        email: booking.user.email,
                    },

                    // Lấy tất cả chuyến bay thuộc booking
                    flights: booking.bookingFlights.map((bf) => ({
                        flightNumber: bf.flight.flightNumber,
                        route: `${bf.flight.departureAirport.airportCode} → ${bf.flight.arrivalAirport.airportCode}`,
                        departureTime: bf.flight.departureTime,
                        arrivalTime: bf.flight.arrivalTime,
                        travelClass: bf.travelClass,
                        baggage: bf.baggageAllowance,
                        seatAllocations: bf.seatAllocations.map((sa) => ({
                        seatNumber: sa.seat?.seatNumber,
                        passengerName: `${sa.passenger?.firstName} ${sa.passenger?.lastName}`,
                        passengerType: sa.passenger?.passengerType,
                        passengerDob: sa.passenger?.dateOfBirth,
                        })),
                    })),

                    
                    };

                    return { success: true, data: result };
                } catch (error) {
                    return { success: false, message: error.message };
                }
                }

               
            async create(createBookingDto: CreateBookingDto): Promise<any> {
                let response = { ...common_response };
                    try {
                  
                        const user = await this.userRepository.findOneBy({ userId: createBookingDto.userId});
                        if (!user) {
                            response.success = false;
                            response.message = 'User not found';
                            return response;
                        }
                        const newBooking = this.bookingRepository.create({
                            ...createBookingDto,
                            user: user,
                            bookingReference:this.generateBookingReference()
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
                            relations: ['user'],
                        });
                        if (booking) {
                            response.success = true;
                            response.data =  booking;
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
                        const deleteResult = await this.bookingRepository.delete({bookingId: id });
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
