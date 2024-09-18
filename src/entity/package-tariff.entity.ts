import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import BaseModel from './model.entity';

@Entity('PACKAGE_TARIFF')
export class PackageTariffEntity extends BaseModel {
  @PrimaryColumn()
  ID: string;

  @Column()
  @IsNotEmpty()
  NAME: string;

  @Column()
  @IsNotEmpty()
  VALID_FROM: Date;

  @Column()
  @IsNotEmpty()
  VALID_UNTIL: Date;
}
