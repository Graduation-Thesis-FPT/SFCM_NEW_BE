import { Column, Entity, PrimaryColumn } from 'typeorm';
import BaseModel from './model.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('CONTAINER_TARIFF')
export class ContainerTariff extends BaseModel {
  @PrimaryColumn()
  ID: string;

  @Column()
  @IsNotEmpty()
  NAME: string;

  @Column()
  @IsNotEmpty()
  CNTR_SIZE: number;

  @Column()
  @IsNotEmpty()
  UNIT_PRICE: number;

  @Column()
  @IsNotEmpty()
  VAT_RATE: number;

  @Column()
  @IsNotEmpty()
  VALID_FROM: Date;

  @Column()
  @IsNotEmpty()
  VALID_UNTIL: Date;

  @Column()
  @IsNotEmpty()
  STATUS: string;
}
