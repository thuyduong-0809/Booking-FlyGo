import { Booking } from 'src/bookings/entities/bookings.entity';
import { CheckIn } from 'src/check-ins/entities/check-ins.entity';
import { Flight } from 'src/flights/entities/flights.entity';
import { SeatAllocation } from 'src/seat-allocations/entities/seat-allocations.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';


@Entity('BookingFlights')
export class BookingFlight {
  @PrimaryGeneratedColumn()
  bookingFlightId: number;

  @Column({
    type: 'enum',
    enum: ['Economy', 'Business', 'First'],
  })
  travelClass: string;

  @Column('decimal', { precision: 10, scale: 2 })
  fare: number;

  @Column({ length: 10, nullable: true })
  seatNumber: string;

  @Column({ default: 0 })
  baggageAllowance: number;

  // Relations
  @ManyToOne(() => Booking, (booking) => booking.bookingFlights)
  booking: Booking;

  @ManyToOne(() => Flight, (flight) => flight.bookingFlights)
  flight: Flight;

  @OneToMany(() => SeatAllocation, (sa) => sa.bookingFlight)
  seatAllocations: SeatAllocation[];

  @OneToMany(() => CheckIn, (checkIn) => checkIn.bookingFlight)
  checkIns: CheckIn[];

  
}
