import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('lote_cierre')
export class LoteCierre {
  @PrimaryGeneratedColumn()
  id_cierre: number;

  @Column()
  lote_id: number;

  @Column()
  galpon_id: number;

  @Column({ type: 'date' })
  fecha_cierre: Date;

  @Column({ type: 'date' })
  fecha_inicio: Date;

  @Column({ type: 'date' })
  fecha_fin: Date;

  // Métricas finales
  @Column()
  cantidad_inicial: number;

  @Column()
  cantidad_final: number;

  @Column()
  mortalidad_total: number;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  mortalidad_porcentaje: number;

  // Producción
  @Column()
  huevos_totales: number;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  promedio_produccion: number;

  @Column()
  semanas_produccion: number;

  // Consumo
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  alimento_consumido_total: number;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  conversion_alimenticia: number;

  // Económico
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  costo_total: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  ingresos_totales: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  ganancia: number;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column()
  usuario_cierre_id: number;

  @CreateDateColumn()
  fecha_registro: Date;
}