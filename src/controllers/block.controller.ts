import { Request, Response } from 'express';
import { CREATED, OK, SuccessResponse } from '../core/success.response';
import { SUCCESS_MESSAGE } from '../constants';
import BlockService from '../services/block.service';

class BlockController {
  createAndUpdateBlock = async (req: Request, res: Response) => {
    const createBy = res.locals.user;
    const blockList = res.locals.requestData;

    new CREATED({
      message: SUCCESS_MESSAGE.SAVE_BLOCK_SUCCESS,
      metadata: await BlockService.createAndUpdateBlockAndCell(blockList, createBy),
    }).send(res);
  };

  deleteBlock = async (req: Request, res: Response) => {
    const { BLOCKID_LIST } = req.body;
    new SuccessResponse({
      message: SUCCESS_MESSAGE.DELETE_BLOCK_SUCCESS,
      metadata: await BlockService.deleteBlockNCell(BLOCKID_LIST),
    }).send(res);
  };

  getBlock = async (req: Request, res: Response) => {
    new OK({
      message: SUCCESS_MESSAGE.GET_BLOCK_SUCCESS,
      metadata: await BlockService.getAllBlock(),
    }).send(res);
  };

  getCell = async (req: Request, res: Response) => {
    const warehouse = req.query.WAREHOUSE_ID as string;
    const blockcode = req.query.BLOCK_ID as string;

    new OK({
      message: SUCCESS_MESSAGE.GET_CELL_SUCCESS,
      metadata: await BlockService.getAllCell(warehouse, blockcode),
    }).send(res);
  };
}

export default new BlockController();
