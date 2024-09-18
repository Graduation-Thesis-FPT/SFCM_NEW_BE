import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';
import BaseModel from './model.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('PACKAGE_CELL_ALLOCATION')
export class PackageCellAllocationEntity extends BaseModel {
  @PrimaryColumn()
  ROWGUID: string;

  @Column()
  VOYAGE_CONTAINER_PACKAGE_ID: string;

  @Column()
  CELL_ID: string;

  @Column()
  ITEMS_IN_CELL: number;

  @Column()
  SEQUENCE: number;

  @Column()
  NOTE: string;

  @Column()
  SEPARATED_PACKAGE_LENGTH: number;

  @Column()
  SEPARATED_PACKAGE_WIDTH: number;

  @Column()
  SEPARATED_PACKAGE_HEIGHT: number;

  @Column()
  IS_SEPARATED: boolean;
}
