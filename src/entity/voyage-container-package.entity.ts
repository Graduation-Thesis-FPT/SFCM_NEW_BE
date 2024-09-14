import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import BaseModel from './model.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('VOYAGE_CONTAINER_PACKAGE')
export class VoyageContainerPackage extends BaseModel {
  @PrimaryColumn()
  @IsNotEmpty()
  ID: string;

  @IsNotEmpty()
  @Column()
  VOYAGE_CONTAINER_ID: string;

  @IsNotEmpty()
  @Column()
  HOUSE_BILL: string;

  @IsNotEmpty()
  @Column()
  PACKAGE_TYPE_ID: string;

  @IsNotEmpty()
  @Column()
  CONSIGNEE_ID: string;

  @Column()
  PACKAGE_UNIT: string;

  @IsNotEmpty()
  @Column({ type: 'float' })
  CBM: number;

  @IsNotEmpty()
  @Column()
  TOTAL_ITEMS: number;

  @Column()
  NOTE: string;

  @Column()
  TIME_IN: Date;

  @Column()
  STATUS: string;
}
