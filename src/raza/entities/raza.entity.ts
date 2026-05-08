import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn 
} from 'typeorm';

@Entity('razas')
export class Breed {
  @PrimaryGeneratedColumn({ name: 'id_raza' })
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