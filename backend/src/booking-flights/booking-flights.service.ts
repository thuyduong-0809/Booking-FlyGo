import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Aircraft } from 'src/aircrafts/entities/aircrafts.entity';
import { CreateBookingFlightDto } from 'src/booking-flights/dto/create-bookingFlight.dto';
import { BookingFlight } from 'src/booking-flights/entities/booking-flights.entity';
import { Booking } from 'src/bookings/entities/bookings.entity';
import { Flight } from 'src/flights/entities/flights.entity';
import { Passenger } from 'src/passengers/entities/passengers.entity';
import { SeatAllocation } from 'src/seat-allocations/entities/seat-allocations.entity';
import { Seat } from 'src/seats/entities/seats.entity';
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

    @InjectRepository(Seat)
    private seatRepository: Repository<Seat>,

    @InjectRepository(SeatAllocation)
    private seatAllocationRepository: Repository<SeatAllocation>

    
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
    await this.bookingFlightRepository.manager.transaction(async (manager) => {
      const bookingRepo = manager.getRepository(Booking);
      const flightRepo = manager.getRepository(Flight);
      const bookingFlightRepo = manager.getRepository(BookingFlight);
      const seatRepo = manager.getRepository(Seat);
      const seatAllocationRepo = manager.getRepository(SeatAllocation);
      const passengerRepo = manager.getRepository(Passenger);

      const { bookingId, flightId, travelClass, baggageAllowance, seatNumber, passengerId } = createBookingFlightDto;

      // 1️⃣ Kiểm tra Booking và Flight
      const booking = await bookingRepo.findOneBy({ bookingId });
      const flight = await flightRepo.findOne({
        where: { flightId },
        relations: ['aircraft'],
      });

      if (!booking || !flight) throw new Error('Booking hoặc Flight không tồn tại');

      // 2️⃣ Xác định giá vé theo hạng ghế
      let fare = 0;
      switch (travelClass) {
        case 'Economy':
          if (flight.availableEconomySeats <= 0) throw new Error('Không còn ghế Economy trống');
          fare = Number(flight.economyPrice);
          break;
        case 'Business':
          if (flight.availableBusinessSeats <= 0) throw new Error('Không còn ghế Business trống');
          fare = Number(flight.businessPrice);
          break;
        case 'First':
          if (flight.availableFirstClassSeats <= 0) throw new Error('Không còn ghế First trống');
          fare = Number(flight.firstClassPrice);
          break;
        default:
          throw new Error('Hạng ghế không hợp lệ');
      }

      // 3️⃣ Tạo BookingFlight
      const newBookingFlight = bookingFlightRepo.create({
        booking,
        flight,
        travelClass,
        fare,
        baggageAllowance,
        seatNumber
      });
      await bookingFlightRepo.save(newBookingFlight);

      // 4️⃣ Nếu có passengerId -> tạo SeatAllocation tự động
      if (passengerId) {
        // lấy passenger
        const passenger = await passengerRepo.findOneBy({ passengerId });
        if (!passenger) throw new Error('Passenger not found');

        // nếu seatNumber chưa có → chọn tự động
        let seat: Seat | null = null;
        if (seatNumber) {
          seat = await seatRepo.findOne({ where: { seatNumber, aircraft: { aircraftId: flight.aircraft.aircraftId } } });
          if (!seat) throw new Error(`Seat ${seatNumber} not found`);
          if (!seat.isAvailable) throw new Error(`Seat ${seatNumber} is already taken`);
        } else {
          // chọn ghế trống đầu tiên trong cùng hạng
          seat = await seatRepo.findOne({
            where: {
              isAvailable: true,
              travelClass,
              aircraft: { aircraftId: flight.aircraft.aircraftId },
            },
            order: { seatNumber: 'ASC' },
          });
          if (!seat) throw new Error(`No available seats left in ${travelClass}`);
        }

        // tạo seat allocation
        const newSeatAllocation = seatAllocationRepo.create({
          seat,
          bookingFlight: newBookingFlight,
          passenger,
        });
        await seatAllocationRepo.save(newSeatAllocation);

        // cập nhật trạng thái ghế & bookingFlight
        seat.isAvailable = false;
        newBookingFlight.seatNumber = seat.seatNumber;
        await seatRepo.save(seat);
        await bookingFlightRepo.save(newBookingFlight);

        // giảm availableSeats trong flight
        switch (travelClass) {
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
      }

      // 5️⃣ Cập nhật tổng tiền của booking
      booking.totalAmount = Number(booking.totalAmount ?? 0) + fare;
      await bookingRepo.save(booking);

      response.success = true;
      response.message = 'BookingFlight + SeatAllocation created successfully';
      response.data = {
        bookingFlight: newBookingFlight,
      };
    });
  } catch (error) {
    console.error('❌ Transaction Error:', error);
    response.success = false;
    response.message = error.message || 'Error while creating BookingFlight and SeatAllocation';
  }

  return response;
}


    async delete(id: number): Promise<any> {
    const response = { ...common_response };

    try {
        const bookingFlight = await this.bookingFlightRepository.findOne({
        where: { bookingFlightId: id },
        relations: ['flight', 'flight.aircraft', 'booking'],
        });

        if (!bookingFlight) {
        response.success = false;
        response.message = 'Booking flight không tồn tại';
        return response;
        }
        const flight = bookingFlight.flight
        const booking = bookingFlight.booking;
        // 2️⃣ Cộng lại ghế trống
        if(bookingFlight.seatNumber){
               switch (bookingFlight.travelClass) {
                case 'Economy':
                    flight.availableEconomySeats++;
                    break;
                case 'Business':
                    flight.availableBusinessSeats++;
                    break;
                case 'First':
                    flight.availableFirstClassSeats++;
                    break;
                }

        }
        // Trừ lại tổng tiền trong booking
        booking.totalAmount = Number(booking.totalAmount) - Number(bookingFlight.fare);
        if (booking.totalAmount < 0) booking.totalAmount = 0;

        // Cập nhật ghế thành available = true
       if (bookingFlight.seatNumber) {
        const seat = await this.seatRepository.findOne({
            where: {
            seatNumber: bookingFlight.seatNumber,
            aircraft: { aircraftId: flight.aircraft.aircraftId },
            },
            relations: ['aircraft'],
        });

        if (seat) {
            seat.isAvailable = true;
            await this.seatRepository.save(seat);
        }
        }
        //Lưu thay đổi
        await this.flightRepository.save(flight);
        await this.bookingRepository.save(booking);

        //Xóa BookingFlight
        await this.bookingFlightRepository.delete({ bookingFlightId: id });

        //Trả về kết quả
        response.success = true;
        response.message = 'Booking flight deleted successfully';
        response.data = {
        bookingId: booking.bookingId,
        flightId: flight.flightId,
        updatedTotalAmount: booking.totalAmount,
        seatFreed: bookingFlight.seatNumber,
        };
    } catch (error) {
        console.error(error);
        response.success = false;
        response.message = error.message || 'Error while deleting Booking flight';
    }

    return response;
    }



    async findByBookingId(id: number): Promise<any> {
        let response = { ...common_response };
        try {
            const bookingFlights = await this.bookingFlightRepository.find({
            where: {booking: { bookingId: id } },
            relations: ['booking'],
            });

            if(bookingFlights.length > 0) {
            response.success = true;
            response.data = bookingFlights;
            response.message = 'Successfully retrieved bookingFlights for this booking';
            } else {
            response.success = false;
            response.message = 'No bookingFlights found for this booking';
            response.errorCode = 'BOOKINGFLIGHTS_EXISTS';
            }
        } catch (error) {
            console.error(error);
            response.success = false;
            response.message = 'Error while retrieving bookingFlights by bookingID';
        }
        return response;
        }




}


