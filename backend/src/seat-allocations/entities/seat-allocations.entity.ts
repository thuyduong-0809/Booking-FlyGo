import { BookingFlight } from 'src/booking-flights/entities/booking-flights.entity';
import { Passenger } from 'src/passengers/entities/passengers.entity';
import { Seat } from 'src/seats/entities/seats.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';

@Entity('SeatAllocations')
@Unique(['bookingFlight', 'seat'])
@Unique(['bookingFlight', 'passenger'])
export class SeatAllocation {
  @PrimaryGeneratedColumn()
  allocationId: number;

  // Relations
  @ManyToOne(() => BookingFlight, (bf) => bf.seatAllocations)
  bookingFlight: BookingFlight;

  @ManyToOne(() => Seat, (seat) => seat.seatAllocations)
  seat: Seat;

  @ManyToOne(() => Passenger, (p) => p.seatAllocations)
  passenger: Passenger;
}
