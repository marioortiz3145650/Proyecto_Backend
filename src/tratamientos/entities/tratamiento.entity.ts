import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tratamientos')
export class Tratamiento {
  @PrimaryGeneratedColumn()
  id_tratamiento: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column()
  tratamiento: string;

  // Relaciones (Solo los IDs por ahora para no complicar el Git)
  @Column()
  lote_id: number;

  @Column()
  estado_id: number;

  @Column()
  creado_por: number;
}