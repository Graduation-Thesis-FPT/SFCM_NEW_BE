import { Base } from './base.model';

export interface VoyageContainerPackage extends Base {
  ID: string;
  VOYAGE_CONTAINER_ID: string;
  HOUSE_BILL: string;
  PACKAGE_TYPE_ID: string;
  CONSIGNEE_ID: string;
  PACKAGE_UNIT: string;
  CBM: number;
  TOTAL_ITEMS: number;
  NOTE: string;
  TIME_IN: Date;
  STATUS: string;
}

export interface VoyageContainerPackageInfo {
  insert: VoyageContainerPackage[];
  update: VoyageContainerPackage[];
}
