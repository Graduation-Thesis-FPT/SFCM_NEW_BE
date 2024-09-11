/* eslint-disable prettier/prettier */
import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../core/error.response';
import { checkPermissionAccessMenu } from '../repositories/permission.repo';
import { ERROR_MESSAGE } from '../constants';
// import { isContainerExecuted } from '../repositories/container.repo';
// import { ContainerList } from '../models/container.model';

const HEADER = {
  MENU_ID: 'menu-code',
};

// the type HttpMethod only accept value GET POST DELETE and PATCH, the type PermissionProperty same
type HttpMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH';
type PermissionProperty = 'CAN_VIEW' | 'CAN_ADD_NEW' | 'CAN_DELETE' | 'CAN_MODIFY';

const grantPermission = async (req: Request, res: Response, next: NextFunction) => {
  const methodPermissionMap: Record<HttpMethod, PermissionProperty> = {
    GET: 'CAN_VIEW',
    POST: 'CAN_ADD_NEW',
    DELETE: 'CAN_DELETE',
    PATCH: 'CAN_MODIFY',
  };
  const { ROLE_ID } = res.locals.user;
  const menuCode = req.headers[HEADER.MENU_ID] as string;

  if (!menuCode) {
    throw new BadRequestError(ERROR_MESSAGE.MISSING_MENU_ID);
  }

  const method = req.method as HttpMethod;

  const permission = await checkPermissionAccessMenu(ROLE_ID, menuCode);

  if (!permission) {
    throw new BadRequestError(ERROR_MESSAGE.YOU_DO_NOT_HAVE_PERMISSION_TO_ACCESS_THIS_PAGE);
  }

  const permissionProperty = methodPermissionMap[method] as PermissionProperty;

  if (!permission[permissionProperty]) {
    throw new BadRequestError(ERROR_MESSAGE.YOU_DO_NOT_HAVE_THIS_PERMISSION);
  }

  next();
};

const validateRequest = (cb: () => void) => {
  return cb();
};

// const isContainerExecute = async (req: Request, res: Response, next: NextFunction) => {
//   const containerList: ContainerList = res.locals.requestData;
//   const updateData = containerList.update;

//   for (const containerInfo of updateData) {
//     const { ROWGUID } = containerInfo;
//     const isExecuted = await isContainerExecuted(ROWGUID);
//     if (isExecuted) {
//       throw new BadRequestError('Container đã được làm lệnh');
//     }
//   }

//   next();
// };

export { grantPermission, validateRequest };
