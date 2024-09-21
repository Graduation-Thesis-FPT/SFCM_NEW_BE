import { Entity, Column, PrimaryColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import BaseModel from './model.entity';

@Entity('IMPORT_ORDER_PAYMENT')
export class ImportOrderPayment extends BaseModel {
  @PrimaryColumn()
  ID: string;

  @Column({ type: 'float' })
  PRE_VAT_AMOUNT: number;

  @Column({ type: 'float' })
  VAT_AMOUNT: number;

  @Column({ type: 'float' })
  TOTAL_AMOUNT: number;

  @Column({
    default: 'PENDING',
  })
  STATUS: 'PENDING' | 'PAID' | 'CANCELLED';

  @Column({ type: 'datetime', nullable: true })
  CANCEL_DATE: Date | null;

  @Column({ nullable: true })
  CANCEL_REMARK: string;

  @Column({ nullable: true })
  CANCELLED_BY: string;
}
