import { Booking } from 'src/bookings/entities/bookings.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('RefundHistory')
export class RefundHistory {
    @PrimaryGeneratedColumn()
    refundHistoryId: number;

    // Booking information
    @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bookingId' })
    booking: Booking;

    @Column({ length: 10 })
    bookingReference: string;

    // Refund request details
    @Column({
        type: 'enum',
        enum: [
            'AIRLINE_SCHEDULE_CHANGE',
            'CUSTOMER_CANCELLATION',
            'WRONG_INFORMATION',
            'PAYMENT_ERROR',
            'HEALTH_ISSUE',
            'OTHER'
        ]
    })
    refundReason: string;

    @Column('decimal', { precision: 12, scale: 2 })
    refundAmount: number;

    // Contact information from request
    @Column({ length: 255 })
    passengerName: string;

    @Column({ length: 255 })
    email: string;

    // Supporting documents
    @Column({ type: 'text', nullable: true })
    documents: string; // JSON string array of document URLs/names

    // Status tracking
    @Column({
        type: 'enum',
        enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
        default: 'Pending'
    })
    status: string;

    @CreateDateColumn()
    requestedAt: Date;

    @UpdateDateColumn({ nullable: true })
    processedAt: Date;

    // Tên người duyệt (Admin)
    @Column({ length: 255, nullable: true })
    processedBy?: string;

    @Column({ type: 'text', nullable: true })
    adminNotes: string; // Notes from admin when processing
}
