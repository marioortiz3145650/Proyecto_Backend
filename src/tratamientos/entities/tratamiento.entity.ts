import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Generated } from 'typeorm';
import { Lote } from '../../lotes/entities/lote.entity';
import { User } from '../../usuarios/entities/usuario.entity';

@Entity('tratamientos')
export class Tratamiento {
  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid!: string;

  @Column({ name: 'id_tratamiento' })
  @Generated('increment')
  id_tratamiento!: number;

  @Column({ type: 'date' })
  fecha!: Date;

  @Column()
  tratamiento!: string;

  @ManyToOne(() => Lote, { eager: true })
  @JoinColumn({ name: 'lote_id' })
  lote!: Lote;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'creado_por' })
  creado_por!: User;
}