export interface Permission {
  PARENT_ID?: string;
  MENU_NAME?: string;
  ID: string;
  CAN_VIEW: boolean;
  CAN_ADD_NEW: boolean;
  CAN_MODIFY: boolean;
  CAN_DELETE: boolean;
  ROWGUID: string;
  ROLE_CODE: string;
}

export interface ParentMenu {
  MENU_NAME: string;
  ID: string;
  child: Permission[];
}
