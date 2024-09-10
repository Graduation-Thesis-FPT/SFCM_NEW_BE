import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseModel from './model.entity';

@Entity('ROLE')
export class Role extends BaseModel {
  @Column('uuid')
  ROWGUID: string;

  @PrimaryGeneratedColumn()
  @IsNotEmpty()
  ROLE_CODE: string;

  @Column()
  @IsNotEmpty()
  ROLE_NAME: string;
}
