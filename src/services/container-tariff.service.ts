import { BadRequestError } from '../core/error.response';
import { User } from '../entity/user.entity';
import { manager } from '../repositories/index.repo';
import { ContainerTariff, ContainerTariffList } from '../models/container-tariff.model';
import {
  createContainerTariff,
  updateContainerTariff,
  getAllContainerTariff,
  deleteContainerTariffMany,
  checkValidTariff,
} from '../repositories/container-tariff.repo';

class ConatinerTariff {
  static createAndUpdatecontainerTariff = async (
    containerTariffInfo: ContainerTariffList,
    createBy: User,
  ) => {
    const insertData = containerTariffInfo.insert;
    const updateData = containerTariffInfo.update;

    let newCreatedcontainerTariff: ContainerTariff[] = [];
    let newUpdatedcontainerTariff;

    await manager.transaction(async transactionalEntityManager => {
      if (insertData) {
        for (const containerTariff of insertData) {
          //check tariff
          let checkSave = await checkValidTariff(
            containerTariff.CNTR_SIZE,
            containerTariff.VALID_FROM,
            containerTariff.VALID_UNTIL,
            transactionalEntityManager,
          );
          if (!checkSave) {
            throw new BadRequestError(
              `Cước ${containerTariff.ID} với số container ${containerTariff.CNTR_SIZE} không hợp lệ!`,
            );
          }
          //check
          containerTariff.CREATED_BY = createBy.USERNAME;
          containerTariff.UPDATED_BY = createBy.USERNAME;
          containerTariff.CREATED_AT = new Date();
          containerTariff.UPDATED_AT = new Date();
        }

        newCreatedcontainerTariff = await createContainerTariff(
          insertData,
          transactionalEntityManager,
        );
      }

      if (updateData) {
        for (const containerTariff of updateData) {
          //check tariff
          let checkSave = await checkValidTariff(
            containerTariff.CNTR_SIZE,
            containerTariff.VALID_FROM,
            containerTariff.VALID_UNTIL,
            transactionalEntityManager,
            containerTariff.ID,
          );
          if (!checkSave) {
            throw new BadRequestError(
              `Cước ${containerTariff.ID} với số container ${containerTariff.CNTR_SIZE} không hợp lệ!`,
            );
          }
          //check
          containerTariff.CREATED_BY = createBy.USERNAME;
          containerTariff.UPDATED_BY = createBy.USERNAME;
          containerTariff.UPDATED_AT = new Date();
        }

        newUpdatedcontainerTariff = await updateContainerTariff(
          updateData,
          transactionalEntityManager,
        );
      }
    });

    return {
      newCreatedcontainerTariff,
      newUpdatedcontainerTariff,
    };
  };

  static deletecontainerTariff = async (ids: string[]) => {
    return await deleteContainerTariffMany(ids);
  };

  static getAllcontainerTariff = async () => {
    return await getAllContainerTariff();
  };
}
export default ConatinerTariff;
