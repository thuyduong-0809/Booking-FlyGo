import { Controller } from '@nestjs/common';
import { UserRole } from 'src/user-roles/entities/user-roles.entity';

@Controller('users')
export class UsersController {}
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';


@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  UserID: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  Email: string;

  @Column({ type: 'varchar', length: 255 })
  PasswordHash: string;

  @Column({ type: 'varchar', length: 50 })
  FirstName: string;

  @Column({ type: 'varchar', length: 50 })
  LastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  Phone: string;

  @Column({ type: 'date', nullable: true })
  DateOfBirth: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  PassportNumber: string;

  @Column({ type: 'date', nullable: true })
  PassportExpiry: Date;

  @Column()
  RoleID: number;

  @Column({ type: 'int', default: 0 })
  LoyaltyPoints: number;

  @Column({
    type: 'enum',
    enum: ['Standard', 'Silver', 'Gold', 'Platinum'],
    default: 'Standard',
  })
  LoyaltyTier: 'Standard' | 'Silver' | 'Gold' | 'Platinum';

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  LastLogin: Date;

  // Quan hệ n-1: nhiều User thuộc về 1 Role
  @ManyToOne(() => UserRole, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'RoleID' })
  role: UserRole;
}
