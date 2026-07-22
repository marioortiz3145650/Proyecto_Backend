import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  Generated
} from 'typeorm';

@Entity('razas')
export class Raza {
  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid!: string;

  @Column({ name: 'id_raza' })
  @Generated('increment')
  id_raza!: number;

  @Column('varchar', { 
    length: 100, 
    name: 'nombre_raza',
    unique: true 
  })
  nombre_raza!: string;

  @Column('bool', { default: true })
  activo!: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion!: Date;
}