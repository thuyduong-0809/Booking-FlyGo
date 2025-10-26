import { Booking } from 'src/bookings/entities/bookings.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export interface MoMoPaymentDetails {
    momoRequestId: string;
    momoOrderId: string;
    payUrl?: string;
    deepLink?: string;
    qrCodeUrl?: string;
    // IPN callback fields
    transId?: string;
    momoTransactionId?: string;
    momoResultCode?: number;
    momoMessage?: string;
    momoPayType?: string;
    momoResponseTime?: number;
    failureReason?: string;
    paymentCode?: string;
}

@Entity('Payments')
export class Payment {
    @PrimaryGeneratedColumn()
    paymentId: number;

    @Column('decimal', { precision: 12, scale: 2 })
    amount: number;

    @Column({
        type: 'enum',
        enum: ['CreditCard', 'DebitCard', 'PayPal', 'BankTransfer', 'MoMo'],
    })
    paymentMethod: string;

    @Column({
        type: 'enum',
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Pending',
    })
    paymentStatus: string;

    @Column({ length: 255, nullable: true })
    transactionId: string;

    @Column({ type: 'json', nullable: true })
    paymentDetails: MoMoPaymentDetails;

    @Column({ type: 'datetime', nullable: true })
    paidAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relations
    @ManyToOne(() => Booking, (booking) => booking.payments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bookingId' })
    booking: Booking;
}

