import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn 
} from 'typeorm';
import { User } from '../../usuarios/entities/usuario.entity';
import { Lote } from '../../lotes/entities/lote.entity';

@Entity('produccion')
export class Produccion {
  @PrimaryGeneratedColumn()
  id_produccion!: number;

  @Column({ type: 'date' })
  fecha!: Date;

  // Categorías de huevos
  @Column({ type: 'int', default: 0 })
  jumbo!: number;

  @Column({ type: 'int', default: 0 })
  aaa!: number;

  @Column({ type: 'int', default: 0 })
  aa!: number;

  @Column({ type: 'int', default: 0 })
  a!: number;

  @Column({ type: 'int', default: 0 })
  b!: number;

  @Column({ type: 'int', default: 0 })
  c!: number;

  @Column({ type: 'int', default: 0 })
  total!: number;

  // Relación con Lote (usando el number que vimos en tu entity)
  @ManyToOne(() => Lote, { eager: true })
  @JoinColumn({ name: 'lote_id' })
  lote!: Lote;

  // Relación con Usuario (usando el UUID que vimos antes)
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'creado_por' })
  creado_por!: User;

  @CreateDateColumn({ name: 'fecha_registro' })
  fecha_registro!: Date;
}