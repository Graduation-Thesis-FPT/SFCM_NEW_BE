export interface Cell {
  ROWGUID?: string;
  BLOCK_ID: string;
  TIER_ORDERED: number;
  SLOT_ORDERED: number;
  CELL_LENGTH: number;
  CELL_WIDTH: number;
  CELL_HEIGHT: number;
  IS_FILLED: boolean;
  CREATED_BY?: string;
  CREATED_AT?: Date;
  UPDATED_BY?: string;
  UPDATED_AT?: Date;
}
