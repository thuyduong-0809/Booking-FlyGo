import { Airport } from 'src/airports/entities/airports.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';


@Entity('Terminals')
export class Terminal {
  @PrimaryGeneratedColumn()
  terminalId: number;

  @Column({ length: 10 })
  terminalCode: string;

  @Column({ length: 100, nullable: true })
  terminalName: string;

  // Relations
  @ManyToOne(() => Airport, (airport) => airport.terminals, { onDelete: 'CASCADE' })
  airport: Airport;
}
