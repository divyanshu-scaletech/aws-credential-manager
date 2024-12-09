import { Permissions } from '../constants/enums';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Role } from './role.entity';
import { UUID } from 'crypto';

@Entity()
export class RolePermissions {
  @PrimaryColumn({
    type: 'simple-enum',
    enum: Permissions,
    primaryKeyConstraintName: 'PK_Role_Permissions_permission_id_role_id',
  })
  permission: Permissions;

  @PrimaryColumn({
    primaryKeyConstraintName: 'PK_Role_Permissions_permission_id_role_id',
  })
  role_id: UUID;

  @ManyToOne(() => Role, { nullable: false })
  @JoinColumn({
    name: 'role_id',
    foreignKeyConstraintName: 'FK_Role_Permissions_role_id',
  })
  role: Role;
}
