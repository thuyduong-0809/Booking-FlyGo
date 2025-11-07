import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingFlight } from 'src/booking-flights/entities/booking-flights.entity';
import { CreateCheckInDto } from 'src/check-ins/dto/create-check-in.dto';
import { CheckIn } from 'src/check-ins/entities/check-ins.entity';
import { Passenger } from 'src/passengers/entities/passengers.entity';
import { common_response } from 'src/untils/common';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';

@Injectable()
export class CheckInsService {
 constructor(@InjectRepository(CheckIn) private checkinRepository: Repository<CheckIn>,
         @InjectRepository(Passenger) private passengerRepository: Repository<Passenger>,
        @InjectRepository(BookingFlight) private bookingFlightRepository: Repository<BookingFlight>,
    ) { }

        async findAll(): Promise<any> {
        let response = { ...common_response }
        try {
            const checkins = await this.checkinRepository.find({
            relations: [
                'passenger',
                'bookingFlight',
                'bookingFlight.booking', //thêm quan hệ cha Booking
                'bookingFlight.flight',  //thêm quan hệ cha Flight
                'bookingFlight.flight.departureAirport', // ✈️ thêm sân bay đi
                'bookingFlight.flight.arrivalAirport',   // 🛬 thêm sân bay đến
            ],
            order: { checkInId: 'DESC' }, // tuỳ chọn
            });

            response.success = true;
            response.message = 'Checkins retrieved successfully';
            response.data = checkins;

        } catch (error) {
            response.success = false;
            response.message = error.message || 'Error retrieving checkins';
        }
        return response;
        }


    //    async create(createCheckInDto: CreateCheckInDto): Promise<any> {
    //     let response = { ...common_response };
    //     try {
    //         const bookingFlight = await this.bookingFlightRepository.findOne({
    //         where: { bookingFlightId: createCheckInDto.bookingFlightId },
    //         relations: ['flight', 'booking'],
    //         });

    //         if (!bookingFlight) {
    //         return { success: false, message: 'bookingFlight not found' };
    //         }

    //         const passenger = await this.passengerRepository.findOne({
    //         where: { passengerId: createCheckInDto.passengerId },
    //         });

    //         if (!passenger) {
    //         return { success: false, message: 'passenger not found' };
    //         }

    //         // ✅ 1. Tạo mới checkin
    //         const newCheckin = this.checkinRepository.create({
    //         ...createCheckInDto,
    //         bookingFlight,
    //         passenger,
    //         });
    //         await this.checkinRepository.save(newCheckin);

    //         // ✅ 2. Giả lập sinh boarding pass URL (tạm thời tạo link giả)
    //         const boardingPassUrl = `https://example.com/boarding-pass/${newCheckin.checkInId}.pdf`;
    //         newCheckin.boardingPassUrl = boardingPassUrl;
    //         await this.checkinRepository.save(newCheckin);

    //         // ✅ 3. Trả response
    //         response.success = true;
    //         response.message = 'Check-in created successfully';
    //         response.statusCode = 201;
    //         response.data = newCheckin;
    //         return response;
    //     } catch (error) {
    //         response.success = false;
    //         response.message = error.message || 'Error creating checkin';
    //         return response;
    //     }
    //     }


    async create(createCheckInDto: CreateCheckInDto): Promise<any> {
    let response = { ...common_response };
    try {
      // 1️⃣ Lấy dữ liệu liên quan
      const bookingFlight = await this.bookingFlightRepository.findOne({
        where: { bookingFlightId: createCheckInDto.bookingFlightId },
        relations: ['flight', 'booking', 'flight.departureAirport', 'flight.arrivalAirport'],
      });
      if (!bookingFlight) {
        response.success = false;
        response.message = 'BookingFlight not found';
        response.errorCode = 'BOOKINGFLIGHT_NOT_EXIST';
        return response;
      }

      const passenger = await this.passengerRepository.findOne({
        where: { passengerId: createCheckInDto.passengerId },
      });
      if (!passenger) {
        response.success = false;
        response.message = 'Passenger not found';
        response.errorCode = 'PASSENGER_NOT_EXIST';
        return response;
     }

      // 2️⃣ Tạo check-in
      const newCheckin = this.checkinRepository.create({
        ...createCheckInDto,
        bookingFlight,
        passenger,
      });
      await this.checkinRepository.save(newCheckin);

      // 3️⃣ Sinh file Boarding Pass (PDF)
      const boardingPassPath = await this.generateBoardingPassPDF(
        newCheckin,
        bookingFlight,
        passenger,
      );

      // 4️⃣ Lưu URL vào check-in
      newCheckin.boardingPassUrl = boardingPassPath;
      await this.checkinRepository.save(newCheckin);

      // 5️⃣ Phản hồi
      response.success = true;
      response.message = 'Check-in created successfully';
      response.statusCode = 201;
      response.data = newCheckin;
      return response;
    } catch (error) {
      response.success = false;
      response.message = error.message || 'Error creating check-in';
      return response;
    }
  }

  private async generateBoardingPassPDF(checkin, bookingFlight, passenger) {
    // const dir = path.join(__dirname, '../../uploads/boarding-passes');
    const dir = path.join(process.cwd(), 'uploads/boarding-passes');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const fileName = `boarding-pass-${checkin.checkInId}.pdf`;
    const filePath = path.join(dir, fileName);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));

    // ✈️ Header
    doc.fontSize(18).text('BOARDING PASS', { align: 'center', underline: true });
    doc.moveDown();

    // 👤 Passenger info
    doc.fontSize(12).text(`Passenger: ${passenger.firstName} ${passenger.lastName}`);
    doc.text(`Passenger Type: ${passenger.passengerType}`);
    doc.text(`Check-in Type: ${checkin.checkInType}`);
    doc.moveDown();

    // 🛫 Flight info
    const flight = bookingFlight.flight;
    doc.text(`Flight Number: ${flight.flightNumber}`);
    doc.text(`Route: ${flight.departureAirport.airportCode} to ${flight.arrivalAirport.airportCode}`);
    doc.text(`Departure Time: ${new Date(flight.departureTime).toLocaleString()}`);
    doc.text(`Arrival Time: ${new Date(flight.arrivalTime).toLocaleString()}`);
    doc.moveDown();

    // 🎟️ Booking info
    doc.text(`Booking Reference: ${bookingFlight.booking.bookingReference}`);
    doc.text(`Seat Number: ${bookingFlight.seatNumber}`);
    doc.text(`Class: ${bookingFlight.travelClass}`);
    doc.text(`Baggage: ${checkin.baggageCount} pcs (${checkin.baggageWeight} kg)`);
    doc.text(`Status: ${checkin.boardingStatus}`);
    //thời gian checkin
    const checkinDate = new Date(new Date(checkin.checkedInAt).getTime() + 7 * 60 * 60 * 1000);
    const formattedCheckin = checkinDate.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
     });
    doc.text(`Check-in Time: ${formattedCheckin}`);

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text('Thank you for flying with us!', { align: 'center' });

    doc.end();

    // Trả về đường dẫn URL tương đối
    return `/uploads/boarding-passes/${fileName}`;
  }

    

}
