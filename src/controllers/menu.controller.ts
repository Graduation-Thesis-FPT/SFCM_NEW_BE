import { Request, Response } from 'express';
import { SUCCESS_MESSAGE } from '../constants';
import { OK } from '../core/success.response';
import MenuService from '../services/menu.service';

class MenuController {
  getMenuByRoleCode = async (req: Request, res: Response) => {
    const { user } = res.locals;
    new OK({
      message: SUCCESS_MESSAGE.GET_MENU_SUCCESS,
      metadata: await MenuService.getMenuByRoleCode(user.ROLE_CODE),
    }).send(res);
  };
}

export default new MenuController();
