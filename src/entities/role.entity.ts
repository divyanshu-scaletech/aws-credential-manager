import { UUID } from 'crypto';
import { Permissions } from 'src/constants/enums';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique('UQ_Role_name_permission', ['name', 'permission'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: Permissions })
  permission: Permissions;
}
