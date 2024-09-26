import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import BaseModel from './model.entity';

@Entity('EXPORT_ORDER')
export class ExportOrderEntity extends BaseModel {
  @PrimaryColumn()
  ID: string;

  @Column()
  @IsNotEmpty()
  PAYMENT_ID: string;

  @Column()
  @IsNotEmpty()
  PACKAGE_TARIFF_ID: string;

  @Column()
  @IsNotEmpty()
  PICKUP_DATE: Date;

  @Column({ nullable: true })
  NOTE?: string;

  @Column({ default: true })
  @IsNotEmpty()
  CAN_CANCEL: boolean;

  @Column()
  @IsNotEmpty()
  STATUS: 'COMPLETED' | 'CANCELLED';

  @Column({ nullable: true })
  CANCEL_NOTE: string;
}
