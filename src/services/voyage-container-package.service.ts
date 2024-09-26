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
  getAllVoyagePackageByStatus,
  findVoyageContainerPackageById,
} from '../repositories/voyage-container-package.repo';
import {
  checkIsContPayment,
  findVoyageContainer,
  isVoyageContainerExecuted,
} from '../repositories/voyage-container.repo';

class VoyageContainerPackageService {
  static createAndUpdate = async (
    reqData: VoyageContainerPackageInfo,
    createBy: User,
    VOYAGE_CONTAINER_ID: string,
  ) => {
    const insertData = reqData.insert;
    const updateData = reqData.update;

    let checkDuplicateHouseBill = [...insertData, ...updateData]
      .map(item => item.HOUSE_BILL)
      .filter((value, index, self) => self.indexOf(value) === index);
    if (checkDuplicateHouseBill.length !== insertData.length + updateData.length) {
      throw new BadRequestError(`Không thể trùng số HouseBill trên cùng Container`);
    }

    const check = await checkIsContPayment(VOYAGE_CONTAINER_ID);
    if (check) {
      throw new BadRequestError(check.message);
    }

    let newCreated;
    let newUpdated;

    await manager.transaction(async transactionalEntityManager => {
      if (insertData.length) {
        for (const data of insertData) {
          const isValidContainer = await findVoyageContainer(data.VOYAGE_CONTAINER_ID);
          if (!isValidContainer) {
            throw new BadRequestError(`Container ${data.VOYAGE_CONTAINER_ID} không tồn tại`);
          }
          if (isValidContainer.STATUS !== 'PENDING') {
            throw new BadRequestError(
              `Thao tác không thành công. Container này đã làm lệnh nhập kho`,
            );
          }

          const isExist = await checkHouseBillExisted(data.HOUSE_BILL, data.VOYAGE_CONTAINER_ID);
          if (isExist) {
            throw new BadRequestError(
              `Số House Bill ${data.HOUSE_BILL} đã được sử dụng trong container này`,
            );
          }

          const isValidConsignee = await findCustomerByCode(
            data.CONSIGNEE_ID,
            transactionalEntityManager,
          );
          if (!isValidConsignee) {
            throw new BadRequestError(`Mã chủ hàng ${data.CONSIGNEE_ID} không tồn tại`);
          }

          const isValidPackageTypeId = await findItemTypeByCode(
            data.PACKAGE_TYPE_ID,
            transactionalEntityManager,
          );
          if (!isValidPackageTypeId) {
            throw new BadRequestError(`Mã loại hàng ${data.PACKAGE_TYPE_ID} không tồn tại`);
          }

          // const isExecuted = await isVoyageContainerExecuted(data.VOYAGE_CONTAINER_ID);
          // if (isExecuted) {
          //   throw new BadRequestError(`Không thể thêm dữ liệu, container đã làm lệnh!`);
          // }

          data.CREATED_BY = createBy.USERNAME;
          data.UPDATED_BY = createBy.USERNAME;
          // data.TIME_IN = new Date();
          data.ID = data.VOYAGE_CONTAINER_ID + '_' + data.HOUSE_BILL;
        }
        newCreated = await createVoyageContainerPackage(insertData, transactionalEntityManager);
      }

      if (updateData.length > 0) {
        for (const data of updateData) {
          const isValidContainer = await findVoyageContainer(data.VOYAGE_CONTAINER_ID);
          if (!isValidContainer) {
            throw new BadRequestError(`Container ${data.VOYAGE_CONTAINER_ID} không tồn tại`);
          }
          if (isValidContainer.STATUS !== 'PENDING') {
            throw new BadRequestError(
              `Thao tác không thành công. Container này đã làm lệnh nhập kho`,
            );
          }

          const isPkExist = await findVoyageContainerPackageById(data.ID);
          if (!isPkExist) {
            throw new BadRequestError(`Dữ liệu không tồn tại`);
          }
          if (isPkExist.STATUS !== 'IN_CONTAINER') {
            throw new BadRequestError(
              `Chỉnh sửa House Bill: ${data.HOUSE_BILL} không thành công. Chỉ được phép chỉnh sửa dữ liệu hàng hóa với trạng thái trên container`,
            );
          }

          const isValidConsignee = await findCustomerByCode(
            data.CONSIGNEE_ID,
            transactionalEntityManager,
          );
          if (!isValidConsignee) {
            throw new BadRequestError(`Chủ hàng ${data.CONSIGNEE_ID} không tồn tại`);
          }

          const isValidPackageTypeId = await findItemTypeByCode(
            data.PACKAGE_TYPE_ID,
            transactionalEntityManager,
          );
          if (!isValidPackageTypeId) {
            throw new BadRequestError(`Mã loại hàng ${data.PACKAGE_TYPE_ID} không tồn tại`);
          }

          // const isExecuted = await isContainerExecuted(data.VOYAGE_CONTAINER_ID);
          // if (isExecuted) {
          //   throw new BadRequestError(`Không thể thay đổi dữ liệu, container đã làm lệnh!`);
          // }

          data.UPDATED_BY = createBy.USERNAME;
          data.UPDATED_AT = new Date();
        }
        newUpdated = await updateVoyageContainerPackage(updateData, transactionalEntityManager);
      }
    });

    return {
      newCreated,
      newUpdated,
    };
  };

  static deleteVoyageContainerPackage = async (voyageContainerPackageID: string[]) => {
    for (const pkID of voyageContainerPackageID) {
      const isPkExist = await findVoyageContainerPackageById(pkID);
      if (!isPkExist) {
        throw new BadRequestError(`Dữ liệu không tồn tại`);
      }
      if (isPkExist.STATUS !== 'IN_CONTAINER') {
        throw new BadRequestError(
          `Xóa House Bill: ${isPkExist.HOUSE_BILL} không thành công. Chỉ được phép xóa dữ liệu hàng hóa với trạng thái trên container`,
        );
      }

      const check = await checkIsContPayment(isPkExist.VOYAGE_CONTAINER_ID);
      if (check) {
        throw new BadRequestError(check.message);
      }

      const isValidContainer = await findVoyageContainer(isPkExist.VOYAGE_CONTAINER_ID);
      if (!isValidContainer) {
        throw new BadRequestError(`Container này không tồn tại`);
      }
      if (isValidContainer.STATUS !== 'PENDING') {
        throw new BadRequestError(`Thao tác không thành công. Container này đã làm lệnh nhập kho`);
      }
    }

    // const isSuccess = await check4UpdatenDelete(dataVoyageContainerPackage[0].CONTAINER_ID);
    // console.log(isSuccess);
    // if (isSuccess) {
    //   throw new BadRequestError(`Không thể xóa dữ liệu vì đã làm lệnh!`);
    // }

    // const isExecuted = await isContainerExecuted(dataVoyageContainerPackage[0].VOYAGE_CONTAINER_ID);
    // if (isExecuted) {
    //   throw new BadRequestError(`Không thể xóa hàng hóa, container đã làm lệnh!`);
    // }

    return await deleteVoyageContainerPackage(voyageContainerPackageID);
  };

  static getVoyageContainerPackage = async (voyageContID: string) => {
    return await getVoyageContainerPackage(voyageContID);
  };

  static getVoyageContainerPackageByStatus = async (voyageContainerId: string, status: string) => {
    return await getAllVoyagePackageByStatus(voyageContainerId, status);
  };
}
export default VoyageContainerPackageService;
