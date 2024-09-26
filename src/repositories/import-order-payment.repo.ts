import mssqlConnection from '../dbs/mssql.connect';
import { ImportOrderPayment } from '../entity/import-order-payment.entity';

export const importOrderPaymentRepository = mssqlConnection.getRepository(ImportOrderPayment);

export const getAllImportPayments = async () => {
  return await importOrderPaymentRepository.find();
};
