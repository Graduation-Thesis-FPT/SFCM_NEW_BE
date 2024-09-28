import { ERROR_MESSAGE } from '../constants';
import { BadRequestError } from '../core/error.response';
import { User } from '../entity/user.entity';
// import { Container } from '../models/container.model';
import { Customer } from '../models/customer.model';
import { DateRange } from '../models/deliver-order.model';
import { PaymentStatus } from '../models/payment.model';
import { VoyageContainerPackage } from '../models/voyage-container-package';
import { VoyageContainer } from '../models/voyage-container.model';
import {
  findExportedOrdersByStatus,
  findImportedOrdersByStatus,
} from '../repositories/customer-order.repo';
import { findCustomer, findCustomerByUserName } from '../repositories/customer.repo';
import { getAllExportPayments } from '../repositories/export-order-payment.repo';
import { getAllImportPayments } from '../repositories/import-order-payment.repo';
import { findImportDetailByOrderId, findOrderByOrderId } from '../repositories/import-order.repo';
import {
  findPackageByVoyageContainerId,
  findVoyageContainerPackageByContainerId,
  getVoyageContainerPackagesByIds,
} from '../repositories/voyage-container-package.repo';
import { findVoyageContainer } from '../repositories/voyage-container.repo';
import ImportExportOrderService from './order.service';

export type CustomerOrderStatus = 'PENDING' | 'PAID' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

class CustomerOrderService {
  static getImportedOrdersByStatus = async (status: string, user: User, filterDate: DateRange) => {
    const customer = await findCustomerByUserName(user.USERNAME);
    if (!customer) {
      throw new BadRequestError(ERROR_MESSAGE.CUSTOMER_NOT_EXIST);
    }
    let orders = await findImportedOrdersByStatus(customer.ID);

    if (filterDate.from && filterDate.to) {
      orders = orders.filter(order => {
        return (
          order.CREATED_AT >= new Date(filterDate.from) &&
          order.CREATED_AT <= new Date(filterDate.to)
        );
      });
    }
    const processOrder = async (order: any) => {
      // let orderStatus: ImportedOrderStatus;
      // if (order.TOTAL_PACKAGES === order.TOTAL_JOBS_BY_PACKAGE) {
      //   if (order.TOTAL_PALLETS === order.STORED_PALLETS) {
      //     orderStatus = ImportedOrderStatus.isStored;
      //   } else if (order.TOTAL_JOBS === order.CHECKED_JOBS) {
      //     orderStatus = ImportedOrderStatus.isChecked;
      //   } else {
      //     orderStatus = ImportedOrderStatus.isConfirmed;
      //   }
      // } else {
      //   orderStatus = ImportedOrderStatus.isConfirmed;
      // }
      let containerInfo: VoyageContainer = await findVoyageContainer(order.VOYAGE_CONTAINER_ID);

      if (!containerInfo) {
        containerInfo = {
          ID: '',
          VOYAGE_ID: '',
          CNTR_NO: '',
          SHIPPER_ID: '',
          CNTR_SIZE: 0,
          SEAL_NO: '',
          STATUS: '',
          NOTE: '',
        };
      }

      const packageInfo = await findVoyageContainerPackageByContainerId(order.VOYAGE_CONTAINER_ID);
      let containerStatus = '';
      const totalCbm = packageInfo.reduce((acc, cur) => {
        containerStatus = cur.STATUS;
        return acc + cur.CBM;
      }, 0);

      if (!packageInfo) {
        throw new BadRequestError(`kiện hàng không tồn tại`);
      }

      let customerInfo: Customer = await findCustomer(order.SHIPPER_ID);
      if (!customerInfo) {
        customerInfo = {
          ID: '',
          USERNAME: '',
          CUSTOMER_TYPE: '',
          TAX_CODE: '',
          CREATED_BY: '',
          CREATED_AT: new Date(),
          UPDATED_BY: '',
          UPDATED_AT: new Date(),
        };
      }

      return {
        ORDER_ID: order.ORDER_ID,
        SHIPPER_ID: order.SHIPPER_ID,
        VOYAGE_CONTAINER_ID: order.VOYAGE_CONTAINER_ID,
        // ORDER_STATUS: order.STATUS,
        // PACKAGE_ID: order.DO_PACKAGE_ID,
        TOTAL_CBM: totalCbm,
        // NOTE: order.NOTE,
        status: containerStatus,
        containerInfo,
        customerInfo,
      };
    };

    const processedOrders = await Promise.all(orders.map(processOrder));
    return processedOrders.filter(order => order.status === status);
  };

