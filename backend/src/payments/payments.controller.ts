import { Controller, Get, Post, Body, Param, Put, ParseIntPipe, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post()
    async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
        return await this.paymentsService.createPayment(
            createPaymentDto.amount,
            createPaymentDto.bookingId,
            'CreditCard' // default method, can be extended
        );
    }

    @Get(':id')
    async getPayment(@Param('id', ParseIntPipe) id: number) {
        return await this.paymentsService.getPaymentById(id);
    }

    @Put(':id/status')
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { status: string; transactionId?: string }
    ) {
        console.log('🌐 Controller: Received updateStatus request');
        console.log('   - Payment ID:', id);
        console.log('   - New Status:', body.status);
        console.log('   - Transaction ID:', body.transactionId);

        try {
            const result = await this.paymentsService.updatePaymentStatus(id, body.status, body.transactionId);
            console.log('✅ Controller: Update successful:', result);
            return result;
        } catch (error) {
            console.error('❌ Controller: Update failed:', error);
            throw error;
        }
    }

    @Get('booking/:bookingId')
    async getPaymentsByBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
        return await this.paymentsService.getPaymentsByBooking(bookingId);
    }

    @Post('momo/create')
    async createMoMoPayment(
        @Body()
        body: {
            amount: number;
            bookingId: number;
            orderInfo?: string;
            redirectUrl: string;
            ipnUrl: string;
        },
    ) {
        return await this.paymentsService.createMoMoPayment(
            body.amount,
            body.bookingId,
            body.orderInfo || 'Thanh toan ve may bay FlyGo',
            body.redirectUrl,
            body.ipnUrl,
        );
    }

    @Post('momo/callback')
    async handleMoMoCallback(@Body() body: any) {
        return await this.paymentsService.handleMoMoCallback(body);
    }

    // Endpoint để lấy bookingId từ momoOrderId
    @Get('momo/get-booking/:orderId')
    async getBookingByOrderId(@Param('orderId') orderId: string) {
        console.log('🔍 Getting bookingId for momoOrderId:', orderId);
        try {
            const payments = await this.paymentsService.findPaymentByMoMoOrderId(orderId);

            if (payments && payments.length > 0) {
                const bookingId = payments[0].booking?.bookingId || null;
                console.log('✅ Found bookingId:', bookingId);
                return { success: true, bookingId };
            }

            console.warn('⚠️ No payment found for orderId');
            return { success: false, bookingId: null };
        } catch (error) {
            console.error('❌ Error getting bookingId:', error);
            return { success: false, bookingId: null };
        }
    }

    @Get('momo/success')
    async handleMoMoSuccess(
        @Query('orderId') orderId: string,
        @Query('resultCode') resultCode: string,
        @Query('amount') amount: string,
    ) {
        // This endpoint handles the redirect from MoMo after successful payment
        console.log('🔄 MoMo redirect - orderId:', orderId, 'resultCode:', resultCode);

        // Nếu thanh toán thành công (resultCode = 0), tự động update payment và booking status
        if (resultCode === '0') {
            try {
                // Find payment by orderId
                const payments = await this.paymentsService.findPaymentByMoMoOrderId(orderId);

                if (payments && payments.length > 0) {
                    const payment = payments[0];

                    // Update payment status to Completed (method này đã tự động update booking status)
                    await this.paymentsService.updatePaymentStatus(
                        payment.paymentId,
                        'Completed'
                    );

                    console.log('✅ Payment and booking status updated via MoMo redirect');
                }
            } catch (error) {
                console.error('❌ Error updating payment on MoMo redirect:', error);
            }
        }

        return {
            success: true,
            orderId,
            resultCode,
            amount,
        };
    }
}
