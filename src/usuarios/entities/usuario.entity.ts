import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Rol } from 'src/roles/entities/rol.entity';
import { Inquilino } from 'src/inquilinos/entities/inquilino.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  @ManyToOne(() => Inquilino)
  @JoinColumn({ name: 'inquilino_id' })
  inquilino!: Inquilino;

  @Column('bool', { default: true }) 
  activo!: boolean;

  @CreateDateColumn()
  fecha_registro!: Date;

  @UpdateDateColumn()
  fecha_actualizacion!: Date;
}