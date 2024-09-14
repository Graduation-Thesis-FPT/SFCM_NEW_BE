import { Base } from './base.model';

export interface VoyageContainer extends Base {
  ID: string;
  VOYAGE_ID: string;
  CNTR_NO: string;
  SHIPPER_ID: string;
  CNTR_SIZE: number;
  SEAL_NO: string;
  STATUS: string;
  NOTE: string;
}

export interface VoyageContainerList {
  insert: VoyageContainer[];
  update: VoyageContainer[];
}
