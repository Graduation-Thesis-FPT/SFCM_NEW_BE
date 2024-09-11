import mssqlConnection from '../dbs/mssql.connect';
import { Menu as MenuEntity } from '../entity/menu.entity';
import { manager } from './index.repo';

export const permissionRepository = mssqlConnection.getRepository(MenuEntity);

const getMenuByRoleCode = async (roleCode: string) => {
  console.log(roleCode);
  return await manager
    .createQueryBuilder('MENU', 'sm')
    .leftJoinAndSelect('ROLE_PERMISSION', 'sp', 'sm.ID = sp.MENU_ID')
    .where('ROLE_CODE = :role', { role: roleCode })
    .andWhere('sm.IS_VISIBLE = 1')
    .andWhere('CAN_VIEW = 1')
    .orWhere('PARENT_ID is null')
    .orderBy('sm.ORDER_BY', 'ASC')
    .select([
      'sm.ID as ID',
      'sm.PARENT_ID as PARENT_ID',
      // 'sm.MENU_ID as MENU_ID',
      'sm.MENU_NAME as MENU_NAME',
      'sm.MENU_ICON as MENU_ICON',
      'sm.PAGE_COMPONENT as PAGE_COMPONENT',
      'sp.CAN_VIEW as CAN_VIEW',
      'sp.CAN_ADD_NEW as CAN_ADD_NEW',
      'sp.CAN_MODIFY as CAN_MODIFY',
      'sp.CAN_DELETE as CAN_DELETE',
    ])
    .getRawMany();
};

export { getMenuByRoleCode };
