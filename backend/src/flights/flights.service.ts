import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Aircraft } from 'src/aircrafts/entities/aircrafts.entity';
import { Airline } from 'src/airlines/entities/airlines.entity';
import { Airport } from 'src/airports/entities/airports.entity';
import { CreateFlightDto } from 'src/flights/dto/create-flight.dto';
import { UpdateFlightDto } from 'src/flights/dto/update-flight.dto';
import { Flight } from 'src/flights/entities/flights.entity';
import { Terminal } from 'src/terminals/entities/terminals.entity';
import { common_response } from 'src/untils/common';
import { Repository } from 'typeorm';
import { FlightSeatsService } from 'src/flight-seats/flight-seats.service';

@Injectable()
export class FlightsService {
    constructor(
        @InjectRepository(Flight) private flightRepository: Repository<Flight>,
        @InjectRepository(Airline) private airlineRepository: Repository<Airline>,
        @InjectRepository(Airport) private airportRepository: Repository<Airport>,
        @InjectRepository(Aircraft) private aircraftRepository: Repository<Aircraft>,
        @InjectRepository(Terminal) private terminalRepository: Repository<Terminal>,
        @Inject(forwardRef(() => FlightSeatsService))
        private flightSeatsService: FlightSeatsService,
    ) { }

    async findAll(): Promise<any> {
        let response = { ...common_response }
        try {
            const flights = await this.flightRepository.find({
                relations: ['airline', 'departureAirport', 'arrivalAirport', 'aircraft', 'departureTerminal', 'arrivalTerminal']
            });

            response.success = true;
            response.message = 'Flights retrieved successfully';
            response.data = flights;

        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error retrieving flights';
        }
        return response;
    }

    async findOne(id: number): Promise<any> {
        let response = { ...common_response }
        try {
            const flight = await this.flightRepository.findOne({
                where: { flightId: id },
                relations: ['airline', 'departureAirport', 'arrivalAirport', 'aircraft', 'departureTerminal', 'arrivalTerminal']
            });
            if (!flight) {
                response.success = false;
                response.message = 'Flight not found';
                return response;
            }
            response.success = true;
            response.message = 'Flight retrieved successfully';
            response.data = flight;
            return response;
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error retrieving flight';
            return response;
        }

    }

    async create(createFlightDto: CreateFlightDto): Promise<any> {
        let response = { ...common_response }
        try {
            const flightNumberExisting = await this.flightRepository.findOne({ where: { flightNumber: createFlightDto.flightNumber } })
            if (flightNumberExisting) {
                response.success = false;
                response.message = 'flight number duplicate';
                response.errorCode = 'FLIGHT_EXISTS';
                // return response;
            }
            const airline = await this.airlineRepository.findOne({ where: { airlineId: createFlightDto.airlineId } });
            if (!airline) {
                response.success = false;
                response.message = 'Airline not found';
                return response;
            }
            const departureAirport = await this.airportRepository.findOne({ where: { airportId: createFlightDto.departureAirportId } });
            if (!departureAirport) {
                response.success = false;
                response.message = 'Departure Airport not found';
                return response;
            }
            const arrivalAirport = await this.airportRepository.findOne({ where: { airportId: createFlightDto.arrivalAirportId } });
            if (!arrivalAirport) {
                response.success = false;
                response.message = 'Arrival Airport not found';
                return response;
            }

            const terminalDeparture = await this.terminalRepository.findOne({ where: { terminalId: createFlightDto.departureTerminalId } });
            if (!terminalDeparture) {
                response.success = false;
                response.message = 'Departure Terminal not found';
                return response;
            }
            const terminalArrival = await this.terminalRepository.findOne({ where: { terminalId: createFlightDto.arrivalTerminalId } });
            if (!terminalArrival) {
                response.success = false;
                response.message = 'Arrival Terminal not found';
                return response;
            }
            const aircraft = await this.aircraftRepository.findOne({ where: { aircraftId: createFlightDto.aircraftId } });
            if (!aircraft) {
                response.success = false;
                response.message = 'Aircraft not found';
                return response;
            }
            const newFlight = this.flightRepository.create({
                ...createFlightDto,
                airline: airline,
                departureAirport: departureAirport,
                arrivalAirport: arrivalAirport,
                departureTerminal: terminalDeparture,
                arrivalTerminal: terminalArrival,
                aircraft: aircraft
            });
            // Bước 1: Lưu chuyến bay vào bảng Flights
            await this.flightRepository.save(newFlight);

            // Bước 2: Tự động tạo FlightSeats cho tất cả ghế của aircraft
            // Flow: Truy vấn Seats → Sao chép sang FlightSeats → isAvailable = TRUE
            const flightSeatsResult = await this.flightSeatsService.createFlightSeatsForFlight(newFlight.flightId);
            response.success = true;
            response.message = 'Flight created successfully';
            response.data = {
                ...newFlight,
                flightSeatsCreated: flightSeatsResult.success,
                flightSeatsCount: flightSeatsResult.data?.count || 0,
            };
            return response;
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error creating flight';
            return response;
        }
    }

