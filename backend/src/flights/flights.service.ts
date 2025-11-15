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
            console.log(`✅ Flight ${newFlight.flightNumber} created successfully (FlightId: ${newFlight.flightId})`);

            // Bước 2: Tự động tạo FlightSeats cho tất cả ghế của aircraft
            // Flow: Truy vấn Seats → Sao chép sang FlightSeats → isAvailable = TRUE
            const flightSeatsResult = await this.flightSeatsService.createFlightSeatsForFlight(newFlight.flightId);
            if (!flightSeatsResult.success) {
                // Log warning nhưng không fail việc tạo flight (để admin có thể fix sau)
                console.warn(`⚠️ Warning: Failed to create flight seats for flight ${newFlight.flightNumber}:`, flightSeatsResult.message);
                console.warn('   Flight was created but FlightSeats need to be created manually.');
            } else {
                console.log(`✅ FlightSeats created: ${flightSeatsResult.data?.count || 0} seats for flight ${newFlight.flightNumber}`);
            }

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
            console.log('🔍 Backend SearchFlights - Params nhận được:', {
                departureAirportCode,
                arrivalAirportCode,
                departureDate,
                minDepartureTime,
                types: {
                    departureAirportCode: typeof departureAirportCode,
                    arrivalAirportCode: typeof arrivalAirportCode,
                    departureDate: typeof departureDate,
                    minDepartureTime: typeof minDepartureTime
                }
            });

            // Debug: Kiểm tra có flights nào trong database không
            const totalFlights = await this.flightRepository.count();
            console.log('📊 Total flights in database:', totalFlights);

            // Nếu không có params, trả về empty
            if (!departureAirportCode && !arrivalAirportCode && !departureDate) {
                console.log('⚠️ No search parameters provided');
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
                // Debug: Kiểm tra airport có tồn tại không
                const depAirport = await this.airportRepository.findOne({
                    where: { airportCode: departureAirportCode }
                });
                console.log('🛫 Departure airport found:', depAirport ? `${depAirport.airportCode} - ${depAirport.airportName}` : 'NOT FOUND');

                queryBuilder.andWhere('departureAirport.airportCode = :departureAirportCode', {
                    departureAirportCode
                });
            }

            // Lọc theo arrival airport code
            if (arrivalAirportCode) {
                // Debug: Kiểm tra airport có tồn tại không
                const arrAirport = await this.airportRepository.findOne({
                    where: { airportCode: arrivalAirportCode }
                });
                console.log('🛬 Arrival airport found:', arrAirport ? `${arrAirport.airportCode} - ${arrAirport.airportName}` : 'NOT FOUND');

                queryBuilder.andWhere('arrivalAirport.airportCode = :arrivalAirportCode', {
                    arrivalAirportCode
                });
            }

            // Lọc theo departure date
            if (departureDate) {
                console.log('📅 Filtering by date:', departureDate);

                // Sử dụng SQL DATE function để so sánh chỉ phần ngày, tránh vấn đề timezone
                queryBuilder.andWhere('DATE(flight.departureTime) = :departureDate', {
                    departureDate
                });

                // Debug: Check flights on that date
                const dateCheckQuery = this.flightRepository
                    .createQueryBuilder('f')
                    .select(['f.flightNumber', 'f.departureTime'])
                    .where('DATE(f.departureTime) = :date', { date: departureDate });
                const flightsOnDate = await dateCheckQuery.getRawMany();
                console.log(`📊 All flights on ${departureDate}:`, flightsOnDate);
            }

            // Lọc theo thời gian khởi hành tối thiểu (dùng để filter chuyến về sau thời gian đến của chuyến đi)
            if (minDepartureTime) {
                console.log('⏰ Filtering by min departure time:', minDepartureTime);
                
                // Parse minDepartureTime thành Date để so sánh chính xác
                const minTime = new Date(minDepartureTime);
                if (!isNaN(minTime.getTime())) {
                    // Sử dụng thời gian chính xác (bao gồm cả giờ, phút, giây)
                    queryBuilder.andWhere('flight.departureTime > :minDepartureTime', {
                        minDepartureTime: minTime
                    });
                    console.log('✅ Applied min departure time filter:', minTime.toISOString());
                } else {
                    console.warn('⚠️ Invalid minDepartureTime format:', minDepartureTime);
                }
            }

            // Sắp xếp theo thời gian khởi hành
            queryBuilder.orderBy('flight.departureTime', 'ASC');

            // Debug: Log SQL query
            const sql = queryBuilder.getSql();
            const parameters = queryBuilder.getParameters();
            console.log('🔍 SQL Query:', sql);
            console.log('📋 Parameters:', parameters);

            const flights = await queryBuilder.getMany();

            // Debug: Log chi tiết từng flight tìm được
            if (flights.length > 0) {
                console.log(`✅ Found ${flights.length} flight(s):`);
                flights.forEach(flight => {
                    console.log(`  - ${flight.flightNumber}: ${flight.departureAirport?.airportCode} -> ${flight.arrivalAirport?.airportCode} at ${flight.departureTime}`);
                });
            } else {
                console.log('❌ No flights match the criteria');

                // Suggest alternative dates
                if (departureAirportCode && arrivalAirportCode) {
                    try {
                        const alternativeQuery = this.flightRepository
                            .createQueryBuilder('f')
                            .leftJoin('f.departureAirport', 'dep')
                            .leftJoin('f.arrivalAirport', 'arr')
                            .where('dep.airportCode = :depCode', { depCode: departureAirportCode })
                            .andWhere('arr.airportCode = :arrCode', { arrCode: arrivalAirportCode })
                            .select('DISTINCT DATE(f.departureTime)', 'date')
                            .orderBy('DATE(f.departureTime)', 'ASC')
                            .limit(5);

                        const alternatives = await alternativeQuery.getRawMany();
                        if (alternatives.length > 0) {
                            console.log('💡 Gợi ý các ngày có chuyến bay:');
                            alternatives.forEach(alt => {
                                console.log(`  - ${alt.date}`);
                            });
                        }
                    } catch (err) {
                        console.log('⚠️ Could not fetch alternative dates:', err.message);
                    }
                }
            }

            response.success = true;
            response.message = flights.length > 0 ? 'Flights retrieved successfully' : 'No flights found for the selected criteria';
            response.data = flights;

        } catch (error) {
            console.error('❌ Error searching flights:', error);
            response.success = false;
            response.message = error.message || 'Error while searching flights';
        }

        return response;
    }

}
