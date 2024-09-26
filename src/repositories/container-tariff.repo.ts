import { EntityManager } from 'typeorm';
import mssqlConnection from '../dbs/mssql.connect';
import { ContainerTariff as ContainerTariffEntity } from '../entity/container-tariff.entity';
import { ContainerTariff } from '../models/container-tariff.model';
import { BadRequestError } from '../core/error.response';

export const containerTariffRepository = mssqlConnection.getRepository(ContainerTariffEntity);

const checkValidTariff = async (
  contSize: number,
  newFrom: Date,
  newTo: Date,
  transactionalEntityManager: EntityManager,
  IDUpdate: string = '',
) => {
  if (newFrom > newTo) {
    throw new BadRequestError(`Hạn biểu cước không được nhỏ hơn ngày hiểu lực!`);
  }
  let query = transactionalEntityManager
    .getRepository(ContainerTariffEntity)
    .createQueryBuilder('tr')
    .where('tr.CNTR_SIZE = :cntsize', { cntsize: contSize })
    .andWhere('tr.STATUS = :status', { status: 'ACTIVE' });
  if (IDUpdate) {
    query = query.andWhere('tr.ID != :excludedId', { excludedId: IDUpdate });
  }
  let contTariff = await query.getMany();
  let check = contTariff.filter(item => {
    return (
      (item.VALID_FROM <= newFrom && newFrom <= item.VALID_UNTIL) ||
      (item.VALID_FROM <= newTo && newTo <= item.VALID_UNTIL) ||
      (item.VALID_FROM >= newFrom && newTo >= item.VALID_UNTIL)
    );
  }).length;

  if (check) {
    throw new BadRequestError(
      `Ngày hiệu lực của biểu cước với container ${contSize} không hợp lệ!`,
    );
  }
  return true;
};

const createContainerTariff = async (
  containerTariff: ContainerTariff[],
  transactionEntityManager: EntityManager,
) => {
  const tariff = containerTariffRepository.create(containerTariff);
  const newTariff = await transactionEntityManager.save(tariff);
  return newTariff;
};

const updateContainerTariff = async (
  containerTariff: ContainerTariff[],
  transactionalEntityManager: EntityManager,
) => {
  return await Promise.all(
    containerTariff.map(tariff =>
      transactionalEntityManager.update(ContainerTariffEntity, tariff.ID, tariff),
    ),
  );
};

const getAllContainerTariff = async () => {
  return await containerTariffRepository.find({
    order: {
      UPDATED_AT: 'DESC',
    },
  });
};

const deleteContainerTariffMany = async (ids: string[]) => {
  return await containerTariffRepository.delete(ids);
};

export {
  createContainerTariff,
  updateContainerTariff,
  getAllContainerTariff,
  deleteContainerTariffMany,
  checkValidTariff,
};
