import { EntityManager } from 'typeorm';
import mssqlConnection from '../dbs/mssql.connect';
import { PackageTariffEntity } from '../entity/package-tariff.entity';
import { PackageTariff } from '../models/package-tariff.model';

export const packageTariffRepository = mssqlConnection.getRepository(PackageTariffEntity);

export const getLatestValidPackageTariff = async () => {
  return await packageTariffRepository
    .createQueryBuilder()
    .where('VALID_UNTIL >= :now', { now: new Date() })
    .andWhere('VALID_FROM <= :now', { now: new Date() })
    .orderBy('VALID_FROM', 'DESC')
    .getOne();
};

export const createPackageTariff = async (
  packageTariffList: PackageTariff[],
  transactionEntityManager: EntityManager,
) => {
  const packageTariffs = packageTariffRepository.create(packageTariffList);
  return await transactionEntityManager.save(packageTariffs);
};

export const updatePackageTariff = async (
  packageTariffList: PackageTariff[],
  transactionEntityManager: EntityManager,
) => {
  for await (const data of packageTariffList) {
    await transactionEntityManager.update(PackageTariffEntity, data.ID, data);
  }
  return true;
};

export const findPackageTariffById = async (
  ID: string,
  transactionEntityManager: EntityManager,
) => {
  return await transactionEntityManager
    .createQueryBuilder(PackageTariffEntity, 'packageTariff')
    .where('packageTariff.ID = :ID', { ID: ID })
    .getOne();
};

export const getAllPackageTariff = async () => {
  return await packageTariffRepository.find({
    order: {
      UPDATED_AT: 'DESC',
    },
  });
};

export const findPackageTariffByID = async (ID: string) => {
  return await packageTariffRepository
    .createQueryBuilder('packageTariff')
    .where('packageTariff.ID = :ID', { ID: ID })
    .getOne();
};

export const deletePackageTariff = async (PackgeTariffListId: string[]) => {
  return await packageTariffRepository.delete(PackgeTariffListId);
};
