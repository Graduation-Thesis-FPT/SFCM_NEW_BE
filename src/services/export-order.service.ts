import { EntityManager } from 'typeorm';
import { BadRequestError } from '../core/error.response';
import { User } from '../entity/user.entity';
import { exportOrderDetailRepository } from '../repositories/export-order-detail.repo';
import { exportOrderPaymentRepository } from '../repositories/export-order-payment.repo';
import {
  checkCanCalculateExportOrder,
  exportOrderRepository,
  getAllCustomerCanExportOrders,
  getExportOrderById,
  getExportOrderForDocById,
  getExportOrders,
  getPackageCanExportByConsigneeId,
} from '../repositories/export-order.repo';
import { manager } from '../repositories/index.repo';
import { getLatestValidPackageTariff } from '../repositories/package-tariff.repo';
import {
  checkAllPackageCellAllocationIsInCell,
  getVoyageContainerPackagesWithTariffs,
} from '../repositories/voyage-container-package.repo';
import { getDaysDifference } from '../utils/common';
import { genOrderNo } from '../utils/genKey';

class ExportOrderService {
  static calculateExportOrder = async (voyageContainerPackageIds: string[], pickupDate: string) => {
    if (!voyageContainerPackageIds || voyageContainerPackageIds.length === 0) {
      throw new BadRequestError('Kiện hàng không được để trống.');
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
      throw new BadRequestError('Không tìm thấy biểu cước phù hợp.');
    }

    for (const pk of packagesWithTariff) {
      const check = await checkAllPackageCellAllocationIsInCell(pk.ID);
      if (check) {
        throw new BadRequestError(
          'Kiện hàng của house bill ' + pk.HOUSE_BILL + ' chưa được xếp hết vào kho.',
        );
      }
      const checkCanCalculate = await checkCanCalculateExportOrder(pk.ID);
      if (checkCanCalculate) {
        throw new BadRequestError(checkCanCalculate.message);
      }
    }

    // Check if all pakages are of one consignee
    const consigneeIds = Array.from(new Set(packagesWithTariff.map(p => p.CONSIGNEE_ID)));
    if (consigneeIds.length > 1) {
      throw new BadRequestError('Tất cả kiện hàng phải thuộc cùng một chủ hàng.');
    }

    const PRE_VAT_AMOUNT = packagesWithTariff.reduce(
      (total, current) =>
        total +
        current.CBM *
          getDaysDifference(new Date(current.TIME_IN), new Date(pickupDate)) *
          current.UNIT_PRICE,
      0,
    );
    const VAT_AMOUNT = packagesWithTariff.reduce(
      (total, current) =>
        total +
        current.CBM *
          getDaysDifference(new Date(current.TIME_IN), new Date(pickupDate)) *
          current.UNIT_PRICE *
          (current.VAT_RATE / 100),
      0,
    );
    const TOTAL_AMOUNT = PRE_VAT_AMOUNT + VAT_AMOUNT;

    const billInfo = {
      PACKAGE_TARIFF_ID: packageTariff.ID,
      PICKUP_DATE: pickupDate,
      PRE_VAT_AMOUNT,
      VAT_AMOUNT,
      TOTAL_AMOUNT,
      EXPORT_ORDER_DETAILS: packagesWithTariff.map(p => {
        const TOTAL_DAYS = getDaysDifference(new Date(p.TIME_IN), new Date(pickupDate));
        const PRE_VAT_AMOUNT = p.CBM * TOTAL_DAYS * p.UNIT_PRICE;
        const VAT_AMOUNT = PRE_VAT_AMOUNT * (p.VAT_RATE / 100);
        const TOTAL_AMOUNT = PRE_VAT_AMOUNT + VAT_AMOUNT;

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
          PRE_VAT_AMOUNT,
          VAT_AMOUNT,
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

    const IDNo = await genOrderNo('');
    // Create exportOrderPayment
    const exportOrderPayment = await exportOrderPaymentRepository.create({
      ID: `EPM${IDNo}`,
      PRE_VAT_AMOUNT,
      VAT_AMOUNT,
      TOTAL_AMOUNT,
      STATUS: 'PENDING',
      CREATED_BY: creator.USERNAME,
      UPDATED_BY: creator.USERNAME,
    });
    // Create exportOrder
    const exportOrder = await exportOrderRepository.create({
      ID: `XK${IDNo}`,
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
