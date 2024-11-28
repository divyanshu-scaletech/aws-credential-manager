import { Permissions } from 'src/constants/enums';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Role } from './role.entity';
import { UUID } from 'crypto';

@Entity()
export class RolePermissions {
  @PrimaryColumn({ type: 'enum', enum: Permissions })
  permission: Permissions;

  @PrimaryColumn()
  role_id: UUID;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
