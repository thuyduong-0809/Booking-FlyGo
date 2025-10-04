import { Aircraft } from 'src/aircrafts/entities/aircrafts.entity';
import { SeatAllocation } from 'src/seat-allocations/entities/seat-allocations.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Unique } from 'typeorm';

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
  @ManyToOne(() => Aircraft, (aircraft) => aircraft.seats)
  aircraft: Aircraft;

  @OneToMany(() => SeatAllocation, (sa) => sa.seat)
  seatAllocations: SeatAllocation[];
}
