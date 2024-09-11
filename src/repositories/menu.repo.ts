import mssqlConnection from '../dbs/mssql.connect';
import { Menu as MenuEntity } from '../entity/menu.entity';
import { manager } from './index.repo';

export const permissionRepository = mssqlConnection.getRepository(MenuEntity);

const getMenuByRoleId = async (roleId: string) => {
  console.log(roleId);
  return await manager
    .createQueryBuilder('MENU', 'm')
    .leftJoinAndSelect('ROLE_PERMISSION', 'rp', 'm.ID = rp.MENU_ID')
    .where('ROLE_ID = :roleId', { roleId })
    .andWhere('m.IS_VISIBLE = 1')
    .andWhere('CAN_VIEW = 1')
    .orWhere('PARENT_ID is null')
    .orderBy('m.ORDER_BY', 'ASC')
    .select([
      'm.ID as ID',
      'm.PARENT_ID as PARENT_ID',
      // 'm.MENU_ID as MENU_ID',
      'm.NAME as NAME',
      'm.MENU_ICON as MENU_ICON',
      'm.PAGE_COMPONENT as PAGE_COMPONENT',
      'rp.CAN_VIEW as CAN_VIEW',
      'rp.CAN_ADD_NEW as CAN_ADD_NEW',
      'rp.CAN_MODIFY as CAN_MODIFY',
      'rp.CAN_DELETE as CAN_DELETE',
    ])
    .getRawMany();
};

export { getMenuByRoleId };
