import { Role } from '../entity/role.entity';
import { getAllRole } from '../repositories/role.repo';

class RoleService {
  static getAllRole = async (): Promise<Role[]> => {
    return await getAllRole();
  };
}
export default RoleService;
