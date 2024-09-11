import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseModel from './model.entity';

@Entity('ROLE')
export class Role extends BaseModel {
  @PrimaryGeneratedColumn()
  @IsNotEmpty()
  ID: string;

  @Column()
  @IsNotEmpty()
  NAME: string;
}
