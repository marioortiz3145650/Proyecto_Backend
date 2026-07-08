import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Generated } from 'typeorm';
import { Lote } from '../../lotes/entities/lote.entity';
import { Galpon } from '../../galpones/entities/galpone.entity';

@Entity('alertas')
export class Alerta {
  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid!: string;

  @Column({ name: 'id_alerta' })
  @Generated('increment')
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

  @Column({ name: 'lote_id', type: 'uuid', nullable: true })
  lote_id?: string;

  @ManyToOne(() => Lote, { nullable: true })
  @JoinColumn({ name: 'lote_id' })
  lote?: Lote;

  @Column({ name: 'galpon_id', type: 'uuid', nullable: true })
  galpon_id?: string;

  @ManyToOne(() => Galpon, { nullable: true })
  @JoinColumn({ name: 'galpon_id' })
  galpon?: Galpon;
}
