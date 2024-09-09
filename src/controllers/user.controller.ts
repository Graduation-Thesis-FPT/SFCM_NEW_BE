import { Request, Response } from 'express';
import { CREATED, OK, SuccessResponse } from '../core/success.response';
import UserService from '../services/user.service';
import { User } from '../entity/user.entity';
import { SUCCESS_MESSAGE } from '../constants';

class UserController {
  createUserAccount = async (req: Request, res: Response) => {
    const userAccountInfo: User = req.body;
    const createBy = res.locals.user;
    new CREATED({
      message: SUCCESS_MESSAGE.CREATE_USER_SUCCESS,
      metadata: await UserService.createUserAccount(userAccountInfo, createBy),
    }).send(res);
  };

  findUserById = async (req: Request, res: Response) => {
    new OK({
      message: SUCCESS_MESSAGE.SUCCESS,
      metadata: await UserService.findUserById(req.params.id),
    }).send(res);
  };

  deleteUserById = async (req: Request, res: Response) => {
    new SuccessResponse({
      message: SUCCESS_MESSAGE.DELETE_USER_SUCCESS,
      metadata: await UserService.deleteUser(req.params.id),
    }).send(res);
  };

  deactivateUser = async (req: Request, res: Response) => {
    new SuccessResponse({
      message: SUCCESS_MESSAGE.DEACTIVE_USER_SUCCESS,
      metadata: await UserService.deactiveUser(req.params.id),
    }).send(res);
  };

  activateUser = async (req: Request, res: Response) => {
    new SuccessResponse({
      message: SUCCESS_MESSAGE.ACTIVE_USER_SUCCESS,
      metadata: await UserService.activeUser(req.params.id),
    }).send(res);
  };

  getAllUser = async (req: Request, res: Response) => {
    new OK({
      message: SUCCESS_MESSAGE.SUCCESS,
      metadata: await UserService.getAllUser(),
    }).send(res);
  };

  updateUser = async (req: Request, res: Response) => {
    const updateBy = res.locals.user;
    new SuccessResponse({
      message: SUCCESS_MESSAGE.UPDATE_USER_SUCCESS,
      metadata: await UserService.updateUser(req.params.userId, req.body, updateBy),
    }).send(res);
  };

  resetPasswordById = async (req: Request, res: Response) => {
    new SuccessResponse({
      message: SUCCESS_MESSAGE.RESET_PASSWORD_SUCCESS,
      metadata: await UserService.resetPasswordById(req.params.userId, req.body.DEFAULT_PASSWORD),
    }).send(res);
  };
}

export default new UserController();
