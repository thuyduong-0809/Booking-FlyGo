import { Airline } from 'src/airlines/entities/airlines.entity';
import { Flight } from 'src/flights/entities/flights.entity';
import { Seat } from 'src/seats/entities/seats.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';


@Entity('Aircrafts')
export class Aircraft {
  @PrimaryGeneratedColumn()
  aircraftId: number;

  @Column({ length: 10, unique: true })
  aircraftCode: string;

  @Column({ length: 100 })
  model: string;

  @Column({ default: 0 })
  economyCapacity: number;

  @Column({ default: 0 })
  businessCapacity: number;

  @Column({ default: 0 })
  firstClassCapacity: number;

  @Column({ type: 'json', nullable: true })
  seatLayoutJSON: object;

  @Column({ type: 'date', nullable: true })
  lastMaintenance: Date;

  @Column({ type: 'date', nullable: true })
  nextMaintenance: Date;

  @Column({ default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => Airline, (airline) => airline.aircrafts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'airlineId' })
  airline: Airline;

  @OneToMany(() => Flight, (flight) => flight.aircraft)
  flights: Flight[];

  @OneToMany(() => Seat, (seat) => seat.aircraft)
  seats: Seat[];
}
