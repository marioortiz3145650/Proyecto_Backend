import { Entity, Column, PrimaryGeneratedColumn, Generated } from 'typeorm';

@Entity('unidades_de_medida')
export class UnidadMedida {

  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid!: string;

  @Column({ name: 'id_unidad' })
  @Generated('increment')
  id_unidad!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 20 })
  abreviatura!: string;
}