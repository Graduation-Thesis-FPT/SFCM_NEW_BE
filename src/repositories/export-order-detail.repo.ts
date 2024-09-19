import mssqlConnection from '../dbs/mssql.connect';
import { ExportOrderDetailEntity } from '../entity/export-order-detail.entity';

export const exportOrderDetailRepository = mssqlConnection.getRepository(ExportOrderDetailEntity);
