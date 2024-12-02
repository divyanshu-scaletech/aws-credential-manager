import { UUID } from 'crypto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class IamUser {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column()
  username: string;

  @Column({ type: 'timestamp without time zone', nullable: true })
  expiration_time: Date | null;

  @Column({ default: false })
  has_login_profile: boolean;

  @Column({ default: false })
  has_access_key: boolean;

  @Column({ type: 'character varying', nullable: true })
  policy_name: string | null;
}
