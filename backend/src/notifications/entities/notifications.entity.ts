import { User } from 'src/users/entities/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
// import { User } from './user.entity';

export enum NotificationType {
  Booking = 'Booking',
  Flight = 'Flight',
  Payment = 'Payment',
  System = 'System',
}

@Entity('Notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  notificationId: number;

  @ManyToOne(() => User, (user) => user.notifications,{ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'int', nullable: true })
  RelatedId?: number;
}
