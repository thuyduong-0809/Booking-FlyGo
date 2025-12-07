import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingFlight } from 'src/booking-flights/entities/booking-flights.entity';
import { Flight } from 'src/flights/entities/flights.entity';
import { Passenger } from 'src/passengers/entities/passengers.entity';
import { CreateSeatAllocationDto } from 'src/seat-allocations/dto/seat-allocation.dto';
import { SeatAllocation } from 'src/seat-allocations/entities/seat-allocations.entity';
import { Seat } from 'src/seats/entities/seats.entity';
import { FlightSeat } from 'src/flight-seats/entities/flight-seats.entity';
import { common_response } from 'src/untils/common';
import { Repository } from 'typeorm';

@Injectable()
export class SeatAllocationsService {
    constructor(
        @InjectRepository(Seat)
        private seatRepository: Repository<Seat>,

        @InjectRepository(SeatAllocation)
        private seatAllocationRepository: Repository<SeatAllocation>,

        @InjectRepository(BookingFlight)
        private bookingFlightRepository: Repository<BookingFlight>,

        @InjectRepository(Passenger)
        private passengerRepository: Repository<Passenger>,

        @InjectRepository(Flight)
        private flightRepository: Repository<Flight>,

        @InjectRepository(FlightSeat)
        private flightSeatRepository: Repository<FlightSeat>,

    ) { }


    async findAll(): Promise<any> {
        let response = { ...common_response }
        try {
            const seatAllocations = await this.seatAllocationRepository.find({
                relations: ['flightSeat', 'flightSeat.seat', 'flightSeat.flight', 'passenger', 'bookingFlight']
            });

            response.success = true;
            response.message = 'seatAllocations retrieved successfully';
            response.data = seatAllocations;

        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error retrieving seatAllocations';
        }
        return response;
    }

    async create(createSeatAllocationDto: CreateSeatAllocationDto): Promise<any> {
        const response = { ...common_response };

        try {
            await this.seatAllocationRepository.manager.transaction(async (manager) => {
                const flightSeatRepo = manager.getRepository(FlightSeat);
                const seatRepo = manager.getRepository(Seat);
                const passengerRepo = manager.getRepository(Passenger);
                const bookingFlightRepo = manager.getRepository(BookingFlight);
                const seatAllocationRepo = manager.getRepository(SeatAllocation);
                const flightRepo = manager.getRepository(Flight);

                // 1️ Lấy passenger
                const passenger = await passengerRepo.findOneBy({ passengerId: createSeatAllocationDto.passengerId });
                if (!passenger) throw new Error('Passenger not found');

                // 2️ Lấy bookingFlight + flight + aircraft
                const bookingFlight = await bookingFlightRepo.findOne({
                    where: { bookingFlightId: createSeatAllocationDto.bookingFlightId },
                    relations: ['flight', 'flight.aircraft'],
                });
                if (!bookingFlight) throw new Error('BookingFlight not found');

                // 3️ Tìm FlightSeat - BẮT BUỘC phải có flightSeatId
                const flightSeat = await flightSeatRepo.findOne({
                    where: { flightSeatId: createSeatAllocationDto.flightSeatId },
                    relations: ['seat', 'flight'],
                });

                if (!flightSeat) throw new Error('FlightSeat not found');
                if (!flightSeat.isAvailable) throw new Error(`Seat ${flightSeat.seat.seatNumber} is already taken on this flight`);

                // Kiểm tra flight có khớp với bookingFlight không
                if (flightSeat.flight.flightId !== bookingFlight.flight.flightId) {
                    throw new Error('FlightSeat does not belong to the booking flight');
                }

                // 4️ Tạo seat allocation
                const newSeatAllocation = seatAllocationRepo.create({
                    flightSeat: flightSeat,
                    passenger: passenger,
                    bookingFlight: bookingFlight,
                });
                await seatAllocationRepo.save(newSeatAllocation);

                // 5️ Cập nhật trạng thái FlightSeat (QUAN TRỌNG!)
                flightSeat.isAvailable = false;
                await flightSeatRepo.save(flightSeat);

                // 6️ Cập nhật bookingFlight với số ghế
                bookingFlight.seatNumber = flightSeat.seat.seatNumber;
                await bookingFlightRepo.save(bookingFlight);

                // 7️ Giảm availableSeats trong flight
                const flight = bookingFlight.flight;
                switch (bookingFlight.travelClass) {
                    case 'Economy':
                        if (flight.availableEconomySeats > 0) flight.availableEconomySeats--;
                        break;
                    case 'Business':
                        if (flight.availableBusinessSeats > 0) flight.availableBusinessSeats--;
                        break;
                    case 'First':
                        if (flight.availableFirstClassSeats > 0) flight.availableFirstClassSeats--;
                        break;
                }
                await flightRepo.save(flight);


                response.success = true;
                response.message = 'Seat allocation created successfully';
                response.data = {
                    allocationId: newSeatAllocation.allocationId,
                    flightSeatId: flightSeat.flightSeatId,
                    seatNumber: flightSeat.seat.seatNumber,
                    flightNumber: flight.flightNumber,
                    passenger: {
                        passengerId: passenger.passengerId,
                        firstName: passenger.firstName,
                        lastName: passenger.lastName,
                    },
                };
            });
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while creating seatAllocation';
        }

        return response;
    }


}
