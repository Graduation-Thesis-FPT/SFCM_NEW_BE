import { Base } from './base.model';

export interface PackageTariff extends Base {
  ID: string;
  NAME: string;
  VALID_FROM: Date;
  VALID_UNTIL: Date;
}
export interface PackageTariffInfo {
  insert: PackageTariff[];
  update: PackageTariff[];
}
