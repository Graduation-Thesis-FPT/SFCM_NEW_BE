import { Request, Response } from 'express';
import { OK } from '../core/success.response';
import RoleService from '../services/role.service';
import { SUCCESS_MESSAGE } from '../constants';

class RoleController {
  getAllRole = async (req: Request, res: Response) => {
    new OK({
      message: SUCCESS_MESSAGE.SUCCESS,
      metadata: await RoleService.getAllRole(),
    }).send(res);
  };
}

export default new RoleController();