    /**
     * Reset auto-increment flightId về 1
     */
    async resetFlightAutoIncrement(): Promise<any> {
        const response = { ...common_response };
        try {
            const maxResult = await this.flightRepository.manager.query(
                'SELECT MAX(flightId) as maxId FROM Flights',
            );
            const maxFlightId = maxResult[0]?.maxId || 0;

            await this.flightRepository.manager.query(
                'ALTER TABLE Flights AUTO_INCREMENT = 1',
            );

            response.success = true;
            response.message = 'Auto-increment của Flights đã được reset về 1';
            response.data = {
                maxFlightId,
                newAutoIncrement: 1,
            };
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while resetting Flights auto-increment';
        }
        return response;
    }

    async update(id: number, updateFlightDto: UpdateFlightDto): Promise<any> {
        let response = { ...common_response }
        try {
            const flight = await this.flightRepository.findOne({ where: { flightId: id } });
            if (!flight) {
                response.success = false;
                response.message = 'Flight not found';
                return response;
            }
            const terminalDeparture = await this.terminalRepository.findOne({ where: { terminalId: updateFlightDto.departureTerminalId } });
            if (!terminalDeparture) {
                response.success = false;
                response.message = 'Departure Terminal not found';
                return response;
            }
            const terminalArrival = await this.terminalRepository.findOne({ where: { terminalId: updateFlightDto.arrivalTerminalId } });
            if (!terminalArrival) {
                response.success = false;
                response.message = 'Arrival Terminal not found';
                return response;
            }
            const aircraft = await this.aircraftRepository.findOne({ where: { aircraftId: updateFlightDto.aircraftId } });
            if (!aircraft) {
                response.success = false;
                response.message = 'Aircraft not found';
                return response;
            }
            const updateResult = await this.flightRepository.update(id, {
                ...updateFlightDto,
                aircraft: aircraft,
                arrivalTerminal: terminalArrival,
                departureTerminal: terminalDeparture,
            });
            if (updateResult.affected && updateResult.affected > 0) {
                response.success = true;
                response.message = 'Flight updated successfully';
            } else {
                response.success = false;
                response.message = 'Flight not found or no changes made';
            }
            return response;

        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error updating flight';
            return response;
        }
    }

    async delete(id: number): Promise<any> {
        let response = { ...common_response }
        try {
            const deleteResult = await this.flightRepository.delete(id);
            if (deleteResult.affected && deleteResult.affected > 0) {
                response.success = true;
                response.message = 'Flight deleted successfully';
            } else {
                response.success = false;
                response.message = 'Flight not found';
            }
            return response;
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error deleting flight';
            return response;
        }
    }

