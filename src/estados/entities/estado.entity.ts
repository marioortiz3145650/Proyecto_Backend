
// entities/estado.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Estado {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;
}