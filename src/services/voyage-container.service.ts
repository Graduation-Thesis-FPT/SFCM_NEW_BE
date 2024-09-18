import { BadRequestError } from '../core/error.response';
import { User } from '../entity/user.entity';
import { manager } from '../repositories/index.repo';
import { findVoyageByID } from '../repositories/voyage.repo';
import { VoyageContainer, VoyageContainerList } from '../models/voyage-container.model';
import { findCustomerByCode } from '../repositories/customer.repo';
import {
  createVoyageContainer,
  deleteVoyageContainerMany,
  filterVoyageContainer,
  findVoyageContainer,
  isVoyageContainerExecuted,
  isDuplicateVoyageContainer,
  updateVoyageContainer,
  findVoyageContainerById,
} from '../repositories/voyage-container.repo';

class VoyageContainerService {
  static createAndUpdateVoyageContainer = async (
    containerInfo: VoyageContainerList,
    createBy: User,
  ) => {
    const insertData = containerInfo.insert;
    const updateData = containerInfo.update;

    let newCreatedVoyageContainer: VoyageContainer[] = [];
    let newUpdatedVoyageContainer;

    await manager.transaction(async transactionalEntityManager => {
      if (insertData.length > 0) {
        for (const containerInfo of insertData) {
          const container = await isDuplicateVoyageContainer(
            containerInfo.VOYAGE_ID,
            containerInfo.CNTR_NO,
            transactionalEntityManager,
          );

          if (container) {
            if (container.CNTR_NO === containerInfo.CNTR_NO) {
              throw new BadRequestError(
                `Số container ${containerInfo.CNTR_NO} đã được sử dụng trên tàu`,
              );
            }
          }

          const voyage = await findVoyageByID(containerInfo.VOYAGE_ID, transactionalEntityManager);
          if (!voyage) {
            throw new BadRequestError(`Mã tàu ${containerInfo.VOYAGE_ID} không tồn tại`);
          }

          const isValidCustomerCode = await findCustomerByCode(
            containerInfo.SHIPPER_ID,
            transactionalEntityManager,
          );

          if (!isValidCustomerCode) {
            throw new BadRequestError(
              `Mã loại khách hàng ${containerInfo.SHIPPER_ID} không hợp lệ`,
            );
          }

          if (containerInfo.SEAL_NO === '') containerInfo.SEAL_NO = null;
          if (containerInfo.NOTE === '') containerInfo.CNTR_NO = null;
          containerInfo.CREATED_BY = createBy.USERNAME;
          containerInfo.CREATED_AT = new Date();
          containerInfo.UPDATED_BY = createBy.USERNAME;
          containerInfo.UPDATED_AT = new Date();
          containerInfo.ID = containerInfo.CNTR_NO + '_' + containerInfo.VOYAGE_ID;
        }

        newCreatedVoyageContainer = await createVoyageContainer(
          insertData,
          transactionalEntityManager,
        );
      }

      if (updateData.length > 0) {
        // const isExecuted = await isVoyageContainerExecuted(updateData[0].ID);
        // if (isExecuted) {
        //   throw new BadRequestError(`Không thể cập nhật, container đã làm lệnh!`);
        // }
        for (const containerReqInfo of updateData) {
          const voyage = await findVoyageByID(
            containerReqInfo.VOYAGE_ID,
            transactionalEntityManager,
          );
          if (!voyage) {
            throw new BadRequestError(`Mã tàu ${containerReqInfo.VOYAGE_ID} không tồn tại`);
          }

          const container = await findVoyageContainerById(
            containerReqInfo.ID,
            transactionalEntityManager,
          );
          if (!container) {
            throw new BadRequestError(`Mã container ${containerReqInfo.ID} không tồn tại!`);
          }

          if (container.STATUS === 'IMPORTED') {
            throw new BadRequestError(
              `Không thể cập nhật container ${container.CNTR_NO}, container đã được làm lệnh`,
            );
          }

          if (container.CNTR_NO === containerReqInfo.CNTR_NO) {
            throw new BadRequestError(
              `Không thể cập nhật số container ${containerReqInfo.CNTR_NO} đã được sử dụng trên tàu`,
            );
          }

          // if (containerReqInfo.CNTRNO !== container.CNTRNO) {
          //   const container = await isDuplicateVoyageContainer(
          //     containerReqInfo.VOYAGEKEY,
          //     containerReqInfo.CNTRNO,
          //     transactionalEntityManager,
          //   );

          //   if (container)
          //     if (container.CNTRNO === containerReqInfo.CNTRNO) {
          //       throw new BadRequestError(
          //         `Số container ${containerReqInfo.CNTRNO} đã được sử dụng trên tàu`,
          //       );
          //     }
          // }

          const isValidCustomerCode = await findCustomerByCode(
            containerReqInfo.SHIPPER_ID,
            transactionalEntityManager,
          );

          if (!isValidCustomerCode) {
            throw new BadRequestError(`Mã khách hàng ${containerReqInfo.SHIPPER_ID} không hợp lệ`);
          }

          if (containerReqInfo.SEAL_NO === '') containerReqInfo.SEAL_NO = null;
          if (containerReqInfo.NOTE === '') containerReqInfo.NOTE = null;
          containerReqInfo.UPDATED_BY = createBy.USERNAME;
          containerReqInfo.UPDATED_AT = new Date();
        }

        newUpdatedVoyageContainer = await updateVoyageContainer(
          updateData,
          transactionalEntityManager,
        );
      }
    });

    return {
      newCreatedVoyageContainer,
      newUpdatedVoyageContainer,
    };
  };

  static deleteVoyageContainer = async (containerRowIdList: string[]) => {
    // const isExecuted = await isVoyageContainerExecuted(containerRowIdList[0]);
    // if (isExecuted) {
    //   throw new BadRequestError(`Không thể xóa, container đã làm lệnh!`);
    // }
    for (const rowId of containerRowIdList) {
      const container = await findVoyageContainer(rowId.trim());
      if (!container) {
        throw new BadRequestError(`VoyageContainer with ID ${rowId} not exist!`);
      }

      if (container.STATUS === 'IMPORTED') {
        throw new BadRequestError(
          `Không thể xóa container ${container.CNTR_NO}, container đã được làm lệnh`,
        );
      }
    }

    return await deleteVoyageContainerMany(containerRowIdList);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getAllVoyageContainer = async (rule: any) => {
    return await filterVoyageContainer(rule);
  };
}
export default VoyageContainerService;
