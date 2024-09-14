import { Base } from './base.model';

export interface ContainerTariff extends Base {
  ID: string;
  NAME: string;
  CNTR_SIZE: number;
  UNIT_PRICE: number;
  VAT_RATE: number;
  VALID_FROM: Date;
  VALID_UNTIL: Date;
  STATUS: string;
}

export interface ContainerTariffList {
  insert: ContainerTariff[];
  update: ContainerTariff[];
}
