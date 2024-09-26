import { Request, Response } from 'express';
import { CREATED, OK, SuccessResponse } from '../core/success.response';
import { SUCCESS_MESSAGE } from '../constants';
import PackageCellAllocationService from '../services/package-cell-allocation.service';

class PackageCellAllocationController {
  getAllImportedContainer = async (req: Request, res: Response) => {
    new OK({
      message: SUCCESS_MESSAGE.GET_DATA_SUCCESS,
      metadata: await PackageCellAllocationService.getAllImportedContainer(),
    }).send(res);
  };

  getImportTallyContainerInfo = async (req: Request, res: Response) => {
    const { CONTAINER_ID } = req.params;
    new OK({
      message: SUCCESS_MESSAGE.GET_DATA_SUCCESS,
      metadata: await PackageCellAllocationService.getPackageByVoyageContainerId(CONTAINER_ID),
    }).send(res);
  };

  getAllPackageCellById = async (req: Request, res: Response) => {
    const { VOYAGE_CONTAINER_PACKAGE_ID } = req.params;
    new SuccessResponse({
      message: SUCCESS_MESSAGE.GET_DATA_SUCCESS,
      metadata: await PackageCellAllocationService.getAllPackageCellById(
        VOYAGE_CONTAINER_PACKAGE_ID,
      ),
    }).send(res);
  };

  insertAndUpdatePackageAllocation = async (req: Request, res: Response) => {
    const { PACKAGE_ID } = req.params;
    const listData = res.locals.requestData;
    const createBy = res.locals.user;
    new SuccessResponse({
      message: SUCCESS_MESSAGE.SAVE_JOB_QUANTITY_CHECK_SUCCESS,
      metadata: await PackageCellAllocationService.createPackageCellAllocation(
        listData,
        createBy,
        PACKAGE_ID,
      ),
    }).send(res);
  };

  completePackageSeparate = async (req: Request, res: Response) => {
    const { VOYAGE_CONTAINER_PACKAGE_ID } = req.params;
    const createBy = res.locals.user;
    new SuccessResponse({
      message: SUCCESS_MESSAGE.COMPLETE_JOB_QUANTITY_CHECK_SUCCESS,
      metadata: await PackageCellAllocationService.completePackageSeparate(
        VOYAGE_CONTAINER_PACKAGE_ID,
        createBy,
      ),
    }).send(res);
  };

  getReadyToWarehouse = async (req: Request, res: Response) => {
    new OK({
      message: SUCCESS_MESSAGE.GET_DATA_SUCCESS,
      metadata: await PackageCellAllocationService.getReadyToWarehouse(),
    }).send(res);
  };

  getReadyToOutForDelivery = async (req: Request, res: Response) => {
    new SuccessResponse({
      message: SUCCESS_MESSAGE.GET_DATA_SUCCESS,
      metadata: await PackageCellAllocationService.getListExportPackage(),
    }).send(res);
  };

  exportPackage = async (req: Request, res: Response) => {
    const data = req.body;
    const createBy = res.locals.user;

    new SuccessResponse({
      message: SUCCESS_MESSAGE.UPDATE_PALLET_SUCCESS,
      metadata: await PackageCellAllocationService.exportPackage(data),
    }).send(res);
  };
}

export default new PackageCellAllocationController();
