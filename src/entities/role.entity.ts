import { UUID } from 'crypto';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolePermissions } from './role-permissions.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column()
  name: string;

  @OneToMany(() => RolePermissions, (role_permissions) => role_permissions.role)
  role_permissions: RolePermissions[];
}
