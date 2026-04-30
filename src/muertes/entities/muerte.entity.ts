import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { Lote } from '../../lotes/entities/lote.entity';
import { User } from 'src/usuarios/entities/usuario.entity';

@Entity('muertes')
export class Muerte {

  @PrimaryGeneratedColumn({ name: 'id_muerte' })
  id_muerte!: number;

  @Column('date')
  fecha!: Date;

  @Column('int')
  cantidad!: number;

  @Column('varchar', { length: 255 })
  causa!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'usuario_id' })
    usuario!: User;

  @ManyToOne(() => Lote)
  @JoinColumn({ name: 'lote_id' })
  lote!: Lote;
}