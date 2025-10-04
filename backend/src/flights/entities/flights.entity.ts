import { Aircraft } from 'src/aircrafts/entities/aircrafts.entity';
import { Airline } from 'src/airlines/entities/airlines.entity';
import { Airport } from 'src/airports/entities/airports.entity';
import { BookingFlight } from 'src/booking-flights/entities/booking-flights.entity';
import { FareHistory } from 'src/fare-history/entities/fare-history.entity';
import { Review } from 'src/reviews/entities/reviews.entity';
import { Terminal } from 'src/terminals/entities/terminals.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';


@Entity('Flights')
export class Flight {
  @PrimaryGeneratedColumn()
  flightId: number;

  @Column({ length: 10 })
  flightNumber: string;

  @Column({ type: 'datetime' })
  departureTime: Date;

  @Column({ type: 'datetime' })
  arrivalTime: Date;

  @Column()
  duration: number;

  @Column({
    type: 'enum',
    enum: ['Scheduled', 'Boarding', 'Departed', 'Arrived', 'Delayed', 'Cancelled'],
    default: 'Scheduled',
  })
  status: string;

  @Column('decimal', { precision: 10, scale: 2 })
  economyPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  businessPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  firstClassPrice: number;

  @Column()
  availableEconomySeats: number;

  @Column()
  availableBusinessSeats: number;

  @Column()
  availableFirstClassSeats: number;

  // Relations
  @ManyToOne(() => Airline, (airline) => airline.flights)
  airline: Airline;

  @ManyToOne(() => Airport, (airport) => airport.departures)
  departureAirport: Airport;

  @ManyToOne(() => Airport, (airport) => airport.arrivals)
  arrivalAirport: Airport;

  @ManyToOne(() => Terminal, { nullable: true })
  departureTerminal: Terminal;

  @ManyToOne(() => Terminal, { nullable: true })
  arrivalTerminal: Terminal;

  @ManyToOne(() => Aircraft, (aircraft) => aircraft.flights)
  aircraft: Aircraft;

  @OneToMany(() => BookingFlight, (bf) => bf.flight)
  bookingFlights: BookingFlight[];

  @OneToMany(() => FareHistory, (fh) => fh.flight)
  fareHistories: FareHistory[];

  @OneToMany(() => Review, (review) => review.flight)
  reviews: Review[];
}
