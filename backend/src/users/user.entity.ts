import { Exclude } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../common/abstract.entity';
import { UserRole } from './enums/user-role.enum';

@Entity('users')
export class UserEntity extends AbstractEntity {
  @Column({
    unique: true,
  })
  email: string;

  @Exclude()
  @Column()
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;
}
