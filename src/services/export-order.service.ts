import { EntityManager } from 'typeorm';
import { BadRequestError } from '../core/error.response';
import { User } from '../entity/user.entity';
import { exportOrderDetailRepository } from '../repositories/export-order-detail.repo';
import { exportOrderPaymentRepository } from '../repositories/export-order-payment.repo';
import {
  exportOrderRepository,
  getAllCustomerCanExportOrders,
  getExportOrderById,
  getExportOrderForDocById,
  getExportOrders,
  getPackageCanExportByConsigneeId,
} from '../repositories/export-order.repo';
import { manager } from '../repositories/index.repo';
import { getLatestValidPackageTariff } from '../repositories/package-tariff.repo';
import { getVoyageContainerPackagesWithTariffs } from '../repositories/voyage-container-package.repo';
import { generateId, getDaysDifference } from '../utils/common';

class ExportOrderService {
  static calculateExportOrder = async (voyageContainerPackageIds: string[], pickupDate: string) => {
    if (!voyageContainerPackageIds || voyageContainerPackageIds.length === 0) {
      throw new BadRequestError('Voyage container package ids are required.');
    }
    const packageTariff = await getLatestValidPackageTariff();
    const packagesWithTariff = await getVoyageContainerPackagesWithTariffs(
      voyageContainerPackageIds,
      packageTariff.ID,
    );
    // Check if length of packagesWithTariff is equal to voyageContainerPackageIds
    if (packagesWithTariff.length !== voyageContainerPackageIds.length) {
      console.log(packagesWithTariff);
      console.log(voyageContainerPackageIds);
      throw new BadRequestError('Some packages do not have a valid tariff or are not found.');
    }

    // Check if all pakages are of one consignee
    const consigneeIds = Array.from(new Set(packagesWithTariff.map(p => p.CONSIGNEE_ID)));
    if (consigneeIds.length > 1) {
      throw new BadRequestError('All packages must belong to the same consignee.');
    }

    const billInfo = {
      PACKAGE_TARIFF_ID: packageTariff.ID,
      PICKUP_DATE: pickupDate,
      PRE_VAT_AMOUNT: packagesWithTariff.reduce(
        (total, current) =>
          total +
          current.CBM *
            getDaysDifference(new Date(current.TIME_IN), new Date(pickupDate)) *
            current.UNIT_PRICE *
            (1 - current.VAT_RATE / 100),
        0,
      ),
      VAT_AMOUNT: packagesWithTariff.reduce(
        (total, current) =>
          total +
          current.CBM *
            getDaysDifference(new Date(current.TIME_IN), new Date(pickupDate)) *
            current.UNIT_PRICE *
            (current.VAT_RATE / 100),
        0,
      ),
      TOTAL_AMOUNT: packagesWithTariff.reduce(
        (total, current) =>
          total +
          current.CBM *
            getDaysDifference(new Date(current.TIME_IN), new Date(pickupDate)) *
            current.UNIT_PRICE,
        0,
      ),
      EXPORT_ORDER_DETAILS: packagesWithTariff.map(p => {
        const TOTAL_DAYS = getDaysDifference(new Date(p.TIME_IN), new Date(pickupDate));
        const TOTAL_AMOUNT = p.CBM * TOTAL_DAYS * p.UNIT_PRICE;

        return {
          PACKAGE_ID: p.ID,
          PACKAGE_TYPE_ID: p.PACKAGE_TYPE_ID,
          HOUSE_BILL: p.HOUSE_BILL,
          CBM: p.CBM,
          UNIT_PRICE: p.UNIT_PRICE,
          VAT_RATE: p.VAT_RATE,
          TIME_IN: p.TIME_IN,
          PACKAGE_TARIFF_DETAIL_ID: p.PACKAGE_TARIFF_DETAIL_ID,
          PACKAGE_TARIFF_DESCRIPTION: p.PACKAGE_TARIFF_DESCRIPTION,
          TOTAL_DAYS,
          PRE_VAT_AMOUNT: TOTAL_AMOUNT * (1 - p.VAT_RATE / 100),
          VAT_AMOUNT: TOTAL_AMOUNT * (p.VAT_RATE / 100),
          TOTAL_AMOUNT,
        };
      }),
    };

    return billInfo;
  };

