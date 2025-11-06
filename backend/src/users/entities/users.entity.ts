import { Booking } from 'src/bookings/entities/bookings.entity';
import { FareHistory } from 'src/fare-history/entities/fare-history.entity';
import { Notification } from 'src/notifications/entities/notifications.entity';
import { Review } from 'src/reviews/entities/reviews.entity';
import { UserRole } from 'src/user-roles/entities/user-roles.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';


@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 50 })
  firstName: string;

  @Column({ type: 'varchar', length: 50 })
  lastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  passportNumber: string;

  @Column({ type: 'date', nullable: true })
  passportExpiry: Date;

  @Column({ type: 'int', default: 1 })
  roleId: number;

  @Column({ type: 'int', default: 0 })
  loyaltyPoints: number;

  @Column({
    type: 'enum',
    enum: ['Standard', 'Silver', 'Gold', 'Platinum'],
    default: 'Standard',
  })
  loyaltyTier: 'Standard' | 'Silver' | 'Gold' | 'Platinum';

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  lastLogin: Date;

  // Quan hệ n-1: nhiều User thuộc về 1 Role
  @ManyToOne(() => UserRole, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'roleId' })
  role: UserRole;


  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => FareHistory, (fh) => fh.changedBy)
  fareHistories: FareHistory[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}
