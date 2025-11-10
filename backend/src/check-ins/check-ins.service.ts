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
import { SeatAllocation } from 'src/seat-allocations/entities/seat-allocations.entity';
import * as QRCode from 'qrcode';
import * as nodemailer from 'nodemailer';
import { UpdateCheckInDto } from 'src/check-ins/dto/update-check-in.dto';

@Injectable()
export class CheckInsService {
 constructor(@InjectRepository(CheckIn) private checkinRepository: Repository<CheckIn>,
         @InjectRepository(Passenger) private passengerRepository: Repository<Passenger>,
        @InjectRepository(BookingFlight) private bookingFlightRepository: Repository<BookingFlight>,
        @InjectRepository(SeatAllocation) private seatAllcationRepository: Repository<SeatAllocation>,
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


    async createCheckinAirport(createCheckInDto: CreateCheckInDto): Promise<any> {
    let response = { ...common_response };
    try {
       //kiểm tra vé đã checkin
       const bookingFlightExisting = await this.checkinRepository.findOne({
        where: {bookingFlight:{bookingFlightId:createCheckInDto.bookingFlightId} },
        relations: ['bookingFlight'],
      });
      if(bookingFlightExisting){
        response.success = false;
        response.message = 'BookingFlight existing into checkins';
        response.errorCode = 'BOOKINGFLIGHT_DUPLICATE';
        return response;
      }
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

      let seatAllcation = await this.seatAllcationRepository.findOne({
         where:{bookingFlight:{bookingFlightId:bookingFlight.bookingFlightId}},
        relations:['bookingFlight','passenger']
      });


      // const passenger = await this.passengerRepository.findOne({
      //   where: { passengerId: createCheckInDto.passengerId },
      // });
      if (!seatAllcation?.passenger) {
        response.success = false;
        response.message = 'Passenger not found';
        response.errorCode = 'PASSENGER_NOT_EXIST';
        return response;
     }

      // 2️⃣ Tạo check-in
      const newCheckin = this.checkinRepository.create({
        ...createCheckInDto,
        bookingFlight,
        passenger:seatAllcation.passenger,
      });
      await this.checkinRepository.save(newCheckin);

      // 3️⃣ Sinh file Boarding Pass (PDF)
      const boardingPassPath = await this.generateBoardingPassPDF(
        newCheckin,
        bookingFlight,
        seatAllcation.passenger,
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
    // Nạp font tiếng Việt
    const fontPath = path.join(process.cwd(), 'src/assets/fonts/DejaVuSans.ttf');
    doc.registerFont('DejaVu', fontPath);
    doc.font('DejaVu'); // Dùng font này cho toàn bộ PDF

    doc.pipe(fs.createWriteStream(filePath));

    // Header
    doc.fontSize(18).text('BOARDING PASS', { align: 'center', underline: true });
    doc.moveDown();

    // Thông tin hành khách
    doc.fontSize(12).text(`Hành khách: ${passenger.lastName} ${passenger.firstName}`);
    doc.text(`Loại hành khách: ${passenger.passengerType}`);
    doc.text(`Hình thức Check-in: ${checkin.checkInType === 'Airport' ? 'Tại sân bay' : 'Trực tuyến'}`);
    doc.moveDown();

    // Thông tin chuyến bay
    const flight = bookingFlight.flight;
    doc.text(`Số hiệu chuyến bay: ${flight.flightNumber}`);
    doc.text(`Hành trình: ${flight.departureAirport.airportCode} → ${flight.arrivalAirport.airportCode}`);
    doc.text(`Giờ khởi hành: ${new Date(flight.departureTime).toLocaleString('vi-VN')}`);
    doc.text(`Giờ đến: ${new Date(flight.arrivalTime).toLocaleString('vi-VN')}`);
    doc.moveDown();

    // Thông tin đặt chỗ
    doc.text(`Mã đặt chỗ: ${bookingFlight.booking.bookingReference}`);
    doc.text(`Số ghế: ${bookingFlight.seatNumber}`);
    doc.text(`Hạng ghế: ${bookingFlight.travelClass}`);
    doc.text(`Hành lý: ${checkin.baggageCount} kiện (${checkin.baggageWeight} kg)`);

    const statusMap = {
      NotBoarded: 'Chưa lên máy bay',
      Boarded: 'Đã lên máy bay',
      GateClosed: 'Cổng đã đóng',
    };
    doc.text(`Trạng thái: ${statusMap[checkin.boardingStatus] || checkin.boardingStatus}`);

    const checkinDate = new Date(new Date(checkin.checkedInAt).getTime() + 7 * 60 * 60 * 1000);
    const formattedCheckin = checkinDate.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    doc.text(`Thời gian Check-in: ${formattedCheckin}`);

     // QR Code Section
    const qrData = JSON.stringify({
      checkInId: checkin.checkInId,
      bookingReference: bookingFlight.booking.bookingReference,
      passenger: `${passenger.firstName} ${passenger.lastName}`,
      seatNumber: bookingFlight.seatNumber,
    });

    const qrImage = await QRCode.toDataURL(qrData, { margin: 1 });
    const qrImageBuffer = Buffer.from(qrImage.split(',')[1], 'base64');

    doc.image(qrImageBuffer, { align: 'center', fit: [150, 150], valign: 'center' });
    doc.moveDown(1);
    doc.fontSize(10).text('Vui lòng xuất trình mã QR này khi làm thủ tục / lên máy bay', { align: 'center' });

    doc.moveDown(2);
    doc.fontSize(10).text('Cảm ơn bạn đã lựa chọn FlyGo!', { align: 'center' });

    doc.end();

    return `/uploads/boarding-passes/${fileName}`;
  }


 async createOnlineCheckin(createCheckInDto: CreateCheckInDto): Promise<any> {
    let response = { ...common_response };
    try {
       //kiểm tra vé đã checkin
       const bookingFlightExisting = await this.checkinRepository.findOne({
        where: {bookingFlight:{bookingFlightId:createCheckInDto.bookingFlightId} },
        relations: ['bookingFlight'],
      });
      if(bookingFlightExisting){
        response.success = false;
        response.message = 'BookingFlight existing into checkins';
        response.errorCode = 'BOOKINGFLIGHT_DUPLICATE';
        return response;
      }
      // Tìm bookingFlight
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

      //Lấy passenger từ seatAllocation
      const seatAllcation = await this.seatAllcationRepository.findOne({
        where: { bookingFlight: { bookingFlightId: bookingFlight.bookingFlightId } },
        relations: ['bookingFlight', 'passenger'],
      });

      if (!seatAllcation?.passenger) {
        response.success = false;
        response.message = 'Passenger not found';
        response.errorCode = 'PASSENGER_NOT_EXIST';
        return response;
      }

      //Tạo check-in mới
      const newCheckin = this.checkinRepository.create({
        ...createCheckInDto,
        bookingFlight,
        passenger: seatAllcation.passenger,
      });
      await this.checkinRepository.save(newCheckin);

      //Sinh PDF có QR code
      const boardingPassPath = await this.generateBoardingPassPDF(
        newCheckin,
        bookingFlight,
        seatAllcation.passenger,
      );

      newCheckin.boardingPassUrl = boardingPassPath;
      await this.checkinRepository.save(newCheckin);

      //Gửi email kèm QR code / file PDF
      await this.sendBoardingPassEmail(
        bookingFlight.booking.contactEmail,

        newCheckin,
      bookingFlight,
      seatAllcation.passenger,
      boardingPassPath
      );

      response.success = true;
      response.message = 'Online check-in successful';
      response.data = newCheckin;
      return response;
    } catch (error) {
      console.error(error);
      response.success = false;
      response.message = error.message || 'Error creating online check-in';
      return response;
    }
  }

private async sendBoardingPassEmail(email: string, checkin: any, bookingFlight: any, passenger: any, pdfPath: string) {
  // Tạo nội dung QR Code (cùng với nội dung PDF)
  const qrData = JSON.stringify({
    checkInId: checkin.checkInId,
    bookingReference: bookingFlight.booking.bookingReference,
    passenger: `${passenger.firstName} ${passenger.lastName}`,
    seatNumber: bookingFlight.seatNumber,
  });

  // const qrImage = await QRCode.toDataURL(qrData, { margin: 1 });
  const qrBuffer = await QRCode.toBuffer(qrData, {
    margin: 1,
    width: 200,
    errorCorrectionLevel: 'L'
  });
  // Tạo transporter (có thể dùng Gmail hoặc SMTP riêng)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Nội dung HTML email
  const htmlContent = `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
    <h2 style="color: #2563eb;">✈️ Thẻ lên máy bay của bạn – FlyGo App</h2>
    <p>Xin chào <strong>${passenger.lastName} ${passenger.firstName}</strong>,</p>
    <p>Bạn đã <strong>check-in trực tuyến thành công</strong>. Dưới đây là thông tin chuyến bay của bạn:</p>

    <table style="border-collapse: collapse; width: 100%; margin-top: 15px;">
      <tr><td><strong>Mã đặt chỗ:</strong></td><td>${bookingFlight.booking.bookingReference}</td></tr>
      <tr><td><strong>Chuyến bay:</strong></td><td>${bookingFlight.flight.flightNumber}</td></tr>
      <tr><td><strong>Hành trình:</strong></td><td>${bookingFlight.flight.departureAirport.airportCode} → ${bookingFlight.flight.arrivalAirport.airportCode}</td></tr>
      <tr><td><strong>Ghế ngồi:</strong></td><td>${bookingFlight.seatNumber}</td></tr>
      <tr><td><strong>Khởi hành:</strong></td><td>${new Date(bookingFlight.flight.departureTime).toLocaleString('vi-VN')}</td></tr>
    </table>

    <div style="text-align: center; margin: 25px 0;">
      <img src="cid:qrimage" alt="Boarding Pass QR Code" style="width: 180px; height: 180px;" />
      <p style="font-size: 13px; color: #555;">Vui lòng xuất trình mã QR này khi lên máy bay hoặc tại cổng kiểm tra.</p>
    </div>

    <p>📎 Bạn cũng có thể tải file PDF thẻ lên máy bay ở phần đính kèm.</p>

    <p style="margin-top: 25px;">Cảm ơn bạn đã lựa chọn <strong>FlyGo App</strong>!<br/>
    Chúc bạn có một chuyến bay an toàn và thoải mái.</p>

    <hr style="margin-top: 20px; border: none; border-top: 1px solid #ddd;">
    <p style="font-size: 12px; color: #999;">Đây là email tự động, vui lòng không trả lời.</p>
  </div>
  `;

  //Gửi email
  await transporter.sendMail({
    from: '"FlyGo" <no-reply@flygo.vn>',
    to: email,
    subject: 'Thẻ lên máy bay của bạn – FlyGo',
    html: htmlContent,
    attachments: [
      {
        filename: 'qr.png',
        content: qrBuffer,
        cid: 'qrimage' // id
      },
      {
        filename: `boarding-pass-${checkin.checkInId}.pdf`,
        path: path.join(process.cwd(), pdfPath),
      },
    ]
  });
}

      async update(
      id: number,
      updateCheckInDto: UpdateCheckInDto,
    ): Promise<any> {
      let response = { ...common_response };
      try {
          const updateResult = await this.checkinRepository.update(id, updateCheckInDto);

          if (updateResult.affected && updateResult.affected > 0) {
              response.success = true;
              response.message = 'Check-in updated successfully';
          } else {
              response.success = false;
              response.message = 'Check-in not found or no changes made';
          }
      } catch (error) {
          response.success = false;
          response.message = error.message || 'Error while updating check-in';
      }
      return response;
    }   
    
    
       async findOne(id: number): Promise<any> {
            let response = { ...common_response };
            try {
                const checkin = await this.checkinRepository.findOne({
                    where: { checkInId: id },
                    relations:['bookingFlight','passenger']
                });
                if (checkin) {
                    response.success = true;
                    response.data =  checkin;
                    response.message = 'Successfully retrieved checkin information';
                } else {
                    response.success = false;
                    response.message = 'checkin not found';
                }
            } catch (error) {
                console.error(error);
                response.success = false;
                response.message = 'Error while retrieving checkin by ID';
            }
            return response;
        }

        async delete(id: number): Promise<any> {
            let response = { ...common_response };
            try {
                const deleteResult = await this.checkinRepository.delete({checkInId: id });
                if (deleteResult.affected && deleteResult.affected > 0) {
                    response.success = true;
                    response.message = 'Checkin deleted successfully';
                } else {
                    response.success = false;
                    response.message = 'Checkin  not found';
                }
            } catch (error) {
                response.success = false;
                response.message = error.message || 'Error while deleting Checkin';
            }
            return response;
        }



    

}
