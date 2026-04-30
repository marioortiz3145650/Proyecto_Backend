import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('unidades_de_medida')
export class UnidadMedida {

  @PrimaryGeneratedColumn({ name: 'id_unidad' })
  id_unidad!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 20 })
  abreviatura!: string;
}