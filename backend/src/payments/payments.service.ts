import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, MoMoPaymentDetails } from './entities/payments.entity';
import { Booking } from 'src/bookings/entities/bookings.entity';
import { EmailService } from 'src/email/email.service';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class PaymentsService {
    private readonly MOMO_ACCESS_KEY = 'F8BBA842ECF85';
    private readonly MOMO_SECRET_KEY = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    private readonly MOMO_PARTNER_CODE = 'MOMO';
    private readonly MOMO_API_URL = 'https://test-payment.momo.vn/v2/gateway/api/create';

    constructor(
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
        @InjectRepository(Booking)
        private bookingRepository: Repository<Booking>,
        private emailService: EmailService,
    ) { }

    async createPayment(amount: number, bookingId: number, paymentMethod: string, transactionId?: string) {
        const booking = await this.bookingRepository.findOne({ where: { bookingId } });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        const payment = this.paymentRepository.create({
            amount,
            paymentMethod,
            paymentStatus: 'Pending',
            transactionId,
            booking,
        });

        return await this.paymentRepository.save(payment);
    }

    async getPaymentById(paymentId: number): Promise<Payment> {
        const payment = await this.paymentRepository.findOne({
            where: { paymentId },
            relations: ['booking']
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        return payment;
    }

    async updatePaymentStatus(paymentId: number, status: string, transactionId?: string) {
        console.log(`🔄 Backend: Updating payment ${paymentId} to status: ${status}`);

        const payment = await this.paymentRepository.findOne({
            where: { paymentId },
            relations: ['booking']
        });
        console.log(`📋 Backend: Found payment:`, payment);

        if (!payment) {
            console.error(`❌ Backend: Payment not found`);
            throw new NotFoundException('Payment not found');
        }

        console.log(`📝 Backend: Old status: ${payment.paymentStatus}`);
        payment.paymentStatus = status;
        console.log(`📝 Backend: New status: ${payment.paymentStatus}`);

        if (transactionId) {
            payment.transactionId = transactionId;
        }

        if (status === 'Completed') {
            payment.paidAt = new Date();
            console.log(`✅ Backend: Set paidAt to: ${payment.paidAt}`);

            // Update booking status when payment is completed
            if (payment.booking) {
                payment.booking.bookingStatus = 'Completed';
                payment.booking.paymentStatus = 'Paid';
                await this.bookingRepository.save(payment.booking);
                console.log(`✅ Backend: Booking status updated to Completed`);

                // Send confirmation email
                try {
                    const booking = await this.bookingRepository.findOne({
                        where: { bookingId: payment.booking.bookingId },
                        relations: ['user', 'bookingFlights', 'bookingFlights.flight', 'bookingFlights.flight.arrivalAirport', 'bookingFlights.flight.departureAirport']
                    });

                    if (booking && booking.user) {
                        const flightDetailsHtml = this.generateFlightDetailsHtml(booking);

                        await this.emailService.sendPaymentConfirmationEmail(
                            booking.user.email,
                            booking.bookingReference,
                            payment.amount,
                            payment.paymentMethod,
                            flightDetailsHtml
                        );
                        console.log('✅ Email sent successfully');
                    }
                } catch (emailError) {
                    console.error('❌ Error sending email:', emailError);
                    // Don't throw error, continue with payment update
                }
            }
        }

        const result = await this.paymentRepository.save(payment);
        console.log(`✅ Backend: Payment saved:`, result);

        return result;
    }

    async updateBookingStatus(bookingId: number, bookingStatus: string, paymentStatus: string) {
        console.log(`🔄 Backend: Updating booking ${bookingId} - status: ${bookingStatus}, payment: ${paymentStatus}`);

        const booking = await this.bookingRepository.findOne({ where: { bookingId } });

        if (!booking) {
            console.error(`❌ Backend: Booking not found`);
            throw new NotFoundException('Booking not found');
        }

        booking.bookingStatus = bookingStatus;
        booking.paymentStatus = paymentStatus;

        const result = await this.bookingRepository.save(booking);
        console.log(`✅ Backend: Booking saved:`, result);

        return result;
    }

    async getPaymentsByBooking(bookingId: number): Promise<Payment[]> {
        return await this.paymentRepository.find({
            where: { booking: { bookingId } },
            relations: ['booking'],
        });
    }

    async findPaymentByMoMoOrderId(momoOrderId: string): Promise<Payment[]> {
        console.log('🔍 Searching for payment with momoOrderId:', momoOrderId);
        const payments = await this.paymentRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.booking', 'booking')
            .where('payment.paymentDetails->>"$.momoOrderId" = :momoOrderId', { momoOrderId })
            .getMany();
        console.log('📋 Found payments:', payments);
        return payments;
    }

    async createMoMoPayment(
        amount: number,
        bookingId: number,
        orderInfo: string,
        redirectUrl: string,
        ipnUrl: string,
    ) {
        try {
            const booking = await this.bookingRepository.findOne({ where: { bookingId } });

            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            // Generate unique IDs
            const orderId = `${this.MOMO_PARTNER_CODE}${Date.now()}`;
            const requestId = orderId;

            // Create raw signature
            const rawSignature = `accessKey=${this.MOMO_ACCESS_KEY}&amount=${amount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.MOMO_PARTNER_CODE}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=payWithMethod`;

            // Create signature
            const signature = crypto
                .createHmac('sha256', this.MOMO_SECRET_KEY)
                .update(rawSignature)
                .digest('hex');

            // Create payment record
            const payment = this.paymentRepository.create({
                amount,
                paymentMethod: 'MoMo',
                paymentStatus: 'Pending',
                booking,
                paymentDetails: {
                    momoRequestId: requestId,
                    momoOrderId: orderId,
                } as MoMoPaymentDetails,
            });

            const savedPayment = await this.paymentRepository.save(payment);

            // Prepare request body for MoMo API
            const requestBody = {
                partnerCode: this.MOMO_PARTNER_CODE,
                partnerName: 'FlyGo',
                storeId: 'FlyGoStore',
                requestId: requestId,
                amount: amount,
                orderId: orderId,
                orderInfo: orderInfo,
                redirectUrl: redirectUrl,
                ipnUrl: ipnUrl,
                lang: 'vi',
                requestType: 'payWithMethod',
                autoCapture: true,
                extraData: '',
                orderGroupId: '',
                signature: signature,
            };

            // Call MoMo API
            const response = await axios.post(this.MOMO_API_URL, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Update payment with response data
            if (response.data && response.data.resultCode === 0) {
                const payUrl = response.data.payUrl;
                const deepLink = response.data.deepLink;
                const qrCodeUrl = response.data.qrCodeUrl;

                savedPayment.paymentDetails = {
                    ...savedPayment.paymentDetails,
                    payUrl,
                    deepLink,
                    qrCodeUrl,
                };

                await this.paymentRepository.save(savedPayment);

                return {
                    paymentId: savedPayment.paymentId,
                    payUrl,
                    deepLink,
                    qrCodeUrl,
                    orderId,
                    requestId,
                };
            } else {
                throw new BadRequestException(
                    `MoMo payment failed: ${response.data?.message || 'Unknown error'}`,
                );
            }
        } catch (error) {
            console.error('Error creating MoMo payment:', error);
            throw new BadRequestException(
                `Failed to create MoMo payment: ${error.message}`,
            );
        }
    }

    async handleMoMoCallback(body: any) {
        try {
            const { orderId, resultCode, message, transId } = body;

            console.log('🔄 MoMo callback received:', { orderId, resultCode, message, transId });

            // Find payment by orderId
            const payments = await this.paymentRepository
                .createQueryBuilder('payment')
                .leftJoinAndSelect('payment.booking', 'booking')
                .where('payment.paymentDetails->>"$.momoOrderId" = :orderId', { orderId })
                .getMany();

            if (payments.length === 0) {
                console.error('❌ Payment not found for orderId:', orderId);
                throw new NotFoundException('Payment not found');
            }

            const payment = payments[0];
            console.log('📋 Found payment:', payment);

            // Update payment details
            payment.paymentDetails = {
                ...payment.paymentDetails,
                transId,
                momoResultCode: resultCode,
                momoMessage: message,
                momoPayType: body.payType,
                momoTransactionId: body.transId,
                momoResponseTime: body.responseTime,
            };

            // Update payment status
            if (resultCode === 0) {
                payment.paymentStatus = 'Completed';
                payment.paidAt = new Date();

                // Update booking status to Completed and paymentStatus to Paid
                if (payment.booking) {
                    payment.booking.bookingStatus = 'Completed';
                    payment.booking.paymentStatus = 'Paid';
                    await this.bookingRepository.save(payment.booking);
                    console.log('✅ Booking status updated to Completed');
                }
            } else {
                payment.paymentStatus = 'Failed';
                payment.paymentDetails.failureReason = message;
            }

            await this.paymentRepository.save(payment);
            console.log('✅ Payment saved successfully');

            return {
                success: true,
                orderId,
                resultCode,
                message,
            };
        } catch (error) {
            console.error('Error handling MoMo callback:', error);
            throw new BadRequestException(
                `Failed to handle MoMo callback: ${error.message}`,
            );
        }
    }

    private generateFlightDetailsHtml(booking: any): string {
        if (!booking.bookingFlights || booking.bookingFlights.length === 0) {
            return '<p style="color: #666;">Thông tin chuyến bay</p>';
        }

        let html = '';
        booking.bookingFlights.forEach((bf: any, index: number) => {
            const flight = bf.flight;
            const departure = flight.departureAirport;
            const arrival = flight.arrivalAirport;

            html += `
                <div style="margin-bottom: 20px; padding: 15px; background-color: ${index === 0 ? '#e8f5e9' : '#fff3e0'}; border-radius: 8px;">
                    <p style="margin: 5px 0; font-weight: bold; color: #333;">${index === 0 ? '✈️ Chuyến đi' : '✈️ Chuyến về'}</p>
                    <p style="margin: 5px 0; color: #666;"><strong>Số hiệu:</strong> ${flight.flightNumber}</p>
                    <p style="margin: 5px 0; color: #666;"><strong>Từ:</strong> ${departure.city} (${departure.airportCode})</p>
                    <p style="margin: 5px 0; color: #666;"><strong>Đến:</strong> ${arrival.city} (${arrival.airportCode})</p>
                    <p style="margin: 5px 0; color: #666;"><strong>Khởi hành:</strong> ${bf.departTime || flight.departTime}</p>
                    <p style="margin: 5px 0; color: #666;"><strong>Đến nơi:</strong> ${bf.arriveTime || flight.arriveTime}</p>
                    <p style="margin: 5px 0; color: #666;"><strong>Hạng vé:</strong> ${flight.fareName || 'Standard'}</p>
                </div>
            `;
        });

        return html;
    }
}
