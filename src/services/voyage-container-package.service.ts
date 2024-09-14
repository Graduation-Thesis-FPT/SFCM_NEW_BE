import { BadRequestError } from '../core/error.response';
import { User } from '../entity/user.entity';
import {
  VoyageContainerPackage,
  VoyageContainerPackageInfo,
} from '../models/voyage-container-package';
import { findCustomerByCode } from '../repositories/customer.repo';
import { manager } from '../repositories/index.repo';
import { findItemTypeByCode } from '../repositories/package-type.repo';
import {
  check4AddnUpdate,
  // check4UpdatenDelete,
  createVoyageContainerPackage,
  updateVoyageContainerPackage,
  deleteVoyageContainerPackage,
  getVoyageContainerPackage,
  checkHouseBillExisted,
} from '../repositories/voyage-container-package.repo';
import {
  findVoyageContainer,
  isVoyageContainerExecuted,
} from '../repositories/voyage-container.repo';

class VoyageContainerPackageService {
  static createAndUpdate = async (reqData: VoyageContainerPackageInfo, createBy: User) => {
    const insertData = reqData.insert;
    const updateData = reqData.update;

    let checkDuplicateHouseBill = [...insertData, ...updateData]
      .map(item => item.HOUSE_BILL)
      .filter((value, index, self) => self.indexOf(value) === index);
    if (checkDuplicateHouseBill.length !== insertData.length + updateData.length) {
      throw new BadRequestError(`Không thể trùng số HouseBill trên cùng Container`);
    }
    let newCreated;
    let newUpdated;

    await manager.transaction(async transactionalEntityManager => {
      if (insertData.length) {
        for (const data of insertData) {
          const isValidPackageTypeId = await findItemTypeByCode(
            data.PACKAGE_TYPE_ID,
            transactionalEntityManager,
          );

          if (!isValidPackageTypeId) {
            throw new BadRequestError(`Loại hàng hóa không tồn tại`);
          }

          const isValidContainer = await findVoyageContainer(data.VOYAGE_CONTAINER_ID);

          if (!isValidContainer) {
            throw new BadRequestError(`Container ${data.VOYAGE_CONTAINER_ID} không tồn tại`);
          }

          const isValidConsignee = await findCustomerByCode(
            data.CONSIGNEE_ID,
            transactionalEntityManager,
          );

          if (!isValidConsignee) {
            throw new BadRequestError(`Chủ hàng ${data.CONSIGNEE_ID} không tồn tại`);
          }

          // const isExecuted = await isVoyageContainerExecuted(data.VOYAGE_CONTAINER_ID);
          // if (isExecuted) {
          //   throw new BadRequestError(`Không thể thêm dữ liệu, container đã làm lệnh!`);
          // }
          const isExist = await checkHouseBillExisted(data.HOUSE_BILL, data.VOYAGE_CONTAINER_ID);
          if (isExist) {
            throw new BadRequestError(`Số HouseBill ${data.HOUSE_BILL} đã tồn tại`);
          }
          data.CREATED_BY = createBy.USERNAME;
          data.UPDATED_BY = createBy.USERNAME;
          data.UPDATED_AT = new Date();
          // data.TIME_IN = new Date();
          data.ID = data.VOYAGE_CONTAINER_ID + '_' + data.HOUSE_BILL;
        }
        newCreated = await createVoyageContainerPackage(insertData, transactionalEntityManager);
      }

      if (updateData.length > 0) {
        for (const data of updateData) {
          if (data.PACKAGE_TYPE_ID) {
            const isValidPackageTypeId = await findItemTypeByCode(
              data.PACKAGE_TYPE_ID,
              transactionalEntityManager,
            );

            if (!isValidPackageTypeId) {
              throw new BadRequestError(`Loại hàng hóa không tồn tại`);
            }
          }

          if (data.VOYAGE_CONTAINER_ID) {
            const isValidContainer = await findVoyageContainer(data.VOYAGE_CONTAINER_ID);

            if (!isValidContainer) {
              throw new BadRequestError(`Container ${data.VOYAGE_CONTAINER_ID} không tồn tại`);
            }
          }

          if (data.CONSIGNEE_ID) {
            const isValidConsignee = await findCustomerByCode(
              data.CONSIGNEE_ID,
              transactionalEntityManager,
            );

            if (!isValidConsignee) {
              throw new BadRequestError(`Chủ hàng ${data.CONSIGNEE_ID} không tồn tại`);
            }
          }

          // const isExecuted = await isContainerExecuted(data.VOYAGE_CONTAINER_ID);
          // if (isExecuted) {
          //   throw new BadRequestError(`Không thể thay đổi dữ liệu, container đã làm lệnh!`);
          // }

          const isExist = await checkHouseBillExisted(data.HOUSE_BILL, data.VOYAGE_CONTAINER_ID);
          if (isExist) {
            throw new BadRequestError(`Số HouseBill ${data.HOUSE_BILL} đã tồn tại`);
          }
          data.UPDATED_BY = createBy.USERNAME;
          data.UPDATED_AT = new Date();
          data.TIME_IN = new Date();
        }
        newUpdated = await updateVoyageContainerPackage(updateData, transactionalEntityManager);
      }
    });

    return {
      newCreated,
      newUpdated,
    };
  };

  static deleteVoyageContainerPackage = async (voyageContainerPackage: string[]) => {
    // const isSuccess = await check4UpdatenDelete(dataVoyageContainerPackage[0].CONTAINER_ID);
    // console.log(isSuccess);
    // if (isSuccess) {
    //   throw new BadRequestError(`Không thể xóa dữ liệu vì đã làm lệnh!`);
    // }

    // const isExecuted = await isContainerExecuted(dataVoyageContainerPackage[0].VOYAGE_CONTAINER_ID);
    // if (isExecuted) {
    //   throw new BadRequestError(`Không thể xóa hàng hóa, container đã làm lệnh!`);
    // }

    return await deleteVoyageContainerPackage(voyageContainerPackage);
  };

  static getVoyageContainerPackage = async (refcont: string) => {
    return await getVoyageContainerPackage(refcont);
  };
}
export default VoyageContainerPackageService;
