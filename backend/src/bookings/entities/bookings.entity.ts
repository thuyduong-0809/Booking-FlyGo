import { BookingFlight } from 'src/booking-flights/entities/booking-flights.entity';
import { Passenger } from 'src/passengers/entities/passengers.entity';
import { Payment } from 'src/payments/entities/payments.entity';
import { Review } from 'src/reviews/entities/reviews.entity';
import { User } from 'src/users/entities/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('Bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  bookingId: number;

  @Column({ length: 10, unique: true })
  bookingReference: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending',
  })
  paymentStatus: string;

  @Column({
    type: 'enum',
    enum: ['Reserved', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Reserved',
  })
  bookingStatus: string;

  @Column({ length: 100 })
  contactEmail: string;

  @Column({ length: 20 })
  contactPhone: string;

  @Column({ type: 'text', nullable: true })
  specialRequests: string;

  @Column({
    type: 'datetime',
    nullable: false
  })
  bookedAt: Date;

  // Relations - Mọi booking đều có user (guest hoặc registered)
  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => BookingFlight, (bf) => bf.booking)
  bookingFlights: BookingFlight[];

  @OneToMany(() => Passenger, (p) => p.booking)
  passengers: Passenger[];

  @OneToMany(() => Payment, (p) => p.booking)
  payments: Payment[];

  @OneToMany(() => Review, (review) => review.booking)
  reviews: Review[];
}
