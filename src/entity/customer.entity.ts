import { Column, Entity, PrimaryColumn } from 'typeorm';
import BaseModel from './model.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('CUSTOMER')
export class Customer extends BaseModel {
  @PrimaryColumn()
  ID: string;

  @Column()
  USERNAME: string;

  @Column()
  @IsNotEmpty()
  CUSTOMER_TYPE: string;

  @Column()
  @IsNotEmpty()
  TAX_CODE: string;
}
