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
import {
  findVoyageContainerPackageByContainerId,
  findVoyageContainerPackageById,
} from '../repositories/voyage-container-package.repo';
import { findVoyageContainer } from '../repositories/voyage-container.repo';
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
        ORDER_STATUS: order.STATUS,
        // PACKAGE_ID: order.DO_PACKAGE_ID,
        TOTAL_CBM: totalCbm,
        NOTE: order.NOTE,
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
        // INV_ID: order.INV_ID,
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
    // const order = await findOrderByOrderNo(orderNo);

    // if (!order) {
    //   throw new BadRequestError(ERROR_MESSAGE.ORDER_NOT_EXIST);
    // }
    // const orderDetails = await findOrderDetailsByOrderNo(orderNo);
    // let containerInfo: Container = await findContainer(order.CONTAINER_ID);

    // if (!containerInfo) {
    //   containerInfo = {
    //     CREATE_BY: '',
    //     CREATE_DATE: new Date(),
    //     UPDATE_BY: '',
    //     UPDATE_DATE: new Date(),
    //     ROWGUID: '',
    //     VOYAGEKEY: '',
    //     BILLOFLADING: '',
    //     SEALNO: '',
    //     CNTRNO: '',
    //     CNTRSZTP: '',
    //     STATUSOFGOOD: false,
    //     ITEM_TYPE_CODE: '',
    //     COMMODITYDESCRIPTION: '',
    //     CONSIGNEE: '',
    //   };
    // }
    // let customerInfo: Customer = await findCustomer(order.CUSTOMER_CODE);
    // if (!customerInfo) {
    //   customerInfo = {
    //     ID: '',
    //     USERNAME: '',
    //     CUSTOMER_TYPE: '',
    //     // ADDRESS: '',
    //     // EMAIL: '',
    //     TAX_CODE: '',
    //     // IS_ACTIVE: false,
    //     CREATED_BY: '',
    //     CREATED_AT: new Date(),
    //     UPDATED_BY: '',
    //     UPDATED_AT: new Date(),
    //   };
    // }
    // let packageInfo: Package = await findPackage(order.PACKAGE_ID);
    // if (!packageInfo) {
    //   packageInfo = {
    //     ROWGUID: '',
    //     HOUSE_BILL: '',
    //     ITEM_TYPE_CODE: '',
    //     PACKAGE_UNIT_CODE: '',
    //     CARGO_PIECE: 0,
    //     CBM: 0,
    //     DECLARE_NO: '',
    //     CONTAINER_ID: '',
    //     NOTE: '',
    //     ITEM_TYPE_CODE_CNTR: '',
    //     CUSTOMER_CODE: '',
    //     TIME_IN: new Date(),
    //     TIME_OUT: new Date(),
    //     CREATE_BY: '',
    //     CREATE_DATE: new Date(),
    //     UPDATE_BY: '',
    //     UPDATE_DATE: new Date(),
    //   };
    // }

    // return {
    //   DE_ORDER_NO: order.DE_ORDER_NO,
    //   CUSTOMER_CODE: order.CUSTOMER_CODE,
    //   CONTAINER_ID: order.CONTAINER_ID,
    //   PACKAGE_ID: order.PACKAGE_ID,
    //   INV_ID: order.INV_ID,
    //   ISSUE_DATE: order.ISSUE_DATE,
    //   EXP_DATE: order.EXP_DATE,
    //   TOTAL_CBM: order.TOTAL_CBM,
    //   JOB_CHK: order.JOB_CHK,
    //   NOTE: order.NOTE,
    //   orderDetails,
    //   containerInfo,
    //   customerInfo,
    //   packageInfo,
    // };
    return {};
  };
}

export default CustomerOrderService;
