import { BookingFlight } from 'src/booking-flights/entities/booking-flights.entity';
import { Passenger } from 'src/passengers/entities/passengers.entity';
import { Seat } from 'src/seats/entities/seats.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique, JoinColumn } from 'typeorm';

@Entity('SeatAllocations')
@Unique(['bookingFlight', 'seat'])
@Unique(['bookingFlight', 'passenger'])
export class SeatAllocation {
  @PrimaryGeneratedColumn()
  allocationId: number;

  // Relations
  @ManyToOne(() => BookingFlight, (bookingFlight) => bookingFlight.seatAllocations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'BookingFlightId' })  
  bookingFlight: BookingFlight;

  @ManyToOne(() => Seat, (seat) => seat.seatAllocations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'seatId' })            
  seat: Seat;

  @ManyToOne(() => Passenger, (passenger) => passenger.seatAllocations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'passengerId' })      
  passenger: Passenger;
}