    async generateFlightNumber(airlineId: number): Promise<any> {
        const response = { ...common_response }

        try {
            // 1️Tìm hãng hàng không
            const airline = await this.airlineRepository.findOne({ where: { airlineId } });
            if (!airline) {
                response.message = 'Airline not found';
                return response;
            }

            const airlineCode = airline.airlineCode || 'XX';

            // 2️⃣ Tìm chuyến bay gần nhất của hãng đó
            const lastFlight = await this.flightRepository
                .createQueryBuilder('flight')
                .where('flight.airlineId = :airlineId', { airlineId })
                .orderBy('flight.flightId', 'DESC')
                .getOne();

            // 3️⃣ Sinh số thứ tự mới
            let nextNumber = 1;
            if (lastFlight && lastFlight.flightNumber) {
                const match = lastFlight.flightNumber.match(/\d+$/);
                if (match) {
                    nextNumber = parseInt(match[0]) + 1;
                }
            }

            // 4️⃣ Format kiểu VN001, VN002, ...
            const newFlightNumber = `${airlineCode}${nextNumber.toString().padStart(3, '0')}`;

            response.success = true;
            response.message = 'Generated flight number successfully';
            response.data = { flightNumber: newFlightNumber };

            return response;
        } catch (error) {
            response.message = error.message;
            return response;
        }
    }

    async searchFlights(departureAirportCode?: string, arrivalAirportCode?: string, departureDate?: string, minDepartureTime?: string): Promise<any> {
        const response = { ...common_response };

        try {
            // Nếu không có params, trả về empty
            if (!departureAirportCode && !arrivalAirportCode && !departureDate) {
                response.success = true;
                response.message = 'No search parameters provided';
                response.data = [];
                return response;
            }

            // Xây dựng query builder
            const queryBuilder = this.flightRepository
                .createQueryBuilder('flight')
                .leftJoinAndSelect('flight.airline', 'airline')
                .leftJoinAndSelect('flight.departureAirport', 'departureAirport')
                .leftJoinAndSelect('flight.arrivalAirport', 'arrivalAirport')
                .leftJoinAndSelect('flight.aircraft', 'aircraft')
                .leftJoinAndSelect('flight.departureTerminal', 'departureTerminal')
                .leftJoinAndSelect('flight.arrivalTerminal', 'arrivalTerminal');

            // Lọc theo departure airport code
            if (departureAirportCode) {
                queryBuilder.andWhere('departureAirport.airportCode = :departureAirportCode', {
                    departureAirportCode
                });
            }

            // Lọc theo arrival airport code
            if (arrivalAirportCode) {
                queryBuilder.andWhere('arrivalAirport.airportCode = :arrivalAirportCode', {
                    arrivalAirportCode
                });
            }

            // Lọc theo departure date
            if (departureDate) {

                // Sử dụng SQL DATE function để so sánh chỉ phần ngày, tránh vấn đề timezone
                queryBuilder.andWhere('DATE(flight.departureTime) = :departureDate', {
                    departureDate
                });
            }

            // Lọc theo thời gian khởi hành tối thiểu (dùng để filter chuyến về sau thời gian đến của chuyến đi)
            if (minDepartureTime) {

                // Parse minDepartureTime thành Date để so sánh chính xác
                const minTime = new Date(minDepartureTime);
                if (!isNaN(minTime.getTime())) {
                    // Sử dụng thời gian chính xác (bao gồm cả giờ, phút, giây)
                    queryBuilder.andWhere('flight.departureTime > :minDepartureTime', {
                        minDepartureTime: minTime
                    });
                } else {
                }
            }

            // Sắp xếp theo thời gian khởi hành
            queryBuilder.orderBy('flight.departureTime', 'ASC');

            const flights = await queryBuilder.getMany();

            response.success = true;
            response.message = flights.length > 0 ? 'Flights retrieved successfully' : 'No flights found for the selected criteria';
            response.data = flights;

        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error while searching flights';
        }

        return response;
    }

}
