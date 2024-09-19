import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import BaseModel from './model.entity';

@Entity('EXPORT_ORDER_DETAIL')
export class ExportOrderDetailEntity extends BaseModel {
  @PrimaryColumn()
  ROWGUID: string;

  @Column({ nullable: false })
  @IsNotEmpty()
  ORDER_ID: string;

  @Column({ nullable: false })
  VOYAGE_CONTAINER_PACKAGE_ID: string;

  @Column({ nullable: false })
  @IsNotEmpty()
  CBM: number;

  @Column({ nullable: false, default: 1 })
  @IsNotEmpty()
  TOTAL_DAYS: number;

  @Column({ nullable: true })
  NOTE: string;
}
