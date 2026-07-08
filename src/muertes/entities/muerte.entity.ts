import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn,
  Generated
} from 'typeorm';
import { Lote } from '../../lotes/entities/lote.entity';
import { User } from '../../usuarios/entities/usuario.entity';

@Entity('muertes')
export class Muerte {

  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid!: string;

  @Column({ name: 'id_muerte' })
  @Generated('increment')
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
