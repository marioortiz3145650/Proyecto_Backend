import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('alimento')
export class Alimento {

  @PrimaryGeneratedColumn()
  id_insumo: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column()
  tipo_alimento_id: number;

  @Column()
  unidad_medida_id: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  stock_actual: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  stock_minimo: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  precio_unitario: number;
}