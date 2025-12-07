import { Aircraft } from 'src/aircrafts/entities/aircrafts.entity';
import { FlightSeat } from 'src/flight-seats/entities/flight-seats.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Unique, JoinColumn } from 'typeorm';

@Entity('Seats')
@Unique(['aircraft', 'seatNumber'])
export class Seat {
  @PrimaryGeneratedColumn()
  seatId: number;

  @Column({ length: 10 })
  seatNumber: string;

  @Column({
    type: 'enum',
    enum: ['Economy', 'Business', 'First'],
  })
  travelClass: string;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'json', nullable: true })
  features: object;

  // Relations
  @ManyToOne(() => Aircraft, (aircraft) => aircraft.seats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'aircraftId' })
  aircraft: Aircraft;

  @OneToMany(() => FlightSeat, (flightSeat) => flightSeat.seat)
  flightSeats: FlightSeat[];
}
