import mssqlConnection from '../dbs/mssql.connect';
import { Permission as PermissionEntity } from '../entity/permission.entity';
import { User } from '../entity/user.entity';
import { Permission } from '../models/permission.model';
import { manager } from './index.repo';

export const permissionRepository = mssqlConnection.getRepository(PermissionEntity);

const getAllPermission = async (role: string): Promise<Permission[]> => {
  const rawData = await manager
    .createQueryBuilder('MENU', 'sm')
    .leftJoinAndSelect('ROLE_PERMISSION', 'sp', 'sm.ID = sp.MENU_ID')
    .where('ROLE_CODE = :role', { role })
    .orWhere('PARENT_ID is null')
    .select([
      'sm.PARENT_ID as PARENT_ID',
      'sm.MENU_NAME as MENU_NAME',
      'sm.ID as ID',
      'sp.CAN_VIEW as CAN_VIEW',
      'sp.CAN_ADD_NEW as CAN_ADD_NEW',
      'sp.CAN_MODIFY as CAN_MODIFY',
      'sp.CAN_DELETE as CAN_DELETE',
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
        CAN_ADD_NEW: per.CAN_ADD_NEW,
        CAN_DELETE: per.CAN_DELETE,
        CAN_VIEW: per.CAN_VIEW,
        CAN_MODIFY: per.CAN_MODIFY,
        UPDATED_BY: updateBy.USERNAME,
      })
      .where('ROLE_CODE= :roleCode', { roleCode: per.ROLE_CODE })
      .andWhere('MENU_ID= :menuCode', { menuCode: per.ID })
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
    .andWhere('permission.MENU_ID = :menuCode', { menuCode: menuCode })
    .getOne();
  return isExist;
};

export { getAllPermission, updatePermission, getPermissionByRoleCode, checkPermissionAccessMenu };
