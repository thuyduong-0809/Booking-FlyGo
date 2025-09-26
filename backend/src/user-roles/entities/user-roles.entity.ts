
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
  RoleID: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  RoleName: string;

  @Column({ type: 'text', nullable: true })
  Description: string;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  // Quan hệ 1-n: Một Role có nhiều User
  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
