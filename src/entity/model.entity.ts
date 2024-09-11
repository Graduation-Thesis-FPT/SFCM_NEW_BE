import { IsNotEmpty } from 'class-validator';
import { CreateDateColumn, UpdateDateColumn, BaseEntity, Column } from 'typeorm';

export default abstract class BaseModel extends BaseEntity {
  @Column()
  @IsNotEmpty()
  CREATED_BY: string;

  @CreateDateColumn({ type: 'datetime' })
  CREATED_AT: Date;

  @Column()
  @IsNotEmpty()
  UPDATED_BY: string;

  @UpdateDateColumn({ type: 'datetime' })
  UPDATED_AT: Date;
}
