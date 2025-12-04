import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { CreateBookingDto } from 'src/bookings/dto/create-booking.dto';
import { UpdateBookingDto } from 'src/bookings/dto/update-booking.dto';
import { Booking } from 'src/bookings/entities/bookings.entity';
import { common_response } from 'src/untils/common';
import { User } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Flight } from 'src/flights/entities/flights.entity';
import { FlightSeat } from 'src/flight-seats/entities/flight-seats.entity';
import { BookingFlight } from 'src/booking-flights/entities/booking-flights.entity';

@Injectable()
export class BookingsService {
    constructor(@InjectRepository(Booking) private bookingRepository: Repository<Booking>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Flight) private flightRepository: Repository<Flight>,
        @InjectRepository(FlightSeat) private flightSeatRepository: Repository<FlightSeat>,
        @InjectRepository(BookingFlight) private bookingFlightRepository: Repository<BookingFlight>,
    ) { }


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
                customerName: (b.user.lastName === 'Guest' || b.user.roleId === 3)
                    ? `Guest (Khách vãng lai) - ${b.user.email}`
                    : `${b.user.firstName} ${b.user.lastName}`,
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
                    'bookingFlights.seatAllocations.flightSeat',
                    'bookingFlights.seatAllocations.flightSeat.seat',
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
                    name: (booking.user.lastName === 'Guest' || booking.user.roleId === 3)
                        ? `Guest (Khách vãng lai) - ${booking.user.email}`
                        : `${booking.user.firstName} ${booking.user.lastName}`,
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
                        seatNumber: sa.flightSeat?.seat?.seatNumber,
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


    async findAll(): Promise<any> {
        let response = { ...common_response };
        try {
            const bookings = await this.bookingRepository.find({
                relations: ['user'],
            });
            response.success = true;
            response.data = bookings;
            response.message = 'Successfully retrieved the list of  bookings';
        } catch (error) {
            console.error(error);
            response.success = false;
            response.message = 'Error while fetching the list of bookings';
        }
        return response;
    }

    async findByUserId(userId: number): Promise<any> {
        let response = { ...common_response };
        try {
            const bookings = await this.bookingRepository.find({
                where: { user: { userId } },
                relations: [
                    'user',
                    'bookingFlights',
                    'bookingFlights.flight',
                    'bookingFlights.flight.arrivalAirport',
                    'bookingFlights.flight.departureAirport',
                    'bookingFlights.seatAllocations',
                    'bookingFlights.seatAllocations.flightSeat',
                    'bookingFlights.seatAllocations.flightSeat.seat',
                    'bookingFlights.seatAllocations.passenger',
                    'passengers'
                ],
                order: { bookingId: 'DESC' }
            });
            response.success = true;
            response.data = bookings;
            response.message = 'Successfully retrieved bookings for user';
        } catch (error) {
            response.success = false;
            response.message = 'Error while fetching bookings for user';
        }
        return response;
    }


    async create(createBookingDto: CreateBookingDto): Promise<any> {
        let response = { ...common_response };
        try {
            let user: User | null = null;

            // Nếu có userId (user đã đăng nhập), tìm user
            if (createBookingDto.userId) {
                user = await this.userRepository.findOneBy({ userId: createBookingDto.userId });
                if (!user) {
                    response.success = false;
                    response.message = 'User not found';
                    return response;
                }
            } else {
                // Nếu không có userId (khách vãng lai), tạo hoặc tìm user guest
                const email = createBookingDto.contactEmail;

                // Check xem email đã tồn tại chưa
                user = await this.userRepository.findOneBy({ email });

                if (!user) {
                    // Tạo user guest mới
                    const randomPassword = randomBytes(16).toString('hex');
                    const passwordHash = await bcrypt.hash(randomPassword, 10);

                    // Lấy firstName và lastName từ contactEmail (hoặc từ passenger đầu tiên)
                    const [firstName] = email.split('@');

                    const newUser = this.userRepository.create({
                        email,
                        passwordHash,
                        firstName,
                        lastName: 'Guest',
                        phone: createBookingDto.contactPhone || null,
                        roleId: 1, // Mặc định roleId = 1 cho khách hàng
                        loyaltyPoints: 0,
                        loyaltyTier: 'Standard',
                        isActive: true,
                    });

                    user = await this.userRepository.save(newUser);
                }
            }

            // At this point, user must exist
            if (!user) {
                response.success = false;
                response.message = 'Failed to create or find user';
                return response;
            }

            // Tạo booking với bookedAt được set bằng thời gian hiện tại của server (ngày + giờ)
            // Sử dụng new Date() để đảm bảo luôn có ngày giờ hiện tại khi tạo booking
            const bookingReference = this.generateBookingReference();

            // Tạo booking object
            const newBooking = this.bookingRepository.create({
                ...createBookingDto,
                user: user,
                bookingReference: bookingReference,
                bookedAt: new Date() // Set thủ công với thời gian hiện tại (cả ngày và giờ)
            });

            // Lưu booking vào database
            await this.bookingRepository.save(newBooking);

            // Reload booking từ database để đảm bảo bookedAt đã được lưu đúng
            const savedBooking = await this.bookingRepository.findOne({
                where: { bookingId: newBooking.bookingId },
                relations: ['user']
            });

            // Đảm bảo bookedAt có giá trị
            if (savedBooking) {
                savedBooking.bookedAt = savedBooking.bookedAt || new Date();
            }

            response.success = true;
            response.message = createBookingDto.userId
                ? 'Booking created successfully'
                : 'Booking created successfully (Guest user auto-created)';
            response.data = savedBooking || newBooking;
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
                relations: [
                    'user',
                    'bookingFlights',
                    'bookingFlights.flight',
                    'bookingFlights.flight.arrivalAirport',
                    'bookingFlights.flight.departureAirport',
                    'bookingFlights.flight.airline',
                    'passengers'
                ],
            });

            if (booking) {
                response.success = true;
                response.data = booking;
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
            const deleteResult = await this.bookingRepository.delete({ bookingId: id });
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

    // Tìm tất cả booking theo email (khi khách vãng lai quên mã đặt chỗ)
    async findBookingsByEmail(email: string): Promise<any> {
        let response = { ...common_response };
        try {
            if (!email) {
                response.success = false;
                response.message = 'Email là bắt buộc';
                return response;
            }

            // Tìm user theo email
            const user = await this.userRepository.findOne({
                where: { email: email.toLowerCase().trim() }
            });

            if (!user) {
                response.success = false;
                response.message = 'Không tìm thấy đơn hàng với email này';
                return response;
            }

            // Tìm tất cả booking của user này
            const bookings = await this.bookingRepository.find({
                where: {
                    user: { userId: user.userId }
                },
                relations: [
                    'user',
                    'bookingFlights',
                    'bookingFlights.flight',
                    'bookingFlights.flight.departureAirport',
                    'bookingFlights.flight.arrivalAirport',
                ],
                order: {
                    bookedAt: 'DESC'
                }
            });

            if (bookings.length === 0) {
                response.success = false;
                response.message = 'Không tìm thấy đơn hàng nào với email này';
                return response;
            }

            // Format dữ liệu trả về (chỉ thông tin tóm tắt)
            const result = bookings.map(booking => ({
                bookingId: booking.bookingId,
                bookingReference: booking.bookingReference,
                bookedAt: booking.bookedAt,
                totalAmount: booking.totalAmount,
                bookingStatus: booking.bookingStatus,
                paymentStatus: booking.paymentStatus,
                contactEmail: booking.contactEmail,
                contactPhone: booking.contactPhone,

                flights: booking.bookingFlights.map((bf) => ({
                    flightNumber: bf.flight.flightNumber,
                    route: `${bf.flight.departureAirport.airportCode} → ${bf.flight.arrivalAirport.airportCode}`,
                    departureTime: bf.flight.departureTime,
                    travelClass: bf.travelClass,
                })),
            }));

            response.success = true;
            response.message = `Tìm thấy ${bookings.length} đơn hàng`;
            response.data = result;
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Lỗi khi tra cứu đơn hàng';
        }
        return response;
    }

    // Tra cứu đơn hàng cho khách vãng lai
    async lookupGuestBooking(email: string, bookingReference: string): Promise<any> {
        let response = { ...common_response };
        try {
            if (!email || !bookingReference) {
                response.success = false;
                response.message = 'Email và mã đặt chỗ là bắt buộc';
                return response;
            }

            // Tìm user theo email
            const user = await this.userRepository.findOne({
                where: { email: email.toLowerCase().trim() }
            });

            if (!user) {
                response.success = false;
                response.message = 'Không tìm thấy đơn hàng với email này';
                return response;
            }

            // Tìm booking với bookingReference và userId
            const booking = await this.bookingRepository.findOne({
                where: {
                    bookingReference: bookingReference.toUpperCase().trim(),
                    user: { userId: user.userId }
                },
                relations: [
                    'user',
                    'bookingFlights',
                    'bookingFlights.flight',
                    'bookingFlights.flight.departureAirport',
                    'bookingFlights.flight.arrivalAirport',
                    'bookingFlights.seatAllocations',
                    'bookingFlights.seatAllocations.flightSeat',
                    'bookingFlights.seatAllocations.flightSeat.seat',
                    'passengers',
                    'payments'
                ]
            });

            if (!booking) {
                response.success = false;
                response.message = 'Không tìm thấy đơn hàng với mã đặt chỗ này';
                return response;
            }

            // Format dữ liệu trả về
            const result = {
                bookingId: booking.bookingId,
                bookingReference: booking.bookingReference,
                bookedAt: booking.bookedAt,
                totalAmount: booking.totalAmount,
                bookingStatus: booking.bookingStatus,
                paymentStatus: booking.paymentStatus,
                contactEmail: booking.contactEmail,
                contactPhone: booking.contactPhone,

                customer: {
                    name: (user.lastName === 'Guest' || user.roleId === 3)
                        ? `Khách vãng lai`
                        : `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    phone: user.phone,
                },

                flights: booking.bookingFlights.map((bf) => ({
                    bookingFlightId: bf.bookingFlightId,
                    flightNumber: bf.flight.flightNumber,
                    departureAirport: {
                        code: bf.flight.departureAirport.airportCode,
                        name: bf.flight.departureAirport.airportName,
                        city: bf.flight.departureAirport.city,
                    },
                    arrivalAirport: {
                        code: bf.flight.arrivalAirport.airportCode,
                        name: bf.flight.arrivalAirport.airportName,
                        city: bf.flight.arrivalAirport.city,
                    },
                    departureTime: bf.flight.departureTime,
                    arrivalTime: bf.flight.arrivalTime,
                    travelClass: bf.travelClass,
                    fare: bf.fare,
                    seatNumber: bf.seatNumber,
                    seats: bf.seatAllocations?.map(sa => ({
                        seatNumber: sa.flightSeat?.seat?.seatNumber,
                        travelClass: sa.flightSeat?.seat?.travelClass,
                    })) || [],
                })),

                passengers: booking.passengers.map((p) => ({
                    passengerId: p.passengerId,
                    firstName: p.firstName,
                    lastName: p.lastName,
                    dateOfBirth: p.dateOfBirth,
                    passportNumber: p.passportNumber,
                    passengerType: p.passengerType,
                })),

                payments: booking.payments.map((p) => ({
                    paymentId: p.paymentId,
                    amount: p.amount,
                    paymentMethod: p.paymentMethod,
                    paymentStatus: p.paymentStatus,
                    paidAt: p.paidAt,
                })),
            };

            response.success = true;
            response.message = 'Tìm thấy đơn hàng thành công';
            response.data = result;
        } catch (error) {
            response.success = false;
            response.message = error.message || 'Lỗi khi tra cứu đơn hàng';
        }
        return response;
    }

    //reports
    async getRevenue(
        type: "week" | "month" | "quarter" | "year" | "custom",
        start?: Date,
        end?: Date
    ) {
        const toLocal = (d: Date) =>
            new Date(d.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));

        const formatDateLocal = (date: Date) => {
            const d = toLocal(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        const now = toLocal(new Date());

        let from: Date;
        let to: Date;

        switch (type) {
            case "week": {
                const localNow = toLocal(now);
                let day = localNow.getDay();
                if (day === 0) day = 7; // Chủ Nhật = 7

                // Thứ 2 đầu tuần
                from = new Date(localNow);
                from.setDate(localNow.getDate() - day + 1);

                // To = Hôm nay (không set + 6 nữa)
                to = localNow;
                break;
            }

            case "month":
                from = new Date(now.getFullYear(), now.getMonth(), 1);
                to = now;
                break;

            case "quarter": {
                const q = Math.floor(now.getMonth() / 3);
                from = new Date(now.getFullYear(), q * 3, 1);
                to = now;
                break;
            }

            case "year":
                from = new Date(now.getFullYear(), 0, 1);
                to = now;
                break;

            case "custom":
                from = toLocal(start!);
                to = toLocal(end!);
                break;
        }

        const fromDate = formatDateLocal(from);
        const toDate = formatDateLocal(to);


        // ─────────────────────────────────────────────
        // 1) Tổng doanh thu
        // ─────────────────────────────────────────────
        const revenueResult = await this.bookingRepository
            .createQueryBuilder("booking")
            .select("SUM(booking.totalAmount)", "totalRevenue")
            .where("booking.paymentStatus = :status", { status: "PAID" })
            .andWhere("DATE(booking.bookedAt) BETWEEN :from AND :to", {
                from: fromDate,
                to: toDate,
            })
            .getRawOne();

        const totalRevenue = Number(revenueResult?.totalRevenue || 0);

        // ─────────────────────────────────────────────
        // 2) Tổng số booking
        // ─────────────────────────────────────────────
        const totalBookings = await this.bookingRepository
            .createQueryBuilder("booking")
            .where("DATE(booking.bookedAt) BETWEEN :from AND :to", {
                from: fromDate,
                to: toDate,
            })
            .getCount();

        // ─────────────────────────────────────────────
        // 3) Số flight đã cất cánh (Departed)
        // ─────────────────────────────────────────────

        const flightsDeparted = await this.flightRepository
            .createQueryBuilder("flight")
            .where("flight.status = :status", { status: "Departed" })
            .andWhere("DATE(flight.departureTime) BETWEEN :from AND :to", {
                from: fromDate,
                to: toDate,
            })
            .getCount();


        // 4) Tính load factor (Tỉ lệ lấp đầy)
        // ─────────────────────────────────────────────

        // Tổng số ghế khả dụng của các flight trong khoảng thời gian
        const totalSeatsResult = await this.flightRepository
            .createQueryBuilder("f")
            .select(
                `SUM(
                f.availableEconomySeats +
                f.availableBusinessSeats +
                f.availableFirstClassSeats
            )`,
                "totalSeats"
            )
            .where("DATE(f.departureTime) BETWEEN :from AND :to", {
                from: fromDate,
                to: toDate,
            })
            .getRawOne();
        // console.log('total seat',totalSeatsResult)

        const totalSeats = Number(totalSeatsResult?.totalSeats || 0);

        // Tổng số ghế đã được đặt (bookingFlight)
        const seatsBooked = await this.bookingFlightRepository
            .createQueryBuilder("bf")
            .innerJoin("bf.booking", "b")
            .innerJoin("bf.flight", "f")
            .where("b.paymentStatus = :status", { status: "PAID" })
            .andWhere("DATE(f.departureTime) BETWEEN :from AND :to", {
                from: fromDate,
                to: toDate,
            })
            .getCount();

        // console.log(seatsBooked)

        const loadFactor =
            totalSeats > 0
                ? `${((seatsBooked / totalSeats) * 100).toFixed(2)}%`
                : "0%";
        return {
            success: true,
            from: fromDate,
            to: toDate,
            totalRevenue: this.formatNumberShort(totalRevenue),
            totalBookings,
            flightsDeparted,
            loadFactor,
        };
    }


    async getThisWeekRevenue() {
        return this.getRevenue("week");
    }

    async getThisMonthRevenue() {
        return this.getRevenue("month");
    }

    async getThisQuarterRevenue() {
        return this.getRevenue("quarter");
    }

    async getThisYearRevenue() {
        return this.getRevenue("year");
    }

    async getCustomRevenue(start: Date, end: Date) {
        return this.getRevenue("custom", start, end);
    }
    formatNumberShort(value: number): string {
        if (value >= 1_000_000_000_000) {
            return (value / 1_000_000_000_000).toFixed(1).replace(/\.0$/, '') + 'T';
        }
        if (value >= 1_000_000_000) {
            return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
        }
        if (value >= 1_000_000) {
            return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (value >= 1_000) {
            return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return value.toString();
    }

    private toLocalDate(date: Date) {
        const d = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
        return d;
    }
    private toLocalDateString(date: Date) {
        const d = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
        return d.toISOString().split("T")[0];
    }

    private formatDateLocal(date: Date) {
        const d = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;   // KHÔNG dùng toISOString()
    }



}
