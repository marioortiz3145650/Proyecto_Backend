import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Generated } from 'typeorm';
import { User } from '../../usuarios/entities/usuario.entity';

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid!: string;

  @Column({ name: 'id_numeric' })
  @Generated('increment')
  id!: number;

  @Column('text', { unique: true })
  nombre!: string;

  @OneToMany(() => User, (user) => user.rol)
  usuarios!: User[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion!: Date;
}