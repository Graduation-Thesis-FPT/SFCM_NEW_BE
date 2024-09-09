import mssqlConnection from '../dbs/mssql.connect';
import { Permission as PermissionEntity } from '../entity/permission.entity';
import { User } from '../entity/user.entity';
import { Permission } from '../models/permission.model';
import { manager } from './index.repo';

export const permissionRepository = mssqlConnection.getRepository(PermissionEntity);

// const getAllPermission = async (role: string): Promise<Permission[]> => {
//   const rawData = await manager.query(
//     `select sm.PARENT_CODE, sm.MENU_NAME, sm.MENU_CODE, sp.IS_VIEW, sp.IS_ADD_NEW, sp.IS_MODIFY, sp.IS_DELETE, sp.ROLE_CODE
//         from SA_MENU sm
//         left join SA_PERMISSION sp
//         on sm.MENU_CODE = sp.MENU_CODE
//         where ROLE_CODE = 'admin' or PARENT_CODE is null
//     `,
//   );

//   return rawData;
// };

const getAllPermission = async (role: string): Promise<Permission[]> => {
  const rawData = await manager
    .createQueryBuilder('SA_MENU', 'sm')
    .leftJoinAndSelect('SA_PERMISSION', 'sp', 'sm.MENU_CODE = sp.MENU_CODE')
    .where('ROLE_CODE = :role', { role })
    .orWhere('PARENT_CODE is null')
    .select([
      'sm.PARENT_CODE as PARENT_CODE',
      'sm.MENU_NAME as MENU_NAME',
      'sm.MENU_CODE as MENU_CODE',
      'sp.IS_VIEW as IS_VIEW',
      'sp.IS_ADD_NEW as IS_ADD_NEW',
      'sp.IS_MODIFY as IS_MODIFY',
      'sp.IS_DELETE as IS_DELETE',
      'sp.ROLE_CODE as ROLE_CODE',
      'sp.ROWGUID as ROWGUID',
    ])
    .orderBy('sm.ORDER_BY', 'ASC')
    .getRawMany();

  return rawData;
};

const updatePermission = async (permissions: Partial<Permission>[], updateBy: User) => {
  const result = [];
  for (const per of permissions) {
    const response = await permissionRepository
      .createQueryBuilder()
      .update(PermissionEntity)
      .set({
        IS_ADD_NEW: per.IS_ADD_NEW,
        IS_DELETE: per.IS_DELETE,
        IS_VIEW: per.IS_VIEW,
        IS_MODIFY: per.IS_MODIFY,
        UPDATE_BY: updateBy.ROWGUID,
      })
      .where('ROLE_CODE= :roleCode', { roleCode: per.ROLE_CODE })
      .andWhere('MENU_CODE= :menuCode', { menuCode: per.MENU_CODE })
      .execute();
    result.push(response);
  }
  return result;
};

const getPermissionByRoleCode = async (roleCode: string) => {
  return await permissionRepository.find({ where: { ROLE_CODE: roleCode } });
};

const checkPermissionAccessMenu = async (roleCode: string, menuCode: string) => {
  const isExist = await permissionRepository
    .createQueryBuilder('permission')
    .where('permission.ROLE_CODE = :roleCode', { roleCode: roleCode })
    .andWhere('permission.MENU_CODE = :menuCode', { menuCode: menuCode })
    .getOne();
  return isExist;
};

export { getAllPermission, updatePermission, getPermissionByRoleCode, checkPermissionAccessMenu };
