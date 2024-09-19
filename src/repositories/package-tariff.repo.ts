import mssqlConnection from '../dbs/mssql.connect';
import { PackageTariffEntity } from '../entity/package-tariff.entity';

export const packageTariffRepository = mssqlConnection.getRepository(PackageTariffEntity);

export const getLatestValidPackageTariff = async () => {
  return await packageTariffRepository
    .createQueryBuilder()
    .where('VALID_UNTIL >= :now', { now: new Date() })
    .andWhere('VALID_FROM <= :now', { now: new Date() })
    .orderBy('VALID_FROM', 'DESC')
    .getOne();
};
