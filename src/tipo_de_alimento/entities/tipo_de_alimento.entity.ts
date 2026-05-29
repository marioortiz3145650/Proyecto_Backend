import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tipo_de_alimentos')
export class TipoDeAlimento {

  @PrimaryGeneratedColumn({ name: 'id_tipo_insumo' })
  id_tipo_insumo!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;
}