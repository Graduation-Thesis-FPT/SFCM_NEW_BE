import mssqlConnection from '../dbs/mssql.connect';
import { Permission as PermissionEntity } from '../entity/permission.entity';
import { User } from '../entity/user.entity';
import { Permission } from '../models/permission.model';
import { manager } from './index.repo';

export const permissionRepository = mssqlConnection.getRepository(PermissionEntity);

const getAllPermission = async (roleId: string): Promise<Permission[]> => {
  const rawData = await manager
    .createQueryBuilder('MENU', 'm')
    .leftJoinAndSelect('ROLE_PERMISSION', 'rp', 'm.ID = rp.MENU_ID')
    .where('ROLE_ID = :roleId', { roleId })
    .orWhere('PARENT_ID is null')
    .select([
      'm.PARENT_ID as PARENT_ID',
      'm.NAME as MENU_NAME',
      'm.ID as MENU_ID',
      'rp.CAN_VIEW as CAN_VIEW',
      'rp.CAN_ADD_NEW as CAN_ADD_NEW',
      'rp.CAN_MODIFY as CAN_MODIFY',
      'rp.CAN_DELETE as CAN_DELETE',
      'rp.ROLE_ID as ROLE_ID',
      'rp.ROWGUID as ROWGUID',
    ])
    .orderBy('m.ORDER_BY', 'ASC')
    .getRawMany();

  return rawData;
};

const updatePermission = async (permissions: Partial<Permission>[], updateBy: User) => {
  const result = [];
  for (const per of permissions) {
    console.log('per', per);
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
      .where('ROLE_ID = :roleId', { roleId: per.ROLE_ID })
      .andWhere('MENU_ID = :menuId', { menuId: per.MENU_ID })
      .execute();
    result.push(response);
  }
  return result;
};

const getPermissionByRoleId = async (roleId: string) => {
  return await permissionRepository.find({ where: { ROLE_ID: roleId } });
};

const checkPermissionAccessMenu = async (roleId: string, menuId: string) => {
  const isExist = await permissionRepository
    .createQueryBuilder('permission')
    .where('permission.ROLE_ID = :roleId', { roleId })
    .andWhere('permission.MENU_ID = :menuId', { menuId })
    .getOne();
  return isExist;
};

export { getAllPermission, updatePermission, getPermissionByRoleId, checkPermissionAccessMenu };
