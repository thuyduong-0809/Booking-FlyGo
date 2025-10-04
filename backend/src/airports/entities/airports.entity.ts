import { Flight } from 'src/flights/entities/flights.entity';
import { Terminal } from 'src/terminals/entities/terminals.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


@Entity('Airports')
export class Airport {
  @PrimaryGeneratedColumn()
  airportId: number;

  @Column({ length: 3, unique: true })
  airportCode: string;

  @Column({ length: 100 })
  airportName: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  country: string;

  @Column({ length: 50, nullable: true })
  timezone: string;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  Relations
  @OneToMany(() => Terminal, (terminal) => terminal.airport)
  terminals: Terminal[];

  @OneToMany(() => Flight, (flight) => flight.departureAirport)
  departures: Flight[];

  @OneToMany(() => Flight, (flight) => flight.arrivalAirport)
  arrivals: Flight[];
}
