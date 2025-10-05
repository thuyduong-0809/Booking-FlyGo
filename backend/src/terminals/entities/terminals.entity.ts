import { Airport } from 'src/airports/entities/airports.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';


@Entity('Terminals')
@Unique(['airport', 'terminalCode']) // tương ứng UNIQUE KEY (AirportID, TerminalCode)
export class Terminal {
  @PrimaryGeneratedColumn({ name: 'TerminalID' })
  terminalId: number;

  @Column({ name: 'TerminalCode', type: 'varchar', length: 10 })
  terminalCode: string;

  @Column({ name: 'TerminalName', type: 'varchar', length: 100, nullable: true })
  terminalName?: string;

  // Quan hệ N-1: nhiều Terminal thuộc 1 Airport
  @ManyToOne(() => Airport, (airport) => airport.terminals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'airportId' })
  airport: Airport;
}