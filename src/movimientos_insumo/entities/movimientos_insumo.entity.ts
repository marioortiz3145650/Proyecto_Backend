import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../usuarios/entities/user.entity';
import { Lote } from '../../lotes/entities/lote.entity';
import { Alimento } from '../../alimentos/entities/alimento.entity';

@Entity('movimientos_insumo')
export class MovimientosInsumo {
  @PrimaryGeneratedColumn()
  id_movimiento: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  cantidad: number;

  @Column({ type: 'varchar', length: 10 })
  tipo_movimiento: string; 

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @ManyToOne(() => Alimento, { eager: true })
  @JoinColumn({ name: 'insumo_id' })
  alimento: Alimento;

  @ManyToOne(() => Lote, { eager: true })
  @JoinColumn({ name: 'lote_id' })
  lote: Lote;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'creado_por' })
  creado_por: User;
}