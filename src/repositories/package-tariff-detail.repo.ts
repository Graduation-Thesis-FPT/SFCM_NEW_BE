import { EntityManager } from 'typeorm';
import mssqlConnection from '../dbs/mssql.connect';
import { PackageTariffDetail } from '../models/package-tariff-detail.model';
import { PackageTariffDetailEntity } from '../entity/package-tariff-detail.entity';

export const packageTariffDetailRepository =
  mssqlConnection.getRepository(PackageTariffDetailEntity);

export const getLatestValidPackageTariff = async () => {
  return await packageTariffDetailRepository
    .createQueryBuilder()
    .where('VALID_UNTIL >= :now', { now: new Date() })
    .andWhere('VALID_FROM <= :now', { now: new Date() })
    .orderBy('VALID_FROM', 'DESC')
    .getOne();
};

export const createPackageTariffDetail = async (
  packageTariffDetailList: PackageTariffDetail[],
  transactionEntityManager: EntityManager,
) => {
  const packageTariffs = packageTariffDetailRepository.create(packageTariffDetailList);
  return await transactionEntityManager.save(packageTariffs);
};

export const updatePackageTariffDetail = async (
  packageTariffDetailList: PackageTariffDetail[],
  transactionEntityManager: EntityManager,
) => {
  for await (const data of packageTariffDetailList) {
    await transactionEntityManager.update(PackageTariffDetailEntity, data.ROWGUID, data);
  }
  return true;
};

export const findPackageTariffDetailById = async (
  ID: string,
  transactionEntityManager: EntityManager,
) => {
  return await transactionEntityManager
    .createQueryBuilder(PackageTariffDetailEntity, 'packageTariff')
    .select([
      'packageTariff.ROWGUID as ROWGUID',
      'packageTariff.PACKAGE_TARIFF_ID as PACKAGE_TARIFF_ID',
      'packageTariff.PACKAGE_TYPE_ID as PACKAGE_TYPE_ID',
      'packageTariff.UNIT as UNIT',
      'packageTariff.UNIT_PRICE as UNIT_PRICE',
      'packageTariff.VAT_RATE as VAT_RATE',
      'packageTariff.STATUS as STATUS',
      'packageTariff.CREATED_AT as CREATED_AT',
      'packageTariff.CREATED_BY as CREATED_BY',
      'packageTariff.UPDATED_AT as UPDATED_AT',
      'packageTariff.UPDATED_BY as UPDATED_BY',
    ])
    .where('packageTariff.ROWGUID = :ID', { ID: ID })
    .getRawOne();
};

export const getAllPackageTariffDetail = async () => {
  return await packageTariffDetailRepository.find({
    order: {
      UPDATED_AT: 'DESC',
    },
  });
};

export const findPackageTariffDetailByID = async (ID: string) => {
  return await packageTariffDetailRepository
    .createQueryBuilder('packageTariff')
    .where('packageTariff.ROWGUID = :ID', { ID: ID })
    .getOne();
};

export const deletePackageTariffDetail = async (PackgeTariffDetailListId: string[]) => {
  return await packageTariffDetailRepository
    .createQueryBuilder('packageTariffDetail')
    .update(PackageTariffDetailEntity)
    .set({ STATUS: 'INACTIVE' })
    .where('ROWGUID IN (:...ROWGUID)', { ROWGUID: PackgeTariffDetailListId })
    .execute();
};
