import { UUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RequestHistory {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column()
  method: string;

  @Column()
  ip: string;

  @Column()
  url: string;

  @Column()
  user_agent: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
