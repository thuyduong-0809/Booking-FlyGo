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
  JoinColumn,
  Unique,
} from 'typeorm';


@Entity('Flights')
export class Flight {
  @PrimaryGeneratedColumn()
  flightId: number;

  @Column({ length: 10 ,unique:true})
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
  // Quan hệ N-1: Flight thuộc Airline
  @ManyToOne(() => Airline, (airline) => airline.airlineId, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'airlineId' })
  airline: Airline;

  // Quan hệ N-1: Flight -> Departure Airport
  @ManyToOne(() => Airport, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'departureAirportId' })
  departureAirport: Airport;

   // Quan hệ N-1: Flight -> Arrival Airport
  @ManyToOne(() => Airport, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'arrivalAirportId' })
  arrivalAirport: Airport;

  // Quan hệ N-1: Flight -> Departure Terminal
  @ManyToOne(() => Terminal, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'departureTerminalId' })
  departureTerminal?: Terminal;

  // Quan hệ N-1: Flight -> Arrival Terminal
  @ManyToOne(() => Terminal, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'arrivalTerminalId' })
  arrivalTerminal?: Terminal;

  // Quan hệ N-1: Flight -> Aircraft
  @ManyToOne(() => Aircraft, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'aircraftId' })
  aircraft: Aircraft;

  @OneToMany(() => BookingFlight, (bf) => bf.flight)
  bookingFlights: BookingFlight[];

  @OneToMany(() => FareHistory, (fh) => fh.flight)
  fareHistories: FareHistory[];

  @OneToMany(() => Review, (review) => review.flight)
  reviews: Review[];
}
