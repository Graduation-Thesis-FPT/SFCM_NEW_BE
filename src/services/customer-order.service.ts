import { forEach } from 'lodash';
import { ERROR_MESSAGE } from '../constants';
import { BadRequestError } from '../core/error.response';
import { User } from '../entity/user.entity';
// import { Container } from '../models/container.model';
import { Customer } from '../models/customer.model';
import {
  DateRange,
  DeliverOrder,
  ExportedOrderStatus,
  ExtendedDeliveryOrder,
  ExtendedExportedOrder,
  ExtendedImportedOrder,
  ImportedOrderStatus,
} from '../models/deliver-order.model';
import { VoyageContainer } from '../models/voyage-container.model';
import {
  findExportedOrdersByStatus,
  findImportedOrdersByStatus,
} from '../repositories/customer-order.repo';
// import { Package } from '../models/packageMnfLd.model';
// import { findContainer } from '../repositories/container.repo';
import { findCustomer, findCustomerByUserName } from '../repositories/customer.repo';
import { findImportDetailByOrderId, findOrderByOrderId } from '../repositories/import-order.repo';
import {
  findPackageByVoyageContainerId,
  findVoyageContainerPackageByContainerId,
  findVoyageContainerPackageById,
} from '../repositories/voyage-container-package.repo';
import { findVoyageContainer } from '../repositories/voyage-container.repo';
import { VoyageContainerPackage } from '../models/voyage-container-package';
// import { findOrderDetailsByOrderNo } from '../repositories/order-detail.repo';

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
}

export default CustomerOrderService;
