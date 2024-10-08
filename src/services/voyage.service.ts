import { BadRequestError } from '../core/error.response';
import { User } from '../entity/user.entity';
import { manager } from '../repositories/index.repo';
import { Voyage, VoyageList } from '../models/voyage.model';
import {
  createVoyage,
  deleteVoyageMany,
  findContainerByVoyageKey,
  findContainerByVoyageKeyy,
  findVoyage,
  findVoyageByID,
  findVoyageInBoundVoyage,
  getAllVoyage,
  updateVoyage,
} from '../repositories/voyage.repo';
import { generateKeyVoyage } from '../utils';

class VoyageService {
  static createAndUpdateVoyage = async (voyageInfo: VoyageList, createBy: User) => {
    const insertData = voyageInfo.insert;
    const updateData = voyageInfo.update;

    let newCreatedVoyage: Voyage[] = [];
    let newUpdatedVoyage;

    await manager.transaction(async transactionalEntityManager => {
      if (insertData.length > 0) {
        for (let voyageInfo of insertData) {
          const check = await findVoyageByID(voyageInfo.ID, transactionalEntityManager);
          if (check) {
            throw new BadRequestError(`Mã chuyến tàu ${voyageInfo.ID} đã được sử dụng`);
          }
          voyageInfo.CREATED_BY = createBy.USERNAME;
          voyageInfo.UPDATED_BY = createBy.USERNAME;
        }
        newCreatedVoyage = await createVoyage(insertData, transactionalEntityManager);
      }

      if (updateData.length > 0) {
        for (const voyageInfo of updateData) {
          const vessel = await findVoyageByID(voyageInfo.ID, transactionalEntityManager);
          if (!vessel) {
            throw new BadRequestError(`Mã chuyến tàu ${voyageInfo.VESSEL_NAME} không tồn tại`);
          }

          // const vesselByInBoundVoy = await findVoyageInBoundVoyage(
          //   voyageInfo.INBOUND_VOYAGE,
          //   transactionalEntityManager,
          // );

          // if (vesselByInBoundVoy && vesselByInBoundVoy.VOYAGEKEY !== voyageInfo.VOYAGEKEY) {
          //   throw new BadRequestError(`Chuyến nhập ${voyageInfo.INBOUND_VOYAGE} đã được sử dụng`);
          // }

          // const isValidUpdate = await findContainerByVoyageKey(
          //   voyageInfo.VOYAGEKEY,
          //   transactionalEntityManager,
          // );

          // if (isValidUpdate) {
          //   throw new BadRequestError(`không thể cập nhật tàu khi đã khai báo container`);
          // }

          voyageInfo.UPDATED_BY = createBy.USERNAME;
          voyageInfo.UPDATED_AT = new Date();
        }
        newUpdatedVoyage = await updateVoyage(updateData, transactionalEntityManager);
      }
    });

    return {
      newCreatedVoyage,
      newUpdatedVoyage,
    };
  };

  static deleteVoyage = async (voyageCodeList: string[]) => {
    for (const voyageID of voyageCodeList) {
      const vessel = await findVoyage(voyageID.trim());
      if (!vessel) {
        throw new BadRequestError(`Voyage with ID ${voyageID} not exist!`);
      }

      // const isValidUpdate = await findContainerByVoyageKeyy(voyageID);
      // console.log(isValidUpdate);
      // if (isValidUpdate) {
      //   throw new BadRequestError(`không thể xóa tàu khi đã khai báo container`);
      // }
    }

    return await deleteVoyageMany(voyageCodeList);
  };

  static getAllVoyage = async (rule: { fromDate: Date; toDate: Date }) => {
    return await getAllVoyage(rule);
  };
}
export default VoyageService;
