import { User } from '../entity/user.entity';
import { ParentMenu, Permission } from '../models/permission.model';
import {
  checkPermissionAccessMenu,
  getAllPermission,
  updatePermission,
} from '../repositories/permission.repo';

class PermissionService {
  static getGrantPermission = async (roleCode: string, menuCode: string) => {
    return await checkPermissionAccessMenu(roleCode, menuCode);
  };

  static updatePermission = async (permissions: Partial<Permission>[], updateBy: User) => {
    return await updatePermission(permissions, updateBy);
  };

  static getAllPermission = async (role: string) => {
    const permissions = await getAllPermission(role);

    const newPermission = [];
    for (const permission of permissions) {
      const obj: ParentMenu = {
        MENU_NAME: '',
        MENU_CODE: '',
        child: [],
      };
      if (permission.PARENT_CODE === null) {
        obj['MENU_NAME'] = permission.MENU_NAME;
        obj['MENU_CODE'] = permission.MENU_CODE;
        obj['child'] = [];
        newPermission.push(obj);
        continue;
      }

      if (newPermission.length > 0) {
        for (const newPer of newPermission) {
          if (newPer['MENU_CODE'] === permission.PARENT_CODE) {
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
