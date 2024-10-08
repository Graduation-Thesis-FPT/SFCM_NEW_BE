import { BadRequestError } from '../core/error.response';
import { User } from '../entity/user.entity';
import { getAllAvailableCell, updateOldCellStatus } from '../repositories/cell.repo';
import { PackageCellAllocationInfo, PackageReq } from '../models/package-cell-allocation';
import { manager } from '../repositories/index.repo';
import {
  checkExportOrderStatus,
  checkPackageIdExist,
  completePackageSepareate,
  createPackageCellAllocation,
  findCellAllocationByPackageId,
  findPackageById,
  getAllImportedContainer,
  getAllPackageCellById,
  getReadyToWarehouse,
  getListExportPackage,
  getPackageByVoyageContainerId,
  updatePackageCellAllocation,
  updateVoyageContainerPackageStatus,
  updatePackageCellPosition,
  getPackageCellAllocationForDocByRowguid,
} from '../repositories/package-cell-allocation.repo';
import { updateStatusVoyContPackageById } from '../repositories/voyage-container-package.repo';
import { checkPackageCanExport } from '../repositories/export-order-detail.repo';

class PackageCellAllocationService {
  static getPackageCellAllocationForDocByRowguid = async (ROWGUID: string) => {
    return await getPackageCellAllocationForDocByRowguid(ROWGUID);
  };

  static getAllImportedContainer = async () => {
    return await getAllImportedContainer();
  };

  static getPackageByVoyageContainerId = async (CONTAINER_ID: string) => {
    return await getPackageByVoyageContainerId(CONTAINER_ID);
  };

  static getAllPackageCellById = async (VOYAGE_CONTAINER_PACKAGE_ID: string) => {
    return await getAllPackageCellById(VOYAGE_CONTAINER_PACKAGE_ID);
  };

  static createPackageCellAllocation = async (
    listData: PackageCellAllocationInfo,
    createBy: User,
    PACKAGE_ID: string,
  ) => {
    const insertData = listData.insert;
    const updateData = listData.update;

    if (!insertData.length && !updateData.length) {
      throw new BadRequestError(`Không có dữ liệu để thực hiện thao tác. Vui lòng kiểm tra lại!`);
    }
    // if (insertData.length) {
    //   const checkCanceledOrder = await checkPackageCanCelOrder(insertData[0].PACKAGE_ID);
    //   if (!checkCanceledOrder) {
    //     throw new BadRequestError(`Lệnh đã được hủy, không thể kiểm đếm!`);
    //   }
    // }

    let newCreateData;
    let newUpdateData;
    let totalVoyageContainerPackage = 0;

    await manager.transaction(async transactionalEntityManager => {
      if (insertData.length) {
        for (const data of insertData) {
          if (
            !data.SEPARATED_PACKAGE_LENGTH ||
            !data.SEPARATED_PACKAGE_WIDTH ||
            !data.SEPARATED_PACKAGE_HEIGHT
          ) {
            throw new BadRequestError(`Kích thước Pallet không được để trống`);
          }

          const voyageContainerPackage = await checkPackageIdExist(
            data.VOYAGE_CONTAINER_PACKAGE_ID,
            transactionalEntityManager,
          );
          totalVoyageContainerPackage = voyageContainerPackage.TOTAL_ITEMS;
          if (!voyageContainerPackage) {
            throw new BadRequestError(`Kiện hàng không tồn tại. Vui lòng kiểm tra lại`);
          }
          if (voyageContainerPackage.STATUS === 'IN_CONTAINER') {
            await updateStatusVoyContPackageById(
              data.VOYAGE_CONTAINER_PACKAGE_ID,
              'ALLOCATING',
              transactionalEntityManager,
            );
          }

          // const isSEQExist = await checkSEQExist(PACKAGE_ID, data.SEQUENCE);
          // if (isSEQExist) {
          //   throw new BadRequestError(`Số thứ tự đã tồn tại. Vui lòng kiểm tra lại`);
          // }

          const listVaidCell = await getAllAvailableCell({
            SEPARATED_PACKAGE_LENGTH: data.SEPARATED_PACKAGE_LENGTH,
            SEPARATED_PACKAGE_WIDTH: data.SEPARATED_PACKAGE_WIDTH,
            SEPARATED_PACKAGE_HEIGHT: data.SEPARATED_PACKAGE_HEIGHT,
          });

          if (listVaidCell.length === 0) {
            throw new BadRequestError(`Kích thước Pallet không phù hợp với bất kỳ ô nào trong kho`);
          }

          data.CREATED_BY = createBy.USERNAME;
          data.UPDATED_BY = createBy.USERNAME;
        }

        newCreateData = await createPackageCellAllocation(
          insertData,
          totalVoyageContainerPackage,
          transactionalEntityManager,
        );
      }

      if (updateData.length) {
        for (const data of updateData) {
          const isPkExist = await checkPackageIdExist(
            data.VOYAGE_CONTAINER_PACKAGE_ID,
            transactionalEntityManager,
          );
          if (!isPkExist) {
            throw new BadRequestError(`Kiện hàng không tồn tại. Vui lòng kiểm tra lại`);
          }

          // check xem đã hoàn tất tách hàng chưa, nếu hoàn tất tách rồi thì không cho cập nhật
          const cellAlocated = await findCellAllocationByPackageId(
            data.ROWGUID,
            transactionalEntityManager,
          );
          if (cellAlocated.IS_SEPARATED) {
            throw new BadRequestError(`Kiện hàng đã hoàn tất tách hàng, không thể cập nhật`);
          }

          const listVaidCell = await getAllAvailableCell({
            SEPARATED_PACKAGE_LENGTH: data.SEPARATED_PACKAGE_LENGTH,
            SEPARATED_PACKAGE_WIDTH: data.SEPARATED_PACKAGE_WIDTH,
            SEPARATED_PACKAGE_HEIGHT: data.SEPARATED_PACKAGE_HEIGHT,
          });

          if (listVaidCell.length === 0) {
            throw new BadRequestError(
              `Kích thước Package không phù hợp với bất kỳ ô nào trong kho`,
            );
          }

          data.UPDATED_BY = createBy.USERNAME;
          data.UPDATED_AT = new Date();
        }
        newUpdateData = await updatePackageCellAllocation(updateData, transactionalEntityManager);
      }

      // if (insertData.length) {
      //   updateCanCancelImport(insertData[0].PACKAGE_ID);
      // }
    });

    return {
      newCreateData,
      newUpdateData,
    };
  };