  static createExportOrder = async (
    data: {
      NOTE: string;
      PACKAGE_TARIFF_ID: string;
      PICKUP_DATE: Date;
      PRE_VAT_AMOUNT: number;
      VAT_AMOUNT: number;
      TOTAL_AMOUNT: number;
      EXPORT_ORDER_DETAILS: {
        PACKAGE_ID: string;
        HOUSE_BILL: string;
        CBM: number;
        UNIT_PRICE: number;
        VAT_RATE: number;
        TIME_IN: Date;
        PACKAGE_TARIFF_DETAIL_ID: string;
        PRE_VAT_AMOUNT: number;
        VAT_AMOUNT: number;
        TOTAL_AMOUNT: number;
      }[];
    },
    creator: User,
  ) => {
    let {
      NOTE,
      PACKAGE_TARIFF_ID,
      PICKUP_DATE,
      PRE_VAT_AMOUNT,
      VAT_AMOUNT,
      TOTAL_AMOUNT,
      EXPORT_ORDER_DETAILS,
    } = data;

    if (!PICKUP_DATE) {
      PICKUP_DATE = new Date();
    }

    // Create exportOrderPayment
    const exportOrderPayment = await exportOrderPaymentRepository.create({
      ID: generateId('TTXK'),
      PRE_VAT_AMOUNT,
      VAT_AMOUNT,
      TOTAL_AMOUNT,
      STATUS: 'PENDING',
      CREATED_BY: creator.USERNAME,
      UPDATED_BY: creator.USERNAME,
    });

    // Create exportOrder
    const exportOrder = await exportOrderRepository.create({
      ID: generateId('XK'),
      PAYMENT_ID: exportOrderPayment.ID,
      PACKAGE_TARIFF_ID,
      PICKUP_DATE,
      NOTE,
      CAN_CANCEL: true,
      STATUS: 'COMPLETED',
      CREATED_BY: creator.USERNAME,
      UPDATED_BY: creator.USERNAME,
    });

    // Create exportOrderDetails
    const exportOrderDetails = await exportOrderDetailRepository.create(
      EXPORT_ORDER_DETAILS.map(d => ({
        ORDER_ID: exportOrder.ID,
        VOYAGE_CONTAINER_PACKAGE_ID: d.PACKAGE_ID,
        CBM: d.CBM,
        TOTAL_DAYS: getDaysDifference(new Date(d.TIME_IN), new Date(PICKUP_DATE)),
        CREATED_BY: creator.USERNAME,
        UPDATED_BY: creator.USERNAME,
      })),
    );

    await manager.transaction(async (transactionalEntityManager: EntityManager) => {
      await transactionalEntityManager.save(exportOrderPayment);
      await transactionalEntityManager.save(exportOrder);
      await transactionalEntityManager.save(exportOrderDetails);
    });

    return exportOrder;
  };

  static getExportOrder = async (id: string) => {
    return await getExportOrderById(id);
  };

  static getExportOrders = async ({
    consigneeId,
    from,
    to,
  }: {
    consigneeId?: string;
    from?: string;
    to?: string;
  }) => {
    const exportOrders = await getExportOrders({
      consigneeId,
      from,
      to,
    });
    return exportOrders;
  };

  static getAllCustomerCanExportOrders = async () => {
    return await getAllCustomerCanExportOrders();
  };

  static getPackageCanExportByConsigneeId = async (consigneeId: string) => {
    return await getPackageCanExportByConsigneeId(consigneeId);
  };

  static getExportOrderForDocById = async (id: string) => {
    return await getExportOrderForDocById(id);
  };
}
export default ExportOrderService;
