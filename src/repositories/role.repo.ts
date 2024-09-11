import mssqlConnection from '../dbs/mssql.connect';
import { Role as RoleEntity } from '../entity/role.entity';

export const roleRepository = mssqlConnection.getRepository(RoleEntity);

const getAllRole = async (): Promise<RoleEntity[]> => {
  return await roleRepository.find({
    select: {
      ROLE_CODE: true,
      ROLE_NAME: true,
      UPDATED_AT: true,
    },
    order: {
      ROLE_CODE: 'ASC',
    },
  });
};

export { getAllRole };
