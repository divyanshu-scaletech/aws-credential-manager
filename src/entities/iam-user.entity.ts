import { UUID } from 'crypto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class IamUser {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column()
  username: string;

  @Column()
  expiration_time: Date;

  @Column({ default: false })
  has_login_profile: boolean;

  @Column({ type: 'varchar', nullable: true })
  policy_name: string | null;
}
