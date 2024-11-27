import { UUID } from 'crypto';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Role } from './role.entity';

@Entity()
@Unique('UQ_User_username', ['username'])
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