  static completePackageSeparate = async (VOYAGE_CONTAINER_PACKAGE_ID: string, createBy: User) => {
    let newUpdateData;
    await manager.transaction(async transactionalEntityManager => {
      // const check = await checkCanCompoleteJobQuantityCheck(VOYAGE_CONTAINER_PACKAGE_ID);
      // if (!check) {
      //   throw new BadRequestError(`Không thể hoàn tất kiểm đếm. Vui lòng kiểm tra lại`);
      // }
      newUpdateData = await completePackageSepareate(
        VOYAGE_CONTAINER_PACKAGE_ID,
        transactionalEntityManager,
        createBy,
      );
    });
    return {
      newUpdateData,
    };
  };

  static getReadyToWarehouse = async () => {
    return await getReadyToWarehouse();
  };

  static getListExportPackage = async () => {
    return await getListExportPackage();
  };

  static exportPackage = async (data: PackageReq) => {
    const packageCell = await findPackageById(data.PACKAGE_CELL_ID);

    if (!packageCell) {
      throw new BadRequestError(`Kiện hàng không tồn tại!`);
    }

    const orderExportExist = await checkPackageCanExport(packageCell.VOYAGE_CONTAINER_PACKAGE_ID);
    if (!orderExportExist) {
      throw new BadRequestError(`Kiện hàng chưa được làm lệnh xuất, vui lòng kiểm tra lại!`);
    }

    const exportOrderStatus = await checkExportOrderStatus(data.PACKAGE_CELL_ID);
    //nếu không có thì nó đang là status CANCLE hoặc không tồn tại order
    if (!exportOrderStatus) {
      throw new BadRequestError(`Lệnh xuất kho đã được hủy, không thể xuất kiện hàng!`);
    }

    // const payment = await checkExportOrderPayment(orderExportExist.ORDER_ID);

    // if (payment.STATUS === 'PENDING') {
    //   throw new BadRequestError(`Lệnh xuất kho chưa thanh toán, vui lòng kiểm tra lại!`);
    // }

    // if (payment.STATUS === 'CANCELLED') {
    //   throw new BadRequestError(`Lệnh xuất kho đã bị hủy, vui lòng kiểm tra lại!`);
    // }

    return await Promise.all([
      updateOldCellStatus(packageCell.CELL_ID),
      updateVoyageContainerPackageStatus(packageCell.VOYAGE_CONTAINER_PACKAGE_ID),
      updatePackageCellPosition(null, data.PACKAGE_CELL_ID),
    ]);
  };
}

export default PackageCellAllocationService;
