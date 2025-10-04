import { Booking } from 'src/bookings/entities/bookings.entity';
import { Flight } from 'src/flights/entities/flights.entity';
import { User } from 'src/users/entities/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';


@Entity('Reviews')
export class Review {
  @PrimaryGeneratedColumn()
  reviewId: number;

  @ManyToOne(() => Booking, (booking) => booking.reviews)
  booking: Booking;

  @ManyToOne(() => User, (user) => user.reviews)
  user: User;

  @ManyToOne(() => Flight, (flight) => flight.reviews)
  flight: Flight;

  @Column({ type: 'int' })
  rating: number; // constraint 1-5

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  reviewDate: Date;

  @Column({ default: false })
  isApproved: boolean;
}
