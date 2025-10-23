import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBookingFlightDto } from 'src/booking-flights/dto/create-bookingFlight.dto';
import { BookingFlight } from 'src/booking-flights/entities/booking-flights.entity';
import { Booking } from 'src/bookings/entities/bookings.entity';
import { Flight } from 'src/flights/entities/flights.entity';
import { common_response } from 'src/untils/common';
import { Repository } from 'typeorm';

@Injectable()
export class BookingFlightsService {

    constructor(
    @InjectRepository(BookingFlight)
    private bookingFlightRepository: Repository<BookingFlight>,

    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,

    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

    async findAll() : Promise<any>{
        const response = {...common_response}
        try {
            const bookingFlights = await this.bookingFlightRepository.find({
                relations: ['flight','booking'],
            });
                response.success = true
                response.data = bookingFlights
                response.message = 'Successfully retrieved the list of  bookingFlights';
        } catch (error) {
              console.error(error);
              response.success = false;
              response.message = 'Error while fetching the list of bookingFlights';
        }
        return response;
    }


    async create(createBookingFlightDto: CreateBookingFlightDto): Promise<any> {
        const response = { ...common_response };
        try {
        const { bookingId, flightId, travelClass, baggageAllowance, seatNumber } = createBookingFlightDto;
        const booking = await this.bookingRepository.findOneBy({ bookingId });
        const flight = await this.flightRepository.findOneBy({ flightId });

        if (!booking || !flight) {
            response.success = false;
            response.message = 'Booking hoặc Flight không tồn tại';
            return response;
        }

        // Xác định giá vé theo hạng ghế
        let fare = 0;
        switch (travelClass) {
            case 'Economy':
            fare = Number(flight.economyPrice);
            break;
            case 'Business':
            fare = Number(flight.businessPrice);
            break;
            case 'First':
            fare = Number(flight.firstClassPrice);
            break;
        }

        const newBookingFlight = this.bookingFlightRepository.create({
            booking,
            flight,
            travelClass,
            fare,
            baggageAllowance,
            seatNumber,
        });

        await this.bookingFlightRepository.save(newBookingFlight);

        response.success = true;
        response.message = 'BookingFlight created successfully';
        response.data = newBookingFlight;
        } catch (error) {
        console.error(error);
        response.success = false;
        response.message = error.message || 'Error while creating BookingFlight';
        }

        return response;
    }
}


