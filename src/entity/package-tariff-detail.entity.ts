import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import BaseModel from './model.entity';

@Entity('PACKAGE_TARIFF_DETAIL')
export class PackageTariffDetailEntity extends BaseModel {
  @PrimaryColumn()
  ROWGUID: string;

  @Column()
  PACKAGE_TARIFF_ID: string;

  @Column()
  PACKAGE_TYPE_ID: string;

  @Column()
  PACKAGE_TARIFF_DESCRIPTION: string;

  @Column()
  UNIT: string;

  @Column({ type: 'float' })
  UNIT_PRICE: number;

  @Column({ type: 'float' })
  VAT_RATE: number;

  @Column({ default: 'ACTIVE' })
  STATUS: string;
}
