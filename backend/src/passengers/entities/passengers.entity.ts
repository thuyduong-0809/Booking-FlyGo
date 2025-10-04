import { Booking } from 'src/bookings/entities/bookings.entity';
import { CheckIn } from 'src/check-ins/entities/check-ins.entity';
import { SeatAllocation } from 'src/seat-allocations/entities/seat-allocations.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';


@Entity('Passengers')
export class Passenger {
  @PrimaryGeneratedColumn()
  passengerId: number;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ length: 50, nullable: true })
  passportNumber: string;

  @Column({
    type: 'enum',
    enum: ['Adult', 'Child', 'Infant'],
    default: 'Adult',
  })
  passengerType: string;

  // Relations
  @ManyToOne(() => Booking, (booking) => booking.passengers)
  booking: Booking;

  @OneToMany(() => SeatAllocation, (sa) => sa.passenger)
  seatAllocations: SeatAllocation[];

  @OneToMany(() => CheckIn, (checkIn) => checkIn.passenger)
  checkIns: CheckIn[];
}
