import { Booking } from 'src/bookings/entities/bookings.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity('CancelHistory')
export class CancelHistory {
    @PrimaryGeneratedColumn()
    cancelHistoryId: number;

    // Booking information
    @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bookingId' })
    booking: Booking;

    @Column({ length: 10 })
    bookingReference: string;

    // Cancellation details
    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    cancellationFee: number;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    refundAmount: number;

    @Column('decimal', { precision: 12, scale: 2 })
    totalAmount: number;

    // Reason and metadata
    @Column({ type: 'text', nullable: true })
    reason: string;

    @CreateDateColumn()
    cancelledAt: Date;

    // Tên người hủy (string)
    @Column({ length: 255, nullable: true })
    cancelledBy?: string;
}