  static getExportedOrdersByStatus = async (status: string, user: User, filterDate: DateRange) => {
    const customer = await findCustomerByUserName(user.USERNAME);
    if (!customer) {
      throw new BadRequestError(ERROR_MESSAGE.CUSTOMER_NOT_EXIST);
    }
    let orders = await findExportedOrdersByStatus(customer.ID);
    if (filterDate.from && filterDate.to) {
      orders = orders.filter(order => {
        return (
          order.CREATED_AT >= new Date(filterDate.from) &&
          order.CREATED_AT <= new Date(filterDate.to)
        );
      });
    }
    const processOrder = async (order: any) => {
      // let orderStatus: ExportedOrderStatus;
      // if (
      //   order.TOTAL_JOBS === order.TOTAL_PALLETS &&
      //   order.TOTAL_PALLETS === order.RELEASED_PALLETS
      // ) {
      //   orderStatus = ExportedOrderStatus.isReleased;
      // } else {
      //   orderStatus = ExportedOrderStatus.isConfirmed;
      // }
      let containerInfo: VoyageContainer = await findVoyageContainer(order.VOYAGE_CONTAINER_ID);

      if (!containerInfo) {
        containerInfo = {
          ID: '',
          VOYAGE_ID: '',
          CNTR_NO: '',
          SHIPPER_ID: '',
          CNTR_SIZE: 0,
          SEAL_NO: '',
          STATUS: '',
          NOTE: '',
        };
      }

      let customerInfo: Customer = await findCustomer(order.CONSIGNEE_ID);
      if (!customerInfo) {
        customerInfo = {
          ID: '',
          USERNAME: '',
          CUSTOMER_TYPE: '',
          TAX_CODE: '',
          CREATED_BY: '',
          CREATED_AT: new Date(),
          UPDATED_BY: '',
          UPDATED_AT: new Date(),
        };
      }
      const packageInfo = await findVoyageContainerPackageByContainerId(order.VOYAGE_CONTAINER_ID);
      let packageStatus = '';

      const totalCbm = packageInfo.reduce((acc, cur) => {
        packageStatus = cur.STATUS;
        return acc + cur.CBM;
      }, 0);

      return {
        ORDER_ID: order.ORDER_ID,
        CONSIGNEE_ID: order.CONSIGNEE_ID,
        VOYAGE_CONTAINER_ID: order.VOYAGE_CONTAINER_ID,
        ORDER_STATUS: order.STATUS,
        // PACKAGE_ID: order.PACKAGE_ID,
        TOTAL_CBM: totalCbm,
        NOTE: order.NOTE,
        status: packageStatus,
        containerInfo,
        packageInfo,
        customerInfo,
      };
    };
    const processedOrders = await Promise.all(orders.map(processOrder));
    return processedOrders.filter(order => order.status === status);
  };

