import mssqlConnection from '../dbs/mssql.connect';
import { ExportOrderDetailEntity } from '../entity/export-order-detail.entity';

export const exportOrderDetailRepository = mssqlConnection.getRepository(ExportOrderDetailEntity);

export const checkPackageCanExport = async (PACKAGE_ID: string) => {
  const checkExist = await exportOrderDetailRepository.findOne({
    where: { VOYAGE_CONTAINER_PACKAGE_ID: PACKAGE_ID },
  });
  return checkExist;
};
