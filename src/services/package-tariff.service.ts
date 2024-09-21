import { BadRequestError } from '../core/error.response';
import { User } from '../entity/user.entity';
import { manager } from '../repositories/index.repo';
import { PackageTariffInfo } from '../models/package-tariff.model';
import {
  createPackageTariff,
  deletePackageTariff,
  findPackageTariffByID,
  getAllPackageTariff,
} from '../repositories/package-tariff.repo';
import moment from 'moment';

class PackageTariffService {
  static createAndUpdatePackageTariff = async (
    itemTypeListInfo: PackageTariffInfo,
    createBy: User,
  ) => {
    const insertData = itemTypeListInfo.insert;
    // const updateData = itemTypeListInfo.update;

    let createdPackageTariff;
    // let updatedPackageTariff;
    await manager.transaction(async transactionEntityManager => {
      if (insertData.length) {
        for (const data of insertData) {
          const from = data.VALID_FROM ? new Date(data.VALID_FROM) : null;
          const to = data.VALID_UNTIL ? new Date(data.VALID_UNTIL) : null;
          if (from > to) {
            throw new BadRequestError(`Ngày hiệu lực biểu cước phải nhỏ hơn ngày hết hạn`);
          }

          const validFrom = moment(new Date(data.VALID_FROM)).format('DD/MM/YYYY');
          const validUntil = moment(new Date(data.VALID_UNTIL)).format('DD/MM/YYYY');

          const packageTariff = await getAllPackageTariff();
          if (packageTariff) {
            for (const { VALID_FROM, VALID_UNTIL } of packageTariff) {
              if (from >= VALID_FROM && from <= VALID_UNTIL) {
                throw new BadRequestError(
                  `Ngày ${validFrom} không hợp lệ đã tồn tại mẫu biểu cước có thời hạn từ ${moment(VALID_FROM).format('DD/MM/YYYY')} đến ${moment(VALID_UNTIL).format('DD/MM/YYYY')}`,
                );
              }

              if (to >= VALID_FROM && to <= VALID_UNTIL) {
                throw new BadRequestError(
                  `Ngày ${validUntil} không hợp lệ đã tồn tại mẫu biểu cước có thời hạn từ ${moment(VALID_FROM).format('DD/MM/YYYY')} đến ${moment(VALID_UNTIL).format('DD/MM/YYYY')}`,
                );
              }
            }
          }
          data.CREATED_BY = createBy.USERNAME;
          data.UPDATED_BY = createBy.USERNAME;
          data.UPDATED_AT = new Date();
          data.CREATED_AT = new Date();
          data.ID = data.NAME + '-' + validFrom + '-' + validUntil;
        }

        createdPackageTariff = await createPackageTariff(insertData, transactionEntityManager);
      }

      // if (updateData.length) {
      //   for (const data of updateData) {
      //     const checkExist = await findPackageTariffById(data.ID, transactionEntityManager);

      //     if (!checkExist) {
      //       throw new BadRequestError(`Mã biểu cước hàng hóa ${data.ID} không tồn tại`);
      //     }
      //     data.UPDATED_BY = createBy.USERNAME;
      //     data.UPDATED_AT = new Date();
      //   }
      //   updatedPackageTariff = await updatePackageTariff(updateData, transactionEntityManager);
      // }
    });
    return {
      createdPackageTariff,
      // updatedPackageTariff,
    };
  };

  static deleteIPackageTariff = async (packageTariffCode: string[]) => {
    for (const pacageTariffCdoe of packageTariffCode) {
      const packageTariff = await findPackageTariffByID(pacageTariffCdoe);
      if (!packageTariff) {
        throw new BadRequestError(`Package Tariff with ID ${packageTariff.ID} not exist!`);
      }
    }

    return await deletePackageTariff(packageTariffCode);
  };

  static getAllPackageTariff = async () => {
    return await getAllPackageTariff();
  };
}
export default PackageTariffService;
