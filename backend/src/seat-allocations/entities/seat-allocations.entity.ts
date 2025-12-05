import { BookingFlight } from 'src/booking-flights/entities/booking-flights.entity';
import { Passenger } from 'src/passengers/entities/passengers.entity';
import { FlightSeat } from 'src/flight-seats/entities/flight-seats.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique, JoinColumn } from 'typeorm';

@Entity('SeatAllocations')
@Unique(['bookingFlight', 'flightSeat']) // Đảm bảo 1 ghế chỉ được đặt 1 lần cho 1 booking
@Unique(['bookingFlight', 'passenger']) // Đảm bảo 1 hành khách chỉ có 1 ghế trong 1 booking
export class SeatAllocation {
  @PrimaryGeneratedColumn()
  allocationId: number;

  // Relations
  @ManyToOne(() => BookingFlight, (bookingFlight) => bookingFlight.seatAllocations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'BookingFlightId' })
  bookingFlight: BookingFlight;

  // ✅ QUAN TRỌNG: Lưu FlightSeat để biết chính xác ghế nào trên chuyến bay nào
  // Có thể access thông tin Seat qua flightSeat.seat
  @ManyToOne(() => FlightSeat, (flightSeat) => flightSeat.seatAllocations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'flightSeatId' })
  flightSeat: FlightSeat;

  @ManyToOne(() => Passenger, (passenger) => passenger.seatAllocations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'passengerId' })
  passenger: Passenger;
}
