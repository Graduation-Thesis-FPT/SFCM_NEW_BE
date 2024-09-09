import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseModel from './model.entity';

@Entity('SA_PERMISSION')
export class Permission extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  ROWGUID: string;

  @IsNotEmpty()
  @Column()
  ROLE_CODE: string;

  @Column()
  @IsNotEmpty()
  MENU_CODE: string;

  @Column()
  IS_VIEW: boolean;

  @Column()
  IS_ADD_NEW: boolean;

  @Column()
  IS_MODIFY: boolean;

  @Column()
  IS_DELETE: boolean;
}
