export interface Cell {
  ROWGUID?: string;
  BLOCK_ID: string;
  TIER_ORDERED: number;
  SLOT_ORDERED: number;
  CELL_LENGTH: number;
  CELL_WIDTH: number;
  CELL_HEIGHT: number;
  IS_FILLED: boolean;
  CREATE_BY?: string;
  CREATE_DATE?: Date;
  UPDATE_BY?: string;
  UPDATE_DATE?: Date;
}
