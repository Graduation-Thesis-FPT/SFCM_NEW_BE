import { Request, Response } from 'express';
import { SUCCESS_MESSAGE } from '../constants';
import { OK } from '../core/success.response';
import MenuService from '../services/menu.service';

class MenuController {
  getMenuByRoleId = async (req: Request, res: Response) => {
    const { user } = res.locals;
    new OK({
      message: SUCCESS_MESSAGE.GET_MENU_SUCCESS,
      metadata: await MenuService.getMenuByRoleId(user.ROLE_ID),
    }).send(res);
  };
}

export default new MenuController();
