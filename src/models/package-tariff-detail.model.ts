import { Base } from './base.model';

export interface PackageTariffDetail extends Base {
  ROWGUID: string;
  PACKAGE_TARIFF_ID: string;
  PACKAGE_TYPE_ID: string;
  PACKAGE_TARIFF_DESCRIPTION: string;
  UNIT: string;
  UNIT_PRICE: number;
  VAT_RATE: number;
  STATUS: string;
}
export interface PackageTariffDetailInfo {
  insert: PackageTariffDetail[];
  update: PackageTariffDetail[];
}
