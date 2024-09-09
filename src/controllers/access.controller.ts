import { Request, Response } from 'express';
import AccessService from '../services/access.service';
import { SuccessResponse } from '../core/success.response';
import { SUCCESS_MESSAGE } from '../constants';

class AccessController {
  login = async (req: Request, res: Response) => {
    new SuccessResponse({
      message: SUCCESS_MESSAGE.LOGIN_SUCCESS,
      metadata: await AccessService.login(req.body),
    }).send(res);
  };

  changeDefaultPassword = async (req: Request, res: Response) => {
    new SuccessResponse({
      message: SUCCESS_MESSAGE.CHANGE_DEFAULT_PASSWORD_SUCCESS,
      metadata: await AccessService.changeDefaultPassword(req.params.userId, req.body),
    }).send(res);
  };

  handlerRefreshToken = async (req: Request, res: Response) => {
    const { user } = res.locals;
    new SuccessResponse({
      message: SUCCESS_MESSAGE.GET_TOKEN_SUCCESS,
      metadata: await AccessService.handlerRefreshToken(user),
    }).send(res);
  };

  changePassword = async (req: Request, res: Response) => {
    const { user } = res.locals;
    new SuccessResponse({
      message: SUCCESS_MESSAGE.CHANGE_PASSWORD_SUCCESS,
      metadata: await AccessService.changePassword(user, req.body),
    }).send(res);
  };
}

export default new AccessController();
