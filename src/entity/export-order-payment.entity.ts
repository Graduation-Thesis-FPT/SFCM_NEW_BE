import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import BaseModel from './model.entity';

@Entity('EXPORT_ORDER_PAYMENT')
export class ExportOrderPaymentEntity extends BaseModel {
  @PrimaryColumn()
  ID: string;

  @Column()
  @IsNotEmpty()
  PRE_VAT_AMOUNT: number;

  @Column()
  @IsNotEmpty()
  VAT_AMOUNT: number;

  @Column()
  @IsNotEmpty()
  TOTAL_AMOUNT: number;

  @Column()
  @IsNotEmpty()
  STATUS: 'PENDING' | 'PAID' | 'CANCELLED';

  @Column({ nullable: true })
  CANCEL_DATE?: Date;

  @Column({ nullable: true })
  CANCEL_REMARK?: string;

  @Column({ nullable: true })
  CANCELLED_BY?: string;
}
