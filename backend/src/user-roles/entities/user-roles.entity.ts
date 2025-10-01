
import { User } from 'src/users/entities/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';


@Entity('UserRoles')
export class UserRole {
  @PrimaryGeneratedColumn()
  roleId: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  roleName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  // Quan hệ 1-n: Một Role có nhiều User
  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
