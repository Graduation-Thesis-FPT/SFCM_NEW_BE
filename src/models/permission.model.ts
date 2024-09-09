export interface Permission {
  PARENT_CODE?: string;
  MENU_NAME?: string;
  MENU_CODE: string;
  IS_VIEW: boolean;
  IS_ADD_NEW: boolean;
  IS_MODIFY: boolean;
  IS_DELETE: boolean;
  ROWGUID: string;
  ROLE_CODE: string;
}

export interface ParentMenu {
  MENU_NAME: string;
  MENU_CODE: string;
  child: Permission[];
}
