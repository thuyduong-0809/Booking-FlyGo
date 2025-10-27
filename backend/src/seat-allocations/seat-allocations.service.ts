import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingFlight } from 'src/booking-flights/entities/booking-flights.entity';
import { Flight } from 'src/flights/entities/flights.entity';
import { Passenger } from 'src/passengers/entities/passengers.entity';
import { CreateSeatAllocationDto } from 'src/seat-allocations/dto/seat-allocation.dto';
import { SeatAllocation } from 'src/seat-allocations/entities/seat-allocations.entity';
import { Seat } from 'src/seats/entities/seats.entity';
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


    ) { }


    async findAll(): Promise<any> {
        let response = { ...common_response }
        try {
            const seatAllocations = await this.seatAllocationRepository.find({
                relations: ['seat', 'passenger', 'bookingFlight']
            });

            response.success = true;
            response.message = ' seatAllocations retrieved successfully';
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

                // 3️⃣ Nếu user không chọn seatId -> tự động chọn
                let seat: Seat | null = null;

                if (createSeatAllocationDto.seatId) {
                    seat = await seatRepo.findOne({
                        where: { seatId: createSeatAllocationDto.seatId },
                    });
                    if (!seat) throw new Error('Seat not found');
                    if (!seat.isAvailable) throw new Error(`Seat ${seat.seatNumber} is already taken`);
                } else {
                    // ✅ Lấy toàn bộ ghế trống cùng hạng và máy bay
                    const availableSeats = await seatRepo.find({
                        where: {
                            isAvailable: true,
                            travelClass: bookingFlight.travelClass,
                            aircraft: { aircraftId: bookingFlight.flight.aircraft.aircraftId },
                        },
                        order: { seatNumber: 'ASC' }, // ⚡ ghế tăng dần E01A, E02A,...
                    });

                    if (!availableSeats.length) throw new Error('No available seats left in this class');

                    // ✅ Kiểm tra nếu cùng booking có người khác đã chọn ghế
                    const existingAllocations = await seatAllocationRepo.find({
                        where: { bookingFlight: { bookingFlightId: bookingFlight.bookingFlightId } },
                        relations: ['seat'],
                        order: { seat: { seatNumber: 'ASC' } },
                    });

                    if (existingAllocations.length > 0) {
                        // Lấy seat cuối cùng đã chọn → gán seat kế tiếp
                        const lastSeatNumber = existingAllocations[existingAllocations.length - 1].seat.seatNumber;

                        // tìm ghế kế tiếp trong danh sách available
                        const nextSeat = availableSeats.find((s) => s.seatNumber > lastSeatNumber);
                        seat = nextSeat || availableSeats[0]; // fallback: nếu hết ghế sau -> lấy ghế đầu
                    } else {
                        // chưa ai chọn ghế -> lấy ghế đầu tiên
                        seat = availableSeats[0];
                    }
                }

                // 4️⃣ Tạo seat allocation
                const newSeatAllocation = seatAllocationRepo.create({
                    ...createSeatAllocationDto,
                    seat,
                    passenger,
                    bookingFlight,
                });
                await seatAllocationRepo.save(newSeatAllocation);

                // 5️⃣ Cập nhật trạng thái seat & bookingFlight
                seat.isAvailable = false;
                bookingFlight.seatNumber = seat.seatNumber;
                await seatRepo.save(seat);
                await bookingFlightRepo.save(bookingFlight);

                // 6️⃣ Giảm availableSeats trong flight
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

                // ✅ Hoàn tất
                response.success = true;
                response.message = 'Seat allocation created successfully';
                response.data = {
                    allocationId: newSeatAllocation.allocationId,
                    seat: { seatNumber: seat.seatNumber },
                    bookingFlight: { seatNumber: bookingFlight.seatNumber },
                    passenger,
                };
            });
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while creating seatAllocation';
        }

        return response;
    }


}
