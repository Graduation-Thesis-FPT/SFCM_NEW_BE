import { Request, Response } from 'express';
import { CREATED, OK, SuccessResponse } from '../core/success.response';
import { SUCCESS_MESSAGE } from '../constants';
import ContainerService from '../services/voyage-container.service';

class VoyageContainerController {
  createAndUpdateContainer = async (req: Request, res: Response) => {
    const createBy = res.locals.user;
    const containerList = res.locals.requestData;

    new CREATED({
      message: SUCCESS_MESSAGE.SAVE_CONTAINER_SUCCESS,
      metadata: await ContainerService.createAndUpdateVoyageContainer(containerList, createBy),
    }).send(res);
  };

  deleteContainer = async (req: Request, res: Response) => {
    const { VOYAGE_CONTAINER_ID } = req.body;
    new SuccessResponse({
      message: SUCCESS_MESSAGE.DELETE_CONTAINER_SUCCESS,
      metadata: await ContainerService.deleteVoyageContainer(VOYAGE_CONTAINER_ID),
    }).send(res);
  };

  getAllContainer = async (req: Request, res: Response) => {
    new OK({
      message: SUCCESS_MESSAGE.GET_CONTAINER_SUCCESS,
      metadata: await ContainerService.getAllVoyageContainer(req.query),
    }).send(res);
  };
}

export default new VoyageContainerController();
