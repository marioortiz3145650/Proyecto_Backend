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
import { Inquilino } from '../../inquilinos/entities/inquilino.entity';

@Entity('lotes')
export class Lote {
  @PrimaryGeneratedColumn({ name: 'id_lote' })
  id_lote!: number;

  @ManyToOne(() => Breed, { eager: true, nullable: true })
  @JoinColumn({ name: 'raza_id' })
  raza!: Breed;

  @Column('int', { name: 'edad_semanas' })
  edad_semanas!: number;


  @Column('date', { name: 'fecha_inicio' })
  fecha_inicio!: Date;

  @Column('date', { name: 'fecha_fin', nullable: true })
  fecha_fin!: Date | null;

  @OneToMany(() => Galpon, (galpon) => galpon.lote)
  galpones!: Galpon[];

  @Column('int', { name: 'total_gallinas', default: 0 })
  total_gallinas!: number;

  @ManyToOne(() => Inquilino)
  @JoinColumn({ name: 'inquilino_id' })
  inquilino!: Inquilino;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion!: Date;
}