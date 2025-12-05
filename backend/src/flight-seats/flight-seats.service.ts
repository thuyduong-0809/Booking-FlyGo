import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Flight } from 'src/flights/entities/flights.entity';
import { Seat } from 'src/seats/entities/seats.entity';
import { FlightSeat } from 'src/flight-seats/entities/flight-seats.entity';
import { common_response } from 'src/untils/common';
import { Repository } from 'typeorm';

@Injectable()
export class FlightSeatsService {
    constructor(
        @InjectRepository(FlightSeat)
        private flightSeatRepository: Repository<FlightSeat>,
        @InjectRepository(Flight)
        private flightRepository: Repository<Flight>,
        @InjectRepository(Seat)
        private seatRepository: Repository<Seat>,
    ) { }

    /**
     * Tạo FlightSeats cho một Flight mới
     * Lấy tất cả ghế của aircraft và tạo FlightSeat cho mỗi ghế với isAvailable = true
     */
    async createFlightSeatsForFlight(flightId: number): Promise<any> {
        const response = { ...common_response };
        try {
            // Bước 1: Lấy thông tin flight và aircraft
            const flight = await this.flightRepository.findOne({
                where: { flightId },
                relations: ['aircraft'],
            });

            if (!flight) {
                response.success = false;
                response.message = 'Flight not found';
                return response;
            }

            if (!flight.aircraft) {
                response.success = false;
                response.message = 'Aircraft not found for this flight';
                return response;
            }

            // Bước 2: Truy vấn toàn bộ Seats của máy bay tương ứng
            const seats = await this.seatRepository.find({
                where: { aircraft: { aircraftId: flight.aircraft.aircraftId } },
                order: { seatId: 'ASC' }, // Sắp xếp theo seatId để đảm bảo thứ tự tăng dần 1,2,3,...
            });

            if (seats.length === 0) {
                response.success = false;
                response.message = `No seats found for aircraft ${flight.aircraft.aircraftCode || flight.aircraft.aircraftId}`;
                return response;
            }

            // Bước 3: Kiểm tra xem đã có FlightSeats cho flight này chưa (tránh duplicate)
            const existingFlightSeats = await this.flightSeatRepository.find({
                where: { flight: { flightId } },
            });

            if (existingFlightSeats.length > 0) {
                response.success = true;
                response.message = `Flight already has ${existingFlightSeats.length} flight seats`;
                response.data = { count: existingFlightSeats.length, skipped: true };
                return response;
            }

            // Bước 4: Sao chép danh sách ghế sang FlightSeats
            // Từng ghế được đánh dấu isAvailable = TRUE
            const flightSeats = seats.map((seat) =>
                this.flightSeatRepository.create({
                    flight: flight,
                    seat: seat,
                    isAvailable: true, // Mặc định tất cả ghế đều available
                }),
            );

            // Bước 5: Lưu tất cả FlightSeats vào database
            await this.flightSeatRepository.save(flightSeats);

            response.success = true;
            response.message = `Created ${flightSeats.length} flight seats successfully`;
            response.data = {
                count: flightSeats.length,
                flightNumber: flight.flightNumber,
                aircraftId: flight.aircraft.aircraftId,
            };
            return response;
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error creating flight seats';
            return response;
        }
    }

    /**
     * Lấy tất cả FlightSeats của một Flight
     */
    async findByFlight(flightId: number): Promise<any> {
        const response = { ...common_response };
        try {
            const flightSeats = await this.flightSeatRepository.find({
                where: { flight: { flightId } },
                relations: ['seat', 'flight', 'flight.aircraft'],
            });

            response.success = true;
            response.message = 'Flight seats retrieved successfully';
            response.data = flightSeats;
            return response;
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error retrieving flight seats';
            return response;
        }
    }

    /**
     * Lấy FlightSeat theo flightId và seatId
     */
    async findByFlightAndSeat(flightId: number, seatId: number): Promise<any> {
        const response = { ...common_response };
        try {
            const flightSeat = await this.flightSeatRepository.findOne({
                where: {
                    flight: { flightId },
                    seat: { seatId },
                },
                relations: ['seat', 'flight'],
            });

            if (!flightSeat) {
                response.success = false;
                response.message = 'Flight seat not found';
                return response;
            }

            response.success = true;
            response.message = 'Flight seat retrieved successfully';
            response.data = flightSeat;
            return response;
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error retrieving flight seat';
            return response;
        }
    }

    /**
     * Cập nhật trạng thái isAvailable của một FlightSeat
     */
    async updateAvailability(
        flightId: number,
        seatId: number,
        isAvailable: boolean,
    ): Promise<any> {
        const response = { ...common_response };
        try {
            const flightSeat = await this.flightSeatRepository.findOne({
                where: {
                    flight: { flightId },
                    seat: { seatId },
                },
            });

            if (!flightSeat) {
                response.success = false;
                response.message = 'Flight seat not found';
                return response;
            }

            flightSeat.isAvailable = isAvailable;
            await this.flightSeatRepository.save(flightSeat);

            response.success = true;
            response.message = 'Flight seat availability updated successfully';
            response.data = flightSeat;
            return response;
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error updating flight seat availability';
            return response;
        }
    }

    /**
     * Cập nhật trạng thái isAvailable cho tất cả FlightSeats của một ghế cụ thể
     * Được gọi khi cập nhật trạng thái hoạt động của ghế trong bảng Seats
     */
    async updateAvailabilityBySeat(
        seatId: number,
        isAvailable: boolean,
    ): Promise<any> {
        const response = { ...common_response };
        try {
            const updateResult = await this.flightSeatRepository.update(
                { seat: { seatId } },
                { isAvailable }
            );

            response.success = true;
            response.message = `Updated availability for ${updateResult.affected || 0} flight seats`;
            response.data = {
                affectedFlightSeats: updateResult.affected || 0,
                seatId,
                isAvailable
            };
            return response;
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error updating flight seats availability by seat';
            return response;
        }
    }

    /**
     * Lấy danh sách ghế available của một Flight theo travelClass
     */
    async findAvailableSeatsByClass(
        flightId: number,
        travelClass: string,
    ): Promise<any> {
        const response = { ...common_response };
        try {
            const flightSeats = await this.flightSeatRepository.find({
                where: {
                    flight: { flightId },
                    seat: { travelClass },
                    isAvailable: true,
                },
                relations: ['seat'],
            });

            response.success = true;
            response.message = 'Available seats retrieved successfully';
            response.data = flightSeats;
            return response;
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error retrieving available seats';
            return response;
        }
    }

    /**
     * Reset auto-increment của FlightSeatId về 1
     */
    async resetFlightSeatAutoIncrement(): Promise<any> {
        const response = { ...common_response };
        try {
            const maxResult = await this.flightSeatRepository.manager.query(
                'SELECT MAX(flightSeatId) AS maxId FROM FlightSeats',
            );
            const maxFlightSeatId = maxResult[0]?.maxId || 0;

            await this.flightSeatRepository.manager.query(
                'ALTER TABLE FlightSeats AUTO_INCREMENT = 1',
            );

            response.success = true;
            response.message = 'Auto-increment của FlightSeats đã được reset về 1';
            response.data = {
                maxFlightSeatId,
                newAutoIncrement: 1,
            };
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while resetting FlightSeats auto-increment';
        }
        return response;
    }
}

