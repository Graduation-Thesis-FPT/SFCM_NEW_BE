import { Permission } from '../models/permission.model';
import { getMenuByRoleId } from '../repositories/menu.repo';

interface ParentMenu {
  NAME: string;
  ID: string;
  MENU_ICON: string;
  PAGE_COMPONENT: string;
  // ROWGUID: string;
  child: Permission[];
}

class MenuService {
  static getMenuByRoleId = async (roleId: string) => {
    const menu = await getMenuByRoleId(roleId);

    const newMenu = [];
    for (const item of menu) {
      const obj: ParentMenu = {
        NAME: '',
        ID: '',
        MENU_ICON: '',
        PAGE_COMPONENT: '',
        // ROWGUID: '',
        child: [],
      };
      if (item.PARENT_ID === null) {
        obj['NAME'] = item.NAME;
        obj['ID'] = item.ID;
        obj['MENU_ICON'] = item.MENU_ICON;
        obj['PAGE_COMPONENT'] = item.PAGE_COMPONENT;
        // obj['ROWGUID'] = item.ROWGUID;
        obj['child'] = [];
        newMenu.push(obj);
        continue;
      }

      if (newMenu.length > 0) {
        for (const newPer of newMenu) {
          if (newPer['ID'] === item.PARENT_ID) {
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
