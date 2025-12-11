import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefundHistory } from './entities/refund-history.entity';
import { CreateRefundHistoryDto } from './dto/create-refund-history.dto';
import { UpdateRefundHistoryDto } from './dto/update-refund-history.dto';
import { Booking } from 'src/bookings/entities/bookings.entity';

@Injectable()
export class RefundHistoryService {
    constructor(
        @InjectRepository(RefundHistory)
        private refundHistoryRepository: Repository<RefundHistory>,
        @InjectRepository(Booking)
        private bookingRepository: Repository<Booking>,
    ) { }

    async create(createRefundHistoryDto: CreateRefundHistoryDto): Promise<any> {
        try {
            // Find booking by bookingId or bookingReference
            let booking: Booking | null = null;

            if (createRefundHistoryDto.bookingId) {
                booking = await this.bookingRepository.findOne({
                    where: { bookingId: createRefundHistoryDto.bookingId },
                    relations: ['bookingFlights', 'bookingFlights.flight']
                });
            } else if (createRefundHistoryDto.bookingReference) {
                booking = await this.bookingRepository.findOne({
                    where: { bookingReference: createRefundHistoryDto.bookingReference },
                    relations: ['bookingFlights', 'bookingFlights.flight']
                });
            }

            if (!booking) {
                throw new NotFoundException('Không tìm thấy booking với mã đặt chỗ này');
            }

            // ✅ VALIDATION 1: Check if booking is cancelled OR flight has airline issues
            const bookingStatus = booking.bookingStatus || booking['status'];
            const isCancelled = bookingStatus === 'Cancelled';

            let hasAirlineIssue = false;
            let airlineIssueReason = '';

            // Check flight status for airline-caused issues
            if (booking.bookingFlights && booking.bookingFlights.length > 0) {
                for (const bf of booking.bookingFlights) {
                    if (bf.flight) {
                        const flightStatus = bf.flight.status;

                        // Flight cancelled by airline
                        if (flightStatus === 'Cancelled') {
                            hasAirlineIssue = true;
                            airlineIssueReason = `Chuyến bay ${bf.flight.flightNumber} đã bị hủy bởi hãng`;
                            break;
                        }

                        // Flight delayed significantly
                        if (flightStatus === 'Delayed') {
                            hasAirlineIssue = true;
                            airlineIssueReason = `Chuyến bay ${bf.flight.flightNumber} bị delay`;
                            break;
                        }
                    }
                }
            }

            // Reject if booking is NOT cancelled AND there's NO airline issue
            if (!isCancelled && !hasAirlineIssue) {
                throw new BadRequestException(
                    'Chỉ có thể yêu cầu hoàn tiền cho vé đã hủy hoặc chuyến bay bị hủy/delay bởi hãng. ' +
                    'Vui lòng hủy vé trước tại trang "Hủy đặt vé hoàn tiền".'
                );
            }

            // ✅ VALIDATION 2: Check if refund request already exists for this booking
            const existingRefund = await this.refundHistoryRepository.findOne({
                where: {
                    booking: { bookingId: booking.bookingId },
                    status: 'Pending'
                }
            });

            if (existingRefund) {
                throw new BadRequestException('Đã có yêu cầu hoàn tiền đang chờ xử lý cho booking này.');
            }

            // Create refund request
            const refundHistory = this.refundHistoryRepository.create({
                ...createRefundHistoryDto,
                booking: booking,
                status: 'Pending'
            });

            const saved = await this.refundHistoryRepository.save(refundHistory);

            return {
                success: true,
                message: hasAirlineIssue
                    ? `Yêu cầu hoàn tiền đã được ghi nhận. Lý do: ${airlineIssueReason}. Chúng tôi sẽ xử lý yêu cầu trong thời gian quy định.`
                    : 'Flygo đã nhận yêu cầu hoàn tiền của bạn. Chúng tôi sẽ xem xét và xử lý yêu cầu trong thời gian quy định.',
                data: {
                    refundHistoryId: saved.refundHistoryId,
                    bookingReference: saved.bookingReference,
                    status: saved.status,
                    requestedAt: saved.requestedAt
                }
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(error.message || 'Có lỗi xảy ra khi tạo yêu cầu hoàn tiền');
        }
    }

    async findAll(): Promise<any> {
        try {
            const refunds = await this.refundHistoryRepository.find({
                relations: ['booking', 'booking.user', 'processedBy'],
                order: { requestedAt: 'DESC' }
            });

            return {
                success: true,
                data: refunds
            };
        } catch (error) {
            throw new BadRequestException('Có lỗi xảy ra khi lấy danh sách yêu cầu hoàn tiền');
        }
    }

    async findByBooking(bookingId: number): Promise<any> {
        try {
            const refunds = await this.refundHistoryRepository.find({
                where: { booking: { bookingId } },
                relations: ['booking', 'processedBy'],
                order: { requestedAt: 'DESC' }
            });

            return {
                success: true,
                data: refunds
            };
        } catch (error) {
            throw new BadRequestException('Có lỗi xảy ra khi lấy lịch sử hoàn tiền');
        }
    }

    async findOne(id: number): Promise<any> {
        try {
            const refund = await this.refundHistoryRepository.findOne({
                where: { refundHistoryId: id },
                relations: ['booking', 'booking.user', 'processedBy']
            });

            if (!refund) {
                throw new NotFoundException('Không tìm thấy yêu cầu hoàn tiền');
            }

            return {
                success: true,
                data: refund
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Có lỗi xảy ra khi lấy thông tin yêu cầu hoàn tiền');
        }
    }

    async update(id: number, updateRefundHistoryDto: UpdateRefundHistoryDto): Promise<any> {
        try {
            const refund = await this.refundHistoryRepository.findOne({
                where: { refundHistoryId: id },
                relations: ['booking']
            });

            if (!refund) {
                throw new NotFoundException('Không tìm thấy yêu cầu hoàn tiền');
            }

            // Update fields
            Object.assign(refund, updateRefundHistoryDto);

            // Update processedAt if status changed
            if (updateRefundHistoryDto.status && updateRefundHistoryDto.status !== 'Pending') {
                refund.processedAt = new Date();
            }

            // ✅ NEW: Update booking paymentStatus to 'Refunded' when approved
            if (updateRefundHistoryDto.status === 'Approved' && refund.booking) {
                const booking = await this.bookingRepository.findOne({
                    where: { bookingId: refund.booking.bookingId }
                });

                if (booking) {
                    booking.paymentStatus = 'Refunded';
                    await this.bookingRepository.save(booking);
                }
            }

            const updated = await this.refundHistoryRepository.save(refund);

            return {
                success: true,
                message: updateRefundHistoryDto.status === 'Approved'
                    ? 'Đã duyệt yêu cầu hoàn tiền và cập nhật trạng thái booking'
                    : 'Cập nhật trạng thái yêu cầu hoàn tiền thành công',
                data: updated
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Có lỗi xảy ra khi cập nhật yêu cầu hoàn tiền');
        }
    }
}
