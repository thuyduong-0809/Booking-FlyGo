// import { Account } from 'src/accounts/entities/account.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name', type: 'varchar', length: 255 ,nullable: true })
  full_name: string;

  @Column({ type: 'varchar', length: 100, unique: true ,nullable:false })
  email: string;

  @Column({ type: 'varchar', length: 25, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 12, nullable: true})
  cccd: string;

  @Column({
    type: 'enum',
    enum: ['male', 'female'],
    nullable: true,
  })
  sex: 'male' | 'female';

  @Column({ type: 'varchar', length: 255, nullable: true})
  country: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'customer'],
    default: 'customer',
  })
  role: 'admin' | 'customer';

  @Column({
    name: 'status_verify',
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'inactive',
  })
  status_verify: 'active' | 'inactive';

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({nullable:true, default: null})
  refresh_token: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Quan hệ 1-1 với Account
  // @OneToOne(() => Account, (account) => account.user)
  // account: Account;
}


