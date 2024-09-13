import { EntityManager } from 'typeorm';
import mssqlConnection from '../dbs/mssql.connect';
import { ContainerTariff as ContainerTariffEntity } from '../entity/container-tariff.entity';
import { ContainerTariff } from '../models/container-tariff.model';
import { BadRequestError } from '../core/error.response';

export const containerTariffRepository = mssqlConnection.getRepository(ContainerTariffEntity);

const checkValidTariff = async (contSize: number, newFrom: Date, newTo: Date) => {
  if (newFrom > newTo) {
    throw new BadRequestError(`Hạn biểu cước không được nhỏ hơn ngày hiểu lực!`);
  }
  let contTariff = await containerTariffRepository
    .createQueryBuilder('tr')
    .where('tr.CNTR_SIZE = :cntsize', { cntsize: contSize })
    .andWhere('tr.STATUS = :status', { status: 'ACTIVE' })
    .getMany();
  //chexck
  let countCase1 = contTariff.filter(e => e.VALID_FROM > newFrom && e.VALID_FROM > newTo).length;
  let countCase2 = contTariff.filter(e => e.VALID_UNTIL < newFrom).length;
  if (countCase1 && countCase2) {
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
