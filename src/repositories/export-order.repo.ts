import mssqlConnection from '../dbs/mssql.connect';
import { ExportOrderEntity } from '../entity/export-order.entity';

export const exportOrderRepository = mssqlConnection.getRepository(ExportOrderEntity);
