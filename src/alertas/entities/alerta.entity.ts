import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Lote } from '../../lotes/entities/lote.entity';
import { Galpon } from '../../galpones/entities/galpone.entity';

@Entity('alertas')
export class Alerta {
  @PrimaryGeneratedColumn({ name: 'id_alerta' })
  id_alerta!: number;

  @Column()
  titulo!: string;

  @Column({ type: 'text' })
  mensaje!: string;

  @Column()
  tipo!: string;

  @Column()
  prioridad!: string;

  @Column({ name: 'leida', default: false })
  leida!: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion!: Date;

  @Column({ name: 'lote_id', nullable: true })
  lote_id?: number;

  @ManyToOne(() => Lote, { nullable: true })
  @JoinColumn({ name: 'lote_id' })
  lote?: Lote;

  @Column({ name: 'galpon_id', nullable: true })
  galpon_id?: number;

  @ManyToOne(() => Galpon, { nullable: true })
  @JoinColumn({ name: 'galpon_id' })
  galpon?: Galpon;
}
