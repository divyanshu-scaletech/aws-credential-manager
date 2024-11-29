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
export class RequestResponseHistory {
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

  @Column({ type: 'integer', nullable: true })
  response_status_code: number | null;

  @Column({ type: 'bigint', nullable: true })
  time_taken: number | null;

  @CreateDateColumn()
  request_arrival_time: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}
