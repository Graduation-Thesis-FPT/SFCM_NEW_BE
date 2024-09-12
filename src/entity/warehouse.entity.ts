import { Column, Entity, PrimaryColumn } from 'typeorm';
import BaseModel from './model.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('WAREHOUSE')
export class WareHouse extends BaseModel {
  @PrimaryColumn()
  @IsNotEmpty()
  ID: string;

  @Column()
  @IsNotEmpty()
  NAME: string;
}
