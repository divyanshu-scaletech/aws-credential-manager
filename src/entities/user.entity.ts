import { UUID } from 'crypto';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity()
@Index('UQ_User_username', ['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column()
  username: string;

  @Column()
  password_hash: string;

  @Column()
  is_accepted: boolean;

  @ManyToOne(() => Role, { nullable: false })
  @JoinColumn({ name: 'role_id', foreignKeyConstraintName: 'FK_User_role_id' })
  role: Role;
}
