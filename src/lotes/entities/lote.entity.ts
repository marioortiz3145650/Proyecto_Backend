import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  Generated
} from 'typeorm';
import { Breed } from '../../raza/entities/raza.entity';
import { Galpon } from '../../galpones/entities/galpone.entity';

@Entity('lotes')
export class Lote {
  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid!: string;

  @Column({ name: 'id_lote' })
  @Generated('increment')
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

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion!: Date;
}
