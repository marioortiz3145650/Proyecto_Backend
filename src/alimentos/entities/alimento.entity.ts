import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UnidadMedida } from '../../unidades_de_medida/entities/unidades_de_medida.entity';
import { TipoDeAlimento } from 'src/tipo_de_alimento/entities/tipo_de_alimento.entity';

@Entity('alimento')
export class Alimento {

  @PrimaryGeneratedColumn({ name: 'id_insumo' })
  id_insumo: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ManyToOne(() => TipoDeAlimento)
  @JoinColumn({ name: 'tipo_alimento_id' })
  tipo_alimento: TipoDeAlimento;

  @ManyToOne(() => UnidadMedida)
  @JoinColumn({ name: 'unidad_medida_id' })
  unidad_medida: UnidadMedida;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  stock_actual: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  stock_minimo: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  precio_unitario: number;
}