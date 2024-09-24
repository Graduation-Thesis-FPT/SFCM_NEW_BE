import { BadRequestError } from '../core/error.response';
import { User } from '../entity/user.entity';
import { manager } from '../repositories/index.repo';
import { PackageTariffInfo } from '../models/package-tariff.model';
import {
  createPackageTariff,
  deletePackageTariff,
  findPackageTariffById,
  findPackageTariffByID,
  getAllPackageTariff,
} from '../repositories/package-tariff.repo';
import moment from 'moment';
import { PackageTariffDetailInfo } from '../models/package-tariff-detail.model';
import {
  createPackageTariffDetail,
  deletePackageTariffDetail,
  findPackageTariffDetailByID,
  findPackageTariffDetailById,
  getPackageTariffDetailByFK,
  updatePackageTariffDetail,
} from '../repositories/package-tariff-detail.repo';
import { findItemTypeByCode } from '../repositories/package-type.repo';

class PackageTariffDetailService {
  static createAndUpdatePackageTariffDetail = async (
    itemTypeListInfo: PackageTariffDetailInfo,
    createBy: User,
  ) => {
    const insertData = itemTypeListInfo.insert;
    const updateData = itemTypeListInfo.update;

    let createdPackageTariffDetail;
    let updatedPackageTariffDetail;
    await manager.transaction(async transactionEntityManager => {
      if (insertData.length) {
        for (const data of insertData) {
          const packageTariff = await findPackageTariffById(
            data.PACKAGE_TARIFF_ID,
            transactionEntityManager,
          );
          if (!packageTariff) {
            throw new BadRequestError(`Mã biểu cước ${data.PACKAGE_TARIFF_ID} không tồn tại`);
          }

          const packageType = await findItemTypeByCode(
            data.PACKAGE_TYPE_ID,
            transactionEntityManager,
          );

          if (!packageType) {
            throw new BadRequestError(`Loại kiện hàng ${data.PACKAGE_TYPE_ID} không tồn tại`);
          }

          data.CREATED_BY = createBy.USERNAME;
          data.UPDATED_BY = createBy.USERNAME;
          data.UPDATED_AT = new Date();
          data.CREATED_AT = new Date();
          data.STATUS = 'ACTIVE';
        }

        createdPackageTariffDetail = await createPackageTariffDetail(
          insertData,
          transactionEntityManager,
        );
      }

      if (updateData.length) {
        for (const data of updateData) {
          const checkExist = await findPackageTariffDetailById(
            data.ROWGUID,
            transactionEntityManager,
          );

          if (!checkExist) {
            throw new BadRequestError(
              `Mã Biểu cước chi tiết kiện hàng ${data.ROWGUID} không tồn tại`,
            );
          }

          if (data.PACKAGE_TARIFF_ID) {
            const packageTariff = await findPackageTariffById(
              data.PACKAGE_TARIFF_ID,
              transactionEntityManager,
            );

            if (!packageTariff) {
              throw new BadRequestError(
                `Mã biểu cước kiện hàng ${data.PACKAGE_TARIFF_ID} không tồn tại`,
              );
            }
          }

          if (data.PACKAGE_TYPE_ID) {
            const packageType = await findItemTypeByCode(
              data.PACKAGE_TYPE_ID,
              transactionEntityManager,
            );

            if (!packageType) {
              throw new BadRequestError(`Loại kiện hàng ${data.PACKAGE_TYPE_ID} không tồn tại`);
            }
          }

          data.UPDATED_BY = createBy.USERNAME;
          data.UPDATED_AT = new Date();
        }
        updatedPackageTariffDetail = await updatePackageTariffDetail(
          updateData,
          transactionEntityManager,
        );
      }
    });
    return {
      createdPackageTariffDetail,
      updatedPackageTariffDetail,
    };
  };

  static deleteIPackageTariffDetail = async (packageTariffDetailCode: string[]) => {
    for (const packageTariffCodeDetail of packageTariffDetailCode) {
      const packageTariffDetail = await findPackageTariffDetailByID(packageTariffCodeDetail);
      if (!packageTariffDetail) {
        throw new BadRequestError(
          `Package Tariff with ID ${packageTariffDetail.ROWGUID} not exist!`,
        );
      }
    }

    return await deletePackageTariffDetail(packageTariffDetailCode);
  };

  static getPackageTariffDetailByFK = async (PACKAGE_TARIFF_ID: string) => {
    return await getPackageTariffDetailByFK(PACKAGE_TARIFF_ID);
  };
}
export default PackageTariffDetailService;
