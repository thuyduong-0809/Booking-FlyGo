import { Aircraft } from 'src/aircrafts/entities/aircrafts.entity';
import { Flight } from 'src/flights/entities/flights.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


@Entity('Airlines')
export class Airline {
  @PrimaryGeneratedColumn()
  airlineId: number;

  @Column({ length: 3, unique: true })
  airlineCode: string;

  @Column({ length: 100 })
  airlineName: string;

  @Column({ nullable: true })
  logoURL: string;

  @Column({ length: 20, nullable: true })
  contactNumber: string;

  @Column({ length: 100, nullable: true })
  website: string;

  @Column({ default: true })
  isActive: boolean;

//   Relations
  @OneToMany(() => Aircraft, (aircraft) => aircraft.airline)
  aircrafts: Aircraft[];

  @OneToMany(() => Flight, (flight) => flight.airline)
  flights: Flight[];
}
