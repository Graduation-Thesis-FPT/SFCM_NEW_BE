import { PaymentStatus } from '../models/payment.model';
import { getAllExportPayments } from '../repositories/export-order-payment.repo';
import { getAllImportPayments } from '../repositories/import-order-payment.repo';
import { searchUserByFullname } from '../repositories/user.repo';
import ImportExportOrderService from './order.service';

class PaymentService {
  static readonly getAllPayments = async (
    status?: PaymentStatus,
    orderId?: string,
    orderType?: string,
    searchQuery?: string,
  ) => {
    let result = [];

    const users = await searchUserByFullname(searchQuery);
    const allOrders = await ImportExportOrderService.getImportExportOrders({
      returnImport: true,
      returnExport: true,
    });

    const importPayments = await getAllImportPayments();
    const exportPayments = await getAllExportPayments();

    result.push(
      ...allOrders.importOrders.map(order => {
        const payment = importPayments.find(payment => payment.ID === order.PAYMENT_ID);
        const USER = users.find(user => user.USERNAME === order.ORDER_DETAILS[0].USERNAME);

        if (!USER) {
          return;
        }

        return {
          ORDER: {
            ...order,
            USER: USER,
          },
          ORDER_TYPE: 'IMPORT',
          PAYMENT: payment,
        };
      }),
      ...allOrders.exportOrders.map(order => {
        const payment = exportPayments.find(payment => payment.ID === order.PAYMENT_ID);
        const USER = users.find(user => user.USERNAME === order.ORDER_DETAILS[0].USERNAME);

        if (!USER) {
          return;
        }

        return {
          ORDER: {
            ...order,
            USER: USER,
          },
          ORDER_TYPE: 'EXPORT',
          PAYMENT: payment,
        };
      }),
    );

    if (status) {
      result = result.filter(payment => payment.PAYMENT.STATUS === status.toString());
    }
    if (orderId) {
      result = result.filter(payment => payment.ORDER.ID === orderId);
    }
    if (orderType) {
      result = result.filter(payment => payment.ORDER_TYPE === orderType);
    }

    return result.filter(payment => payment);
  };

  static readonly getAllImportPayments = async () => {
    return await getAllImportPayments();
  };

  static readonly getAllExportPayments = async () => {
    return await getAllExportPayments();
  };
}

export default PaymentService;
