import { Flight } from 'src/flights/entities/flights.entity';
import { Seat } from 'src/seats/entities/seats.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, JoinColumn } from 'typeorm';

@Entity('FlightSeats')
@Unique(['flight', 'seat'])
export class FlightSeat {
    @PrimaryGeneratedColumn()
    flightSeatId: number;

    @Column({ default: true })
    isAvailable: boolean;

    // Relations
    @ManyToOne(() => Flight, (flight) => flight.flightSeats, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'flightId' })
    flight: Flight;

    @ManyToOne(() => Seat, (seat) => seat.flightSeats, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'seatId' })
    seat: Seat;
}

