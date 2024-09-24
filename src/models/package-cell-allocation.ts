import { Base } from './base.model';

export interface PackageCellAllocation extends Base {
  ROWGUID: string;
  VOYAGE_CONTAINER_PACKAGE_ID: string;
  CELL_ID: string;
  ITEMS_IN_CELL: number;
  SEQUENCE: number;
  NOTE: string;
  SEPARATED_PACKAGE_LENGTH: number;
  SEPARATED_PACKAGE_WIDTH: number;
  SEPARATED_PACKAGE_HEIGHT: number;
  IS_SEPARATED: boolean;
}
export interface PackageCellAllocationInfo {
  insert: PackageCellAllocation[];
  update: PackageCellAllocation[];
}

export interface PackageDimension {
  SEPARATED_PACKAGE_LENGTH: number;
  SEPARATED_PACKAGE_WIDTH: number;
  SEPARATED_PACKAGE_HEIGHT: number;
}

export interface PackageReq {
  CELL_ID: string;
  WAREHOUSE_ID: string;
  PACKAGE_ROWGUID: string;
}

export interface PackagePositionReq {
  CELL_ID: string;
  PACKAGE_ROWGUID: string;
}

export interface PackageCellQuantityCheck {
  totalItems: number;
}
