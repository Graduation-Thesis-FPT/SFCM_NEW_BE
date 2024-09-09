import { Request, Response } from 'express';
import { OK, SuccessResponse } from '../core/success.response';
import PermissionService from '../services/permission.service';
import { SUCCESS_MESSAGE } from '../constants';

class PermissionController {
  updatePermission = async (req: Request, res: Response) => {
    const updateBy = res.locals.user;
    new SuccessResponse({
      message: SUCCESS_MESSAGE.GRANT_PERMISSION_SUCCESS,
      metadata: await PermissionService.updatePermission(req.body, updateBy),
    }).send(res);
  };

  getAllPermission = async (req: Request, res: Response) => {
    const role = req.query.roleCode as string;
    new OK({
      message: SUCCESS_MESSAGE.GET_PERMISSION_SUCCESS,
      metadata: await PermissionService.getAllPermission(role),
    }).send(res);
  };

  getGrantPermission = async (req: Request, res: Response) => {
    const userInfo = res.locals.user;
    const menuCode = req.query.menuCode as string;
    new OK({
      message: SUCCESS_MESSAGE.GET_GRANT_PERMISSION_SUCCESS,
      metadata: await PermissionService.getGrantPermission(userInfo.ROLE_CODE, menuCode),
    }).send(res);
  };
}

export default new PermissionController();
