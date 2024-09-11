import { Column, Entity, PrimaryColumn } from 'typeorm';
import BaseModel from './model.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('PACKAGE_TYPE')
export class ItemType extends BaseModel {
  @PrimaryColumn()
  @IsNotEmpty()
  ID: string;

  @Column()
  @IsNotEmpty()
  NAME: string;
}
