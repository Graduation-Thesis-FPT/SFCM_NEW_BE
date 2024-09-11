import { User } from '../entity/user.entity';
import { ParentMenu, Permission } from '../models/permission.model';
import {
  checkPermissionAccessMenu,
  getAllPermission,
  updatePermission,
} from '../repositories/permission.repo';

class PermissionService {
  static getGrantPermission = async (roleId: string, menuId: string) => {
    return await checkPermissionAccessMenu(roleId, menuId);
  };

  static updatePermission = async (permissions: Partial<Permission>[], updateBy: User) => {
    return await updatePermission(permissions, updateBy);
  };

  static getAllPermission = async (roleId: string) => {
    const permissions = await getAllPermission(roleId);

    const newPermission = [];
    for (const permission of permissions) {
      const obj: ParentMenu = {
        MENU_NAME: '',
        MENU_ID: '',
        child: [],
      };
      if (permission.PARENT_ID === null) {
        obj['MENU_NAME'] = permission.MENU_NAME;
        obj['MENU_ID'] = permission.MENU_ID;
        obj['child'] = [];
        newPermission.push(obj);
        continue;
      }

      if (newPermission.length > 0) {
        for (const newPer of newPermission) {
          if (newPer['MENU_ID'] === permission.PARENT_ID) {
            newPer.child.push(permission);
          }
        }
      }
    }

    const finalPermission = newPermission.filter(newPer => newPer.child.length > 0);

    return finalPermission;
  };
}
export default PermissionService;
