import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne,
  JoinColumn,
  CreateDateColumn 
} from 'typeorm';
import { Lote } from '../../lotes/entities/lote.entity';
import { Inquilino } from '../../inquilinos/entities/inquilino.entity';

@Entity('galpones')
export class Galpon {
  @PrimaryGeneratedColumn({ name: 'id_galpon' })
  id_galpon!: number;

  @Column('varchar', { length: 50 })
  nombre!: string;

  @Column('varchar', { length: 255 })
  direccion!: string;

  @ManyToOne(() => Lote, { eager: true, nullable: true })
  @JoinColumn({ name: 'lote_id' })
  lote!: Lote;

  @ManyToOne(() => Inquilino)
  @JoinColumn({ name: 'inquilino_id' })
  inquilino!: Inquilino;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion!: Date;
}