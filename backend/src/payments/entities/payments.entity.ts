import { Booking } from 'src/bookings/entities/bookings.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('Payments')
export class Payment {
  @PrimaryGeneratedColumn()
  paymentId: number;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['CreditCard', 'DebitCard', 'PayPal', 'BankTransfer'],
  })
  paymentMethod: string;

  @Column({
    type: 'enum',
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending',
  })
  paymentStatus: string;

  @Column({ length: 100, nullable: true })
  transactionId: string;

  @Column({ type: 'json', nullable: true })
  paymentDetails: object;

  @Column({ type: 'datetime', nullable: true })
  paidAt: Date;

  // Relations
  @ManyToOne(() => Booking, (booking) => booking.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;
}
