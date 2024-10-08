import mssqlConnection from '../dbs/mssql.connect';
import { ExportOrderPaymentEntity } from '../entity/export-order-payment.entity';

export const exportOrderPaymentRepository = mssqlConnection.getRepository(ExportOrderPaymentEntity);

export const getAllExportPayments = async () => {
  return await exportOrderPaymentRepository.find();
};
