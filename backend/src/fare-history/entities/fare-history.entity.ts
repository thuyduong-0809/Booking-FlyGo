import { Flight } from 'src/flights/entities/flights.entity';
import { User } from 'src/users/entities/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';

export enum TravelClass {
  Economy = 'Economy',
  Business = 'Business',
  First = 'First',
}

@Entity('FareHistory')
export class FareHistory {
  @PrimaryGeneratedColumn()
  fareHistoryId: number;

  @ManyToOne(() => Flight, (flight) => flight.fareHistories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flightId' })
  flight: Flight;

  @Column({
    type: 'enum',
    enum: TravelClass,
  })
  travelClass: TravelClass;

  @Column('decimal', { precision: 10, scale: 2 })
  oldPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  newPrice: number;

  @CreateDateColumn()
  changedAt: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'changedBy' })
  changedBy?: User;

  @Column({ type: 'text', nullable: true })
  reason: string;
}
