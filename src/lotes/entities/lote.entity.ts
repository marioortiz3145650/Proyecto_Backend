import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn,
  OneToMany,
  CreateDateColumn 
} from 'typeorm';
import { Breed } from '../../raza/entities/raza.entity';
import { Galpon } from '../../galpones/entities/galpone.entity';

@Entity('lotes')
export class Lote {
  @PrimaryGeneratedColumn({ name: 'id_lote' })
  id_lote!: number;

  @ManyToOne(() => Breed, { eager: true, nullable: true })
  @JoinColumn({ name: 'raza_id' })
  raza!: Breed;

  @Column('int', { name: 'edad_semanas' })
  edad_semanas!: number;

  @Column('decimal', { 
    name: 'produccion_pct', 
    precision: 5, 
    scale: 2,
    default: 0 
  })
  produccion_pct!: number;

  @Column('date', { name: 'fecha_inicio' })
  fecha_inicio!: Date;

  @Column('date', { name: 'fecha_fin', nullable: true })
  fecha_fin!: Date | null;

  @OneToMany(() => Galpon, (galpon) => galpon.lote)
  galpones!: Galpon[];

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion!: Date;
}