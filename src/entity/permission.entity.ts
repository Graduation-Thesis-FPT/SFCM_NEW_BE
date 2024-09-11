import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseModel from './model.entity';

@Entity('ROLE_PERMISSION')
export class Permission extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  ROWGUID: string;

  @IsNotEmpty()
  @Column()
  ROLE_ID: string;

  @Column()
  @IsNotEmpty()
  MENU_ID: string;

  @Column()
  CAN_VIEW: boolean;

  @Column()
  CAN_ADD_NEW: boolean;

  @Column()
  CAN_MODIFY: boolean;

  @Column()
  CAN_DELETE: boolean;
}
