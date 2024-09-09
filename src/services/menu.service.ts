import { Permission } from '../models/permission.model';
import { getMenuByRoleCode } from '../repositories/menu.repo';

interface ParentMenu {
  MENU_NAME: string;
  MENU_CODE: string;
  MENU_ICON: string;
  VIEW_PAGE: string;
  ROWGUID: string;
  child: Permission[];
}

class MenuService {
  static getMenuByRoleCode = async (roleCode: string) => {
    const menu = await getMenuByRoleCode(roleCode);

    const newMenu = [];
    for (const item of menu) {
      const obj: ParentMenu = {
        MENU_NAME: '',
        MENU_CODE: '',
        MENU_ICON: '',
        VIEW_PAGE: '',
        ROWGUID: '',
        child: [],
      };
      if (item.PARENT_CODE === null) {
        obj['MENU_NAME'] = item.MENU_NAME;
        obj['MENU_CODE'] = item.MENU_CODE;
        obj['MENU_ICON'] = item.MENU_ICON;
        obj['VIEW_PAGE'] = item.VIEW_PAGE;
        obj['ROWGUID'] = item.ROWGUID;
        obj['child'] = [];
        newMenu.push(obj);
        continue;
      }

      if (newMenu.length > 0) {
        for (const newPer of newMenu) {
          if (newPer['MENU_CODE'] === item.PARENT_CODE) {
            newPer.child.push(item);
          }
        }
      }
    }

    const finalMenu = newMenu.filter(newPer => newPer.child.length > 0);

    return finalMenu;
  };
}
export default MenuService;
