import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../usuarios/entities/usuario.entity';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  uuid!: string;

  @Column({ unique: true })
  key!: string;

  @Column({ type: 'text' })
  value!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'modificado_por' })
  modificado_por?: User;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
