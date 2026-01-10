import { UserRole } from 'src/roles/entities/user-role.entity';
import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { ulid } from 'ulid';

@Entity()
export class User {
  @PrimaryColumn({ type: 'varchar', length: 26 })
  id: string = ulid();

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column()
  password: string;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  roles: UserRole[];

  @Column({ type: 'boolean', default: false, nullable: true })
  email_verified: boolean;

  @Column({ nullable: true })
  date_of_birth: string;

  @Column({ default: true })
  isActive: boolean;
}
