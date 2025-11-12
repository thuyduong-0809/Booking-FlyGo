import { BookingFlight } from 'src/booking-flights/entities/booking-flights.entity';
import { Passenger } from 'src/passengers/entities/passengers.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';

export enum CheckInType {
  Online = 'Online',
  Airport = 'Airport',
}

export enum BoardingStatus {
  NotBoarded = 'NotBoarded',
  Boarded = 'Boarded',
  GateClosed = 'GateClosed',
}

@Entity('CheckIns')
export class CheckIn {
  @PrimaryGeneratedColumn()
  checkInId: number;

  // Relations
  @ManyToOne(() => BookingFlight, (bookingFlight) => bookingFlight.checkIns,{onDelete: 'CASCADE'})
  @JoinColumn({name: 'bookingFlightId'})
  bookingFlight: BookingFlight;

  @ManyToOne(() => Passenger, (passenger) => passenger.checkIns,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'passengerId' })
  passenger: Passenger;

  @Column({
    type: 'enum',
    enum: CheckInType,
  })
  checkInType: CheckInType;

  @CreateDateColumn()
  checkedInAt: Date;

  @Column({ nullable: true })
  boardingPassUrl: string;

  @Column({ default: 1 })
  baggageCount: number;

  @Column('decimal', { precision: 5, scale: 2, default: 7 })
  baggageWeight: number;

  @Column({
    type: 'enum',
    enum: BoardingStatus,
    default: BoardingStatus.NotBoarded,
  })
  boardingStatus: BoardingStatus;

  
}
