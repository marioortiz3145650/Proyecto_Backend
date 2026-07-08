import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Generated
} from 'typeorm';
import { Lote } from '../../lotes/entities/lote.entity';

@Entity('galpones')
export class Galpon {
  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid!: string;

  @Column({ name: 'id_galpon' })
  @Generated('increment')
  id_galpon!: number;

  @Column('varchar', { length: 50 })
  nombre!: string;

  @Column('varchar', { length: 255 })
  direccion!: string;

  @ManyToOne(() => Lote, { eager: true, nullable: true })
  @JoinColumn({ name: 'lote_id' })
  lote!: Lote;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion!: Date;
}