  static getOrderByOrderNo = async (orderNo: string) => {
    const order = await findOrderByOrderId(orderNo);

    if (!order) {
      throw new BadRequestError(ERROR_MESSAGE.ORDER_NOT_EXIST);
    }
    const orderDetails = await findImportDetailByOrderId(orderNo);

    let listImportedContainer = [];
    let listPackage = [];

    for (const orderDetail of orderDetails) {
      let containerInfo: VoyageContainer = await findVoyageContainer(
        orderDetail.VOYAGE_CONTAINER_ID,
      );
      if (!containerInfo) {
        containerInfo = {
          ID: '',
          VOYAGE_ID: '',
          CNTR_NO: '',
          SHIPPER_ID: '',
          CNTR_SIZE: 0,
          SEAL_NO: '',
          STATUS: '',
          NOTE: '',
        };
      }
      listImportedContainer.push(containerInfo);

      let packageInfo: VoyageContainerPackage = await findPackageByVoyageContainerId(
        orderDetail.VOYAGE_CONTAINER_ID,
      );
      if (!packageInfo) {
        packageInfo = {
          ID: '',
          VOYAGE_CONTAINER_ID: '',
          HOUSE_BILL: '',
          PACKAGE_TYPE_ID: '',
          CONSIGNEE_ID: '',
          PACKAGE_UNIT: '',
          CBM: 0,
          TOTAL_ITEMS: 0,
          NOTE: '',
          TIME_IN: new Date(),
          STATUS: '',
        };
      }
      listPackage.push(packageInfo);
    }

    let customerInfo: Customer = await findCustomer(listImportedContainer[0].SHIPPER_ID);
    if (!customerInfo) {
      customerInfo = {
        ID: '',
        USERNAME: '',
        CUSTOMER_TYPE: '',
        TAX_CODE: '',
        CREATED_BY: '',
        CREATED_AT: new Date(),
        UPDATED_BY: '',
        UPDATED_AT: new Date(),
      };
    }

    return {
      ORDER_ID: order.ID,
      ORDER_STATUS: order.STATUS,
      NOTE: order.NOTE,
      ORDER_PAYMENT: order.ORDER_PAYMENT,
      orderDetails,
      listImportedContainer,
      customerInfo,
      listPackage,
    };
  };

