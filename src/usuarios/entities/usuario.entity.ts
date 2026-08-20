import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Generated
} from 'typeorm';
import { Rol } from '../../roles/entities/rol.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid!: string;

  @Column({ name: 'id_numeric' })
  @Generated('increment')
  id!: number;

  @Column('text')
  nombre!: string;

  @Column('text', { unique: true })
  correo!: string;

  @Column('text', { unique: true })
  nombre_usuario!: string;

  @Column('text', { select: false })
  contrasena_hash!: string;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'rol_id' })
  rol!: Rol;

  @CreateDateColumn()
  fecha_registro!: Date;

  @UpdateDateColumn()
  fecha_actualizacion!: Date;
}
