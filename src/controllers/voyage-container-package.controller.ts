import { Request, Response } from 'express';
import { CREATED, OK, SuccessResponse } from '../core/success.response';
import { SUCCESS_MESSAGE } from '../constants';
import VoyageContainerPackageService from '../services/voyage-container-package.service';

class VoyageContainerPackageController {
  createAndUpdateVoyageContainerPackage = async (req: Request, res: Response) => {
    const createBy = res.locals.user;
    const reqData = res.locals.requestData;
    new CREATED({
      message: SUCCESS_MESSAGE.SAVE_PACKAGE_SUCCESS,
      metadata: await VoyageContainerPackageService.createAndUpdate(reqData, createBy),
    }).send(res);
  };

  deleteVoyageContainerPackage = async (req: Request, res: Response) => {
    const { CONTAINER_ROWGUID } = req.body;
    new SuccessResponse({
      message: SUCCESS_MESSAGE.DELETE_PACKAGE_SUCCESS,
      metadata: await VoyageContainerPackageService.deleteVoyageContainerPackage(CONTAINER_ROWGUID),
    }).send(res);
  };

  getVoyageContainerPackage = async (req: Request, res: Response) => {
    const refcont = req.query.REF_CONTAINER as string;
    new OK({
      message: SUCCESS_MESSAGE.GET_PACKAGE_SUCCESS,
      metadata: await VoyageContainerPackageService.getVoyageContainerPackage(refcont),
    }).send(res);
  };

  getVoyageContainerPackageByStatus = async (req: Request, res: Response) => {
    const voyageContainerId = req.query.voyageContainerId as string;
    const status = req.query.status as string;
    new OK({
      message: SUCCESS_MESSAGE.GET_PACKAGE_SUCCESS,
      metadata: await VoyageContainerPackageService.getVoyageContainerPackageByStatus(
        voyageContainerId,
        status,
      ),
    }).send(res);
  };
}

export default new VoyageContainerPackageController();
