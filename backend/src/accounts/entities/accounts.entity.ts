import { User } from 'src/users/entities/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';


@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string; // trùng với User.email

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: true })
  password: string; // có thể null nếu login Google/Facebook

  @Column({
    type: 'enum',
    enum: ['local', 'google'],
    default: 'local',
  })
  provider: 'local' | 'google';


  @Column({ nullable: true })
  providerId: string; // googleId, facebookId... (nếu provider != local)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.account, {onDelete: 'CASCADE'})
  @JoinColumn({ name: 'user_id' })
  user: User;
}