  static readonly getCustomerOrders = async (
    username: string,
    from?: string,
    to?: string,
    status?: PaymentStatus,
    orderId?: string,
    orderType?: string,
  ) => {
    let result = [];
    const customer = await findCustomerByUserName(username);

    if (!customer) {
      throw new BadRequestError(ERROR_MESSAGE.CUSTOMER_NOT_EXIST);
    }

    if (!['CONSIGNEE', 'SHIPPER'].includes(customer.CUSTOMER_TYPE)) {
      throw new BadRequestError(
        `Customer type ${customer.CUSTOMER_TYPE} is not allowed to view orders, expected CONSIGNEE or SHIPPER.`,
      );
    }

    const allOrders = await ImportExportOrderService.getImportExportOrders({
      consigneeId: customer.ID,
      shipperId: customer.ID,
      from,
      to,
      returnImport: true,
      returnExport: true,
    });

    const importContainerIds: string[] = Array.from(
      new Set(
        allOrders.importOrders
          .map(order => order.ORDER_DETAILS)
          .flat()
          .map((orderDetail: any) => orderDetail.VOYAGE_CONTAINER_ID),
      ),
    );
    const exportContainerPackageIds: string[] = Array.from(
      new Set(
        allOrders.exportOrders
          .map(order => order.ORDER_DETAILS)
          .flat()
          .map((orderDetail: any) => orderDetail.VOYAGE_CONTAINER_PACKAGE_ID),
      ),
    );

    const packagesSet = new Set(
      await Promise.all(
        importContainerIds.map(async containerId => {
          const packages = await findPackageByVoyageContainerId(containerId);
          return packages;
        }),
      ),
    );
    await getVoyageContainerPackagesByIds(exportContainerPackageIds.map(id => id)).then(ps => {
      ps.forEach(p => {
        packagesSet.add(p);
      });
    });

    const packages = Array.from(packagesSet);

    const importPayments = await getAllImportPayments();
    const exportPayments = await getAllExportPayments();

    result.push(
      ...allOrders.importOrders.map(order => {
        const payment = importPayments.find(payment => payment.ID === order.PAYMENT_ID);

        order.ORDER_DETAILS = order.ORDER_DETAILS.map((orderDetail: any) => {
          const PRE_VAT_AMOUNT = orderDetail.UNIT_PRICE;
          const VAT_AMOUNT = PRE_VAT_AMOUNT * (orderDetail.VAT_RATE / 100);
          const TOTAL_AMOUNT = PRE_VAT_AMOUNT + VAT_AMOUNT;

          return {
            ...orderDetail,
            PRE_VAT_AMOUNT,
            VAT_AMOUNT,
            TOTAL_AMOUNT,
          };
        });

        // import:
        // payment status = PENDING -> order status = PENDING
        // payment status = PAID -> order status = PAID
        // all packages status == IN_WAREHOUSE | OUT_FOR_DELIVERY -> COMPLETED, otherwise IN_PROGRESS
        // order status CANCELLED -> CANCELLED

        let ORDER_STATUS: CustomerOrderStatus = 'PENDING';

        if (payment.STATUS === 'PAID') {
          ORDER_STATUS = 'PAID';
        }

        const containerIds = order.ORDER_DETAILS.map(
          (orderDetail: any) => orderDetail.VOYAGE_CONTAINER_ID,
        );

        const filteredPackages = packages.filter(p => containerIds.includes(p.VOYAGE_CONTAINER_ID));
        if (
          filteredPackages.every(
            p => p.STATUS === 'IN_WAREHOUSE' || p.STATUS === 'OUT_FOR_DELIVERY',
          )
        ) {
          ORDER_STATUS = 'COMPLETED';
        } else {
          ORDER_STATUS = 'IN_PROGRESS';
        }

        if (order.STATUS === 'CANCELLED') {
          ORDER_STATUS = 'CANCELLED';
        }

        return {
          ORDER: {
            ...order,
          },
          ORDER_TYPE: 'IMPORT',
          ORDER_STATUS,
          PAYMENT: payment,
        };
      }),
      ...allOrders.exportOrders.map(order => {
        const payment = exportPayments.find(payment => payment.ID === order.PAYMENT_ID);

        order.ORDER_DETAILS = order.ORDER_DETAILS.map((orderDetail: any) => {
          const PRE_VAT_AMOUNT = orderDetail.UNIT_PRICE * orderDetail.CBM * orderDetail.TOTAL_DAYS;
          const VAT_AMOUNT = PRE_VAT_AMOUNT * (orderDetail.VAT_RATE / 100);
          const TOTAL_AMOUNT = PRE_VAT_AMOUNT + VAT_AMOUNT;

          return {
            ...orderDetail,
            PRE_VAT_AMOUNT,
            VAT_AMOUNT,
            TOTAL_AMOUNT,
          };
        });

        // export:
        // payment PENDING -> PENDING
        // payment PAID -> PAID
        // all packages OUT_FOR_DELIVER -> COMPLETED, otherwise IN_PROGRESS
        // order status CANCELLED -> CANCELLED

        let ORDER_STATUS: CustomerOrderStatus = 'PENDING';

        if (payment.STATUS === 'PAID') {
          ORDER_STATUS = 'PAID';
        }

        const containerPackageIds = order.ORDER_DETAILS.map(
          (orderDetail: any) => orderDetail.VOYAGE_CONTAINER_PACKAGE_ID,
        );
        const filteredPackages = packages.filter(p => containerPackageIds.includes(p.ID));
        if (filteredPackages.every(p => p.STATUS === 'OUT_FOR_DELIVERY')) {
          ORDER_STATUS = 'COMPLETED';
        } else {
          ORDER_STATUS = 'IN_PROGRESS';
        }

        if (order.STATUS === 'CANCELLED') {
          ORDER_STATUS = 'CANCELLED';
        }

        return {
          ORDER: {
            ...order,
          },
          ORDER_TYPE: 'EXPORT',
          ORDER_STATUS,
          PAYMENT: payment,
        };
      }),
    );

    result = result.filter(payment => payment);

    if (status?.length > 0) {
      result = result.filter(payment => payment.ORDER_STATUS === status.toString());
    }
    if (orderId?.length > 0) {
      result = result.filter(payment => payment.ORDER.ID === orderId);
    }
    if (orderType?.length > 0) {
      result = result.filter(payment => payment.ORDER_TYPE === orderType);
    }

    // Sort by ORDER.UPDATED_AT from latest to oldest
    result.sort((a, b) => {
      return new Date(b.ORDER.UPDATED_AT).getTime() - new Date(a.ORDER.UPDATED_AT).getTime();
    });

    return result.filter(payment => payment);
  };
}

export default CustomerOrderService;
