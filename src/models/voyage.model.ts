export interface Voyage {
  ID: string;
  VESSEL_NAME: string;
  ETA: Date;
  CREATED_BY?: string;
  CREATED_AT?: Date;
  UPDATED_BY?: string;
  UPDATED_AT?: Date;
}

export interface VoyageList {
  insert: Voyage[];
  update: Voyage[];
}
