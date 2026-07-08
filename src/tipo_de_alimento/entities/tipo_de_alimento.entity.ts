import { Entity, Column, PrimaryGeneratedColumn, Generated } from 'typeorm';

@Entity('tipo_de_alimentos')
export class TipoDeAlimento {

  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid!: string;

  @Column({ name: 'id_tipo_insumo' })
  @Generated('increment')
  id_tipo_insumo!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;
}