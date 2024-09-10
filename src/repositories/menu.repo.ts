import mssqlConnection from '../dbs/mssql.connect';
import { Menu as MenuEntity } from '../entity/menu.entity';
import { manager } from './index.repo';

export const permissionRepository = mssqlConnection.getRepository(MenuEntity);

const getMenuByRoleCode = async (roleCode: string) => {
  return await manager
    .createQueryBuilder('SA_MENU', 'sm')
    .leftJoinAndSelect('SA_PERMISSION', 'sp', 'sm.MENU_CODE = sp.MENU_CODE')
    .where('ROLE_CODE = :role', { role: roleCode })
    .andWhere('sm.IS_VISIBLE = 1')
    .andWhere('IS_VIEW = 1')
    .orWhere('PARENT_CODE is null')
    .orderBy('sm.ORDER_BY', 'ASC')
    .select([
      'sm.ROWGUID as ROWGUID',
      'sm.PARENT_CODE as PARENT_CODE',
      'sm.MENU_CODE as MENU_CODE',
      'sm.MENU_NAME as MENU_NAME',
      'sm.MENU_ICON as MENU_ICON',
      'sm.VIEW_PAGE as VIEW_PAGE',
      'sp.IS_VIEW as IS_VIEW',
      'sp.IS_ADD_NEW as IS_ADD_NEW',
      'sp.IS_MODIFY as IS_MODIFY',
      'sp.IS_DELETE as IS_DELETE',
    ])
    .getRawMany();
};

export { getMenuByRoleCode };
