export interface Permission {
  PARENT_ID?: string;
  MENU_NAME?: string;
  MENU_ID: string;
  CAN_VIEW: boolean;
  CAN_ADD_NEW: boolean;
  CAN_MODIFY: boolean;
  CAN_DELETE: boolean;
  ROWGUID: string;
  ROLE_ID: string;
}

export interface ParentMenu {
  MENU_NAME: string;
  MENU_ID: string;
  child: Permission[];
}
