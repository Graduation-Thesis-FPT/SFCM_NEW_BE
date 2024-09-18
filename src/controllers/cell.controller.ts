import { Request, Response } from 'express';
import { OK, SuccessResponse } from '../core/success.response';
import { SUCCESS_MESSAGE } from '../constants';
import CellService from '../services/cell.service';

class CellController {
  suggestCell = async (req: Request, res: Response) => {
    const warehouseCode = req.query.warehouseCode as string;
    const palletInfo = {
      SEPARATED_PACKAGE_HEIGHT: Number(req.query.SEPARATED_PACKAGE_HEIGHT as string),
      SEPARATED_PACKAGE_LENGTH: Number(req.query.SEPARATED_PACKAGE_LENGTH as string),
      SEPARATED_PACKAGE_WIDTH: Number(req.query.SEPARATED_PACKAGE_WIDTH as string),
    };
    new SuccessResponse({
      message: SUCCESS_MESSAGE.GET_DATA_SUCCESS,
      metadata: await CellService.suggestCell(palletInfo, warehouseCode),
    }).send(res);
  };

  getAvailableCell = async (req: Request, res: Response) => {
    const palletInfo = {
      PALLET_HEIGHT: Number(req.query.PALLET_HEIGHT as string),
      PALLET_LENGTH: Number(req.query.PALLET_LENGTH as string),
      PALLET_WIDTH: Number(req.query.PALLET_WIDTH as string),
    };
    new SuccessResponse({
      message: SUCCESS_MESSAGE.GET_DATA_SUCCESS,
      metadata: await CellService.getAvailableCell(
        palletInfo.PALLET_LENGTH,
        palletInfo.PALLET_WIDTH,
        palletInfo.PALLET_HEIGHT,
      ),
    }).send(res);
  };

  placePackageAllocatedIntoCell = async (req: Request, res: Response) => {
    const createBy = res.locals.user;
    const data = req.body;

    new SuccessResponse({
      message: SUCCESS_MESSAGE.UPDATE_PALLET_SUCCESS,
      metadata: await CellService.placePackageIntoCell(data, createBy),
    }).send(res);
  };

  changePackageAllocatedPosition = async (req: Request, res: Response) => {
    const createBy = res.locals.user;
    const data = req.body;

    new SuccessResponse({
      message: SUCCESS_MESSAGE.UPDATE_PALLET_SUCCESS,
      metadata: await CellService.changePackagePosition(data, createBy),
    }).send(res);
  };

  getAllPackagePosition = async (req: Request, res: Response) => {
    const warehouseCode = req.query.warehouseCode as string;
    new OK({
      message: SUCCESS_MESSAGE.GET_PALLET_SUCCESS,
      metadata: await CellService.getPackagePosition(warehouseCode),
    }).send(res);
  };
}

export default new CellController();
