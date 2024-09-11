import mssqlConnection from '../dbs/mssql.connect';
import { Role as RoleEntity } from '../entity/role.entity';

export const roleRepository = mssqlConnection.getRepository(RoleEntity);

const getAllRole = async (): Promise<RoleEntity[]> => {
  return await roleRepository.find({
    select: {
      ID: true,
      NAME: true,
      UPDATED_AT: true,
    },
    order: {
      ID: 'ASC',
    },
  });
};

export { getAllRole };
