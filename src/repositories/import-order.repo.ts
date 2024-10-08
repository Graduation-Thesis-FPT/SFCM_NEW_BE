import { Between, Brackets, EntityManager } from 'typeorm';
import mssqlConnection from '../dbs/mssql.connect';
import { ContainerTariff } from '../entity/container-tariff.entity';
import { Customer as CustomerEntity } from '../entity/customer.entity';
import { ExportOrderPaymentEntity } from '../entity/export-order-payment.entity';
import { ImportOrderDetail as ImportOrderDetailEntity } from '../entity/import-order-dtl.entity';
import { ImportOrderPayment as ImportOrderPaymentEntity } from '../entity/import-order-payment.entity';
import { ImportOrder as ImportOrderEntity } from '../entity/import-order.entity';
import { VoyageContainerEntity } from '../entity/voyage-container.entity';
import { ImportOrder, ImportOrderDetail } from '../models/import-order.model';
import { ImportOrderPayment } from '../models/import-payment.model';
import { ExportOrderEntity } from '../entity/export-order.entity';
import { VoyageEntity } from '../entity/voyage.entity';
import { User } from '../entity/user.entity';

export const exportOrderRepository = mssqlConnection.getRepository(ExportOrderEntity);
export const exportOrderPaymentRepository = mssqlConnection.getRepository(ExportOrderPaymentEntity);
export const importOrderPaymentEntityRepository =
  mssqlConnection.getRepository(ImportOrderPaymentEntity);
export const importOrderRepository = mssqlConnection.getRepository(ImportOrderEntity);
export const importOrderDtlEntityRepository =
  mssqlConnection.getRepository(ImportOrderDetailEntity);

export const customerRepository = mssqlConnection.getRepository(CustomerEntity);
export const voyageContainerRepository = mssqlConnection.getRepository(VoyageContainerEntity);
export const contTariffRepository = mssqlConnection.getRepository(ContainerTariff);
export const voyageRepository = mssqlConnection.getRepository(VoyageEntity);

export const getImportOrderForDocById = async (id: string) => {
  return await importOrderRepository
    .createQueryBuilder('io')
    .leftJoinAndSelect('IMPORT_ORDER_DETAIL', 'iod', 'io.ID = iod.ORDER_ID')
    .innerJoinAndSelect('VOYAGE_CONTAINER', 'cont', 'cont.ID = iod.VOYAGE_CONTAINER_ID')
    .innerJoinAndSelect('VOYAGE', 'voy', 'cont.VOYAGE_ID = voy.ID')
    .innerJoinAndSelect('CUSTOMER', 'cus', 'cont.SHIPPER_ID = cus.ID')
    .innerJoinAndSelect('USER', 'us', 'cus.USERNAME = us.USERNAME')
    .select([
      'voy.VESSEL_NAME as VESSEL_NAME',
      'voy.ETA as ETA',
      'io.ID AS ID',
      'io.PAYMENT_ID AS PAYMENT_ID',
      'iod.CONTAINER_TARIFF_ID AS CONTAINER_TARIFF_ID',
      'io.NOTE AS NOTE',
      'io.STATUS AS STATUS',
      'cont.CNTR_NO AS CNTR_NO',
      'cont.CNTR_SIZE AS CNTR_SIZE',
      'cont.SEAL_NO AS SEAL_NO',
      'cont.NOTE AS cntr_NOTE',
      'cus.TAX_CODE AS TAX_CODE',
      'us.USERNAME AS EMAIL',
      'us.FULLNAME AS FULLNAME',
      'us.ADDRESS AS ADDRESS',
      'us.TELEPHONE AS TELEPHONE',
    ])
    .where('io.ID = :id', { id: id })
    .getRawMany();
};

export const checkCanCalculateImport = async (contID: string) => {
  return await voyageRepository
    .createQueryBuilder('voy')
    .select(
      "CASE WHEN pay.STATUS = 'PENDING' THEN CONCAT(N'Container ', cont.CNTR_NO, N' đang chờ xác nhận thanh toán')" +
        "WHEN pay.STATUS = 'PAID' THEN CONCAT(N'Container ', cont.CNTR_NO, N' đã làm lệnh') END",
      'message',
    )
    .innerJoin('VOYAGE_CONTAINER', 'cont', 'cont.VOYAGE_ID = voy.ID')
    .innerJoin('IMPORT_ORDER_DETAIL', 'iod', 'iod.VOYAGE_CONTAINER_ID = cont.ID')
    .innerJoin('IMPORT_ORDER', 'io', 'io.ID = iod.ORDER_ID')
    .innerJoin('IMPORT_ORDER_PAYMENT', 'pay', 'pay.ID = io.PAYMENT_ID')
    .where('cont.ID = :contID', { contID: contID })
    .andWhere('pay.STATUS != :payStatus', { payStatus: 'CANCELLED' })
    .andWhere('io.STATUS = :ioStatus', { ioStatus: 'COMPLETED' })
    .getRawOne();
};

export const getAllVoyageWithCustomerCanImportOrder = async () => {
  return await voyageContainerRepository
    .createQueryBuilder('cont')
    .leftJoin('IMPORT_ORDER_DETAIL', 'ipd', 'cont.ID = ipd.VOYAGE_CONTAINER_ID')
    .leftJoin('IMPORT_ORDER', 'ip', 'ip.ID = ipd.ORDER_ID')
    .leftJoin('IMPORT_ORDER_PAYMENT', 'ipm', 'ipm.ID = ip.PAYMENT_ID')
    .select([
      'voy.ID AS ID',
      'voy.VESSEL_NAME AS VESSEL_NAME',
      'voy.ETA AS ETA',
      'cont.SHIPPER_ID AS SHIPPER_ID',
      'us.FULLNAME AS FULLNAME',
      'cus.TAX_CODE AS TAX_CODE',
      'COUNT(DISTINCT cont.ID) AS num_of_cont_can_import',
      'us.EMAIL AS EMAIL',
      'us.ADDRESS AS ADDRESS',
    ])
    .innerJoin('VOYAGE_CONTAINER_PACKAGE', 'pk', 'pk.VOYAGE_CONTAINER_ID = cont.ID')
    .innerJoin('VOYAGE', 'voy', 'voy.ID = cont.VOYAGE_ID')
    .leftJoin('CUSTOMER', 'cus', 'cus.ID = cont.SHIPPER_ID')
    .leftJoin('USER', 'us', 'us.USERNAME = cus.USERNAME')
    .where('cont.STATUS = :status', { status: 'PENDING' })
    .andWhere('cus.CUSTOMER_TYPE = :type', { type: 'SHIPPER' })
    .andWhere('pk.STATUS = :pkStatus', { pkStatus: 'IN_CONTAINER' })
    .andWhere(
      new Brackets(qb => {
        qb.where('ipm.STATUS = :statusCancelled', { statusCancelled: 'CANCELLED' }).orWhere(
          'ipm.STATUS IS NULL',
        );
      }),
    )
    .groupBy('voy.ID')
    .addGroupBy('voy.VESSEL_NAME')
    .addGroupBy('voy.ETA')
    .addGroupBy('cont.SHIPPER_ID')
    .addGroupBy('us.FULLNAME')
    .addGroupBy('cus.TAX_CODE')
    .addGroupBy('us.EMAIL')
    .addGroupBy('us.ADDRESS')
    .getRawMany();
};

const loadImportVesselAnhCustomer = async () => {
  const vesselList = await voyageContainerRepository
    .createQueryBuilder('cont')
    .select([
      'voy.ID AS ID',
      'voy.VESSEL_NAME AS VESSEL_NAME',
      'voy.ETA AS ETA',
      'cont.SHIPPER_ID AS SHIPPER_ID',
      'us.FULLNAME AS FULLNAME',
      'cus.TAX_CODE AS TAX_CODE',
      'COUNT(voy.ID) AS num_of_cont_can_import',
    ])
    .innerJoin('VOYAGE', 'voy', 'voy.ID = cont.VOYAGE_ID')
    .leftJoin('CUSTOMER', 'cus', 'cus.ID = cont.SHIPPER_ID')
    .leftJoin('USER', 'us', 'us.USERNAME = cus.USERNAME')
    .where('cont.STATUS = :status', { status: 'PENDING' })
    .groupBy('voy.ID')
    .addGroupBy('voy.VESSEL_NAME')
    .addGroupBy('voy.ETA')
    .addGroupBy('cont.SHIPPER_ID')
    .addGroupBy('us.FULLNAME')
    .addGroupBy('cus.TAX_CODE')
    .getRawMany();

  const customerList = await customerRepository
    .createQueryBuilder('cus')
    .leftJoin('VOYAGE_CONTAINER', 'cnt', 'cnt.SHIPPER_ID = cus.ID')
    .leftJoin('VOYAGE', 'voy', 'voy.ID = cnt.VOYAGE_ID')
    .leftJoin('USER', 'us', 'us.USERNAME = cus.USERNAME')
    .where('cnt.STATUS = :status', { status: 'PENDING' })
    .select(['cus.ID as ID, us.FULLNAME as FULLNAME'])
    .groupBy('cus.ID')
    .addGroupBy('us.FULLNAME')
    .getRawMany();
  return {
    vesselList: vesselList,
    customerList: customerList,
  };
};

export type ContainerImLoad = {
  VOYAGE_ID: string;
  SHIPPER_ID: string;
};
const loadImportContainer = async (whereObj: ContainerImLoad) => {
  return await voyageContainerRepository
    .createQueryBuilder('cn')
    .leftJoin('VOYAGE_CONTAINER_PACKAGE', 'pk', 'pk.VOYAGE_CONTAINER_ID = cn.ID')
    .leftJoin('IMPORT_ORDER_DETAIL', 'ipd', 'cn.ID = ipd.VOYAGE_CONTAINER_ID')
    .leftJoin('IMPORT_ORDER', 'ip', 'ip.ID = ipd.ORDER_ID')
    .leftJoin('IMPORT_ORDER_PAYMENT', 'ipm', 'ipm.ID = ip.PAYMENT_ID')
    .select([
      'cn.ID as ID',
      'cn.VOYAGE_ID as VOYAGE_ID',
      'cn.CNTR_NO as CNTR_NO',
      'cn.SHIPPER_ID as SHIPPER_ID',
      'cn.CNTR_SIZE as CNTR_SIZE',
      'cn.SEAL_NO as SEAL_NO',
      'cn.STATUS as STATUS',
      'cn.NOTE as NOTE',
    ])
    .where('cn.VOYAGE_ID = :voyage', { voyage: whereObj.VOYAGE_ID })
    .andWhere('cn.SHIPPER_ID = :shipper', { shipper: whereObj.SHIPPER_ID })
    .andWhere(
      new Brackets(qb => {
        qb.where('ipm.STATUS = :statusCancelled', { statusCancelled: 'CANCELLED' }).orWhere(
          'ipm.STATUS IS NULL',
        );
      }),
    )
    .andWhere('cn.STATUS = :status', { status: 'PENDING' })
    .andWhere('pk.VOYAGE_CONTAINER_ID IS NOT NULL')
    .groupBy('cn.ID')
    .addGroupBy('cn.VOYAGE_ID')
    .addGroupBy('cn.CNTR_NO')
    .addGroupBy('cn.SHIPPER_ID')
    .addGroupBy('cn.CNTR_SIZE')
    .addGroupBy('cn.SEAL_NO')
    .addGroupBy('cn.STATUS')
    .addGroupBy('cn.NOTE')
    .getRawMany();
};

const loadContInfoByID = async (arrayContID: string[]) => {
  return await voyageContainerRepository
    .createQueryBuilder()
    .where('ID IN (:...ids)', { ids: arrayContID })
    .getMany();
};

const getContainerTariff = async (whereObj: object) => {
  const tariffInfo = await contTariffRepository.find({ where: whereObj }).then(data => {
    let current = new Date();
    data = data.filter(item => {
      return current >= item.VALID_FROM && current <= item.VALID_UNTIL;
    });
    if (data.length == 1) {
      return data[0];
    } else {
      return null;
    }
  });
  return tariffInfo;
};

export const getContainerTariffV2 = async (whereObj: object) => {
  const currentDate = new Date();

  const results = await contTariffRepository
    .createQueryBuilder('tariff')
    .where('tariff.VALID_FROM <= :currentDate', { currentDate })
    .andWhere('tariff.VALID_UNTIL >= :currentDate', { currentDate })
    .andWhere(whereObj)
    .getOne();

  return results;
};

const findMaxOrderNo = async () => {
  const maxLastFourDigits = await importOrderRepository
    .createQueryBuilder('order')
    .select('MAX(CAST(RIGHT(order.ID, 4) AS INT))', 'lastThreeDigits')
    .where('MONTH(order.CREATED_AT) = MONTH(GETDATE())')
    .getRawOne();
  return maxLastFourDigits;
};

const saveImportPayment = async (
  paymentInfo: ImportOrderPayment,
  transactionEntityManager: EntityManager,
) => {
  const savepaymentInfo = importOrderPaymentEntityRepository.create(paymentInfo);
  return await transactionEntityManager.save(savepaymentInfo);
};
const saveImportOrder = async (
  importOrderInfo: ImportOrder,
  transactionEntityManager: EntityManager,
) => {
  const saveImportOrder = importOrderRepository.create(importOrderInfo);
  return await transactionEntityManager.save(saveImportOrder);
};
const saveImportOrderDtl = async (
  importOrderDtlInfo: ImportOrderDetail[],
  transactionEntityManager: EntityManager,
) => {
  const saveImportOrderDtl = importOrderDtlEntityRepository.create(importOrderDtlInfo);
  return await transactionEntityManager.save(saveImportOrderDtl);
};
const updateVoyageContainer = async (
  arrayContID: string[],
  transactionEntityManager: EntityManager,
) => {
  return await Promise.all(
    arrayContID.map(contID =>
      transactionEntityManager.update(VoyageContainerEntity, contID, { STATUS: 'IMPORTED' }),
    ),
  );
};

export type wherePaymentObj = {
  STATUS?: '' | 'PENDING' | 'PAID' | 'CANCELLED';
  fromDate?: Date;
  toDate?: Date;
};
const loadPaymentComplete = async (whereObj: wherePaymentObj) => {
  let filterObj: any = {};
  if (whereObj?.fromDate && whereObj?.toDate) {
    filterObj = { CREATED_AT: Between(whereObj?.fromDate, whereObj?.toDate) };
  }
  if (whereObj.STATUS) {
    filterObj['STATUS'] = whereObj.STATUS;
  }
  let importPaymentdata = await importOrderPaymentEntityRepository.find({
    where: filterObj,
    order: {
      CREATED_AT: 'DESC',
    },
  });
  let exportPaymentdata = await exportOrderPaymentRepository.find({
    where: filterObj,
    order: {
      CREATED_AT: 'DESC',
    },
  });
  return {
    importPaymentdata: importPaymentdata,
    exportPaymentdata: exportPaymentdata,
  };
};

export type wherePaymentCompleteObj = {
  TYPE: 'NK' | 'XK';
  ID: string;
};
const paymentComplete = async (whereObj: wherePaymentCompleteObj, createBy: User) => {
  if (whereObj.TYPE == 'NK') {
    await importOrderPaymentEntityRepository.update(
      { ID: whereObj.ID },
      { STATUS: 'PAID', UPDATED_AT: new Date(), UPDATED_BY: createBy.USERNAME },
    );
    let arrayContainerID = await importOrderPaymentEntityRepository
      .createQueryBuilder('ipm')
      .leftJoin('IMPORT_ORDER', 'ip', 'ip.PAYMENT_ID = ipm.ID')
      .leftJoin('IMPORT_ORDER_DETAIL', 'ipd', 'ipd.ORDER_ID = ip.ID')
      .where('ipm.ID = :idpayment', { idpayment: whereObj.ID })
      .select(['ipd.VOYAGE_CONTAINER_ID as VOYAGE_CONTAINER_ID'])
      .groupBy('ipd.VOYAGE_CONTAINER_ID')
      .getRawMany();

    await Promise.all(
      arrayContainerID.map(contID =>
        voyageContainerRepository.update(contID.VOYAGE_CONTAINER_ID, { STATUS: 'IMPORTED' }),
      ),
    );
  } else {
    await exportOrderPaymentRepository.update(
      { ID: whereObj.ID },
      { STATUS: 'PAID', UPDATED_AT: new Date(), UPDATED_BY: createBy.USERNAME },
    );
  }
  return {};
};

export type filterCancelOrder = {
  fromDate?: Date;
  toDate?: Date;
  CUSTOMER_ID?: string;
  ORDER_ID?: string;
  TYPE: 'NK' | 'XK';
};
const loadCancelOrder = async (whereObj: filterCancelOrder) => {
  let filterObj: any = {};
  if (whereObj?.fromDate && whereObj?.toDate) {
    filterObj = { CREATED_AT: Between(whereObj?.fromDate, whereObj?.toDate) };
  }
  let query;
  if (whereObj.TYPE == 'NK') {
    query = importOrderPaymentEntityRepository
      .createQueryBuilder('pay')
      .innerJoin('IMPORT_ORDER', 'io', 'pay.ID = io.PAYMENT_ID')
      .leftJoin('IMPORT_ORDER_DETAIL', 'iod', 'io.ID = iod.ORDER_ID')
      .innerJoin('VOYAGE_CONTAINER', 'cont', 'cont.ID = iod.VOYAGE_CONTAINER_ID')
      .innerJoin('CUSTOMER', 'cus', 'cont.SHIPPER_ID = cus.ID')
      .innerJoin('USER', 'us', 'cus.USERNAME = us.USERNAME')
      .where(filterObj)
      .select([
        "'NK' as TYPE",
        'io.ID as order_ID',
        'io.STATUS as order_STATUS',
        'pay.ID as pay_ID',
        'pay.STATUS as pay_STATUS',
        'pay.CANCEL_DATE as CANCEL_DATE',
        'pay.CANCEL_REMARK as CANCEL_REMARK',
        'io.NOTE as order_NOTE',
        'cus.ID as cus_ID',
        'cus.USERNAME as EMAIL',
        'cus.TAX_CODE as TAX_CODE',
        'us.FULLNAME as FULLNAME',
        'us.ADDRESS as ADDRESS',
        'io.CREATED_AT as CREATED_AT',
      ])
      .orderBy('io.CREATED_AT', 'DESC')
      .groupBy('io.ID')
      .addGroupBy('io.STATUS')
      .addGroupBy('pay.STATUS')
      .addGroupBy('pay.ID')
      .addGroupBy('pay.CANCEL_DATE')
      .addGroupBy('pay.CANCEL_REMARK')
      .addGroupBy('io.NOTE')
      .addGroupBy('cus.ID')
      .addGroupBy('cus.USERNAME')
      .addGroupBy('cus.TAX_CODE')
      .addGroupBy('us.FULLNAME')
      .addGroupBy('us.ADDRESS')
      .addGroupBy('io.CREATED_AT');
    if (whereObj.CUSTOMER_ID) {
      query = query.andWhere('cus.ID = :customerID', { customerID: whereObj.CUSTOMER_ID });
    }
    if (whereObj.ORDER_ID) {
      query = query.andWhere('LOWER(io.ID) LIKE LOWER(:orderID)', {
        orderID: `%${whereObj.ORDER_ID}%`,
      });
    }
  } else {
    query = exportOrderRepository
      .createQueryBuilder('eo')
      .leftJoin('EXPORT_ORDER_PAYMENT', 'pay', 'eo.PAYMENT_ID= pay.ID')
      .leftJoin('EXPORT_ORDER_DETAIL', 'eod', 'eo.ID = eod.ORDER_ID')
      .leftJoin('VOYAGE_CONTAINER_PACKAGE', 'pk', 'eod.VOYAGE_CONTAINER_PACKAGE_ID = pk.ID')
      .innerJoin('CUSTOMER', 'cus', 'pk.CONSIGNEE_ID = cus.ID')
      .innerJoin('USER', 'us', 'cus.USERNAME = us.USERNAME')
      .where(filterObj)
      .select([
        "'XK' as TYPE",
        'eo.ID as order_ID',
        'eo.STATUS as order_STATUS',
        'pay.ID as pay_ID',
        'pay.STATUS as pay_STATUS',
        'pay.CANCEL_DATE as CANCEL_DATE',
        'pay.CANCEL_REMARK as CANCEL_REMARK',
        'eo.NOTE as order_NOTE',
        'cus.ID as cus_ID',
        'cus.USERNAME as EMAIL',
        'cus.TAX_CODE as TAX_CODE',
        'us.FULLNAME as FULLNAME',
        'us.ADDRESS as ADDRESS',
        'eo.CREATED_AT as CREATED_AT',
      ])
      .orderBy('eo.CREATED_AT', 'DESC')
      .groupBy('eo.ID')
      .addGroupBy('eo.STATUS')
      .addGroupBy('pay.ID')
      .addGroupBy('pay.STATUS')
      .addGroupBy('pay.CANCEL_DATE')
      .addGroupBy('pay.CANCEL_REMARK')
      .addGroupBy('eo.NOTE')
      .addGroupBy('cus.ID')
      .addGroupBy('cus.USERNAME')
      .addGroupBy('cus.TAX_CODE')
      .addGroupBy('us.FULLNAME')
      .addGroupBy('us.ADDRESS')
      .addGroupBy('eo.CREATED_AT');
    if (whereObj.CUSTOMER_ID) {
      query = query.andWhere('cus.ID = :customerID', { customerID: whereObj.CUSTOMER_ID });
    }
    if (whereObj.ORDER_ID) {
      query = query.andWhere('LOWER(io.ID) LIKE LOWER(:orderID)', {
        orderID: `%${whereObj.ORDER_ID}%`,
      });
    }
  }
  return await query.getRawMany();
};

export const checkImportPaymentIsPaid = async (paymentID: string) => {
  return await importOrderPaymentEntityRepository.findOne({
    where: { ID: paymentID, STATUS: 'PAID' },
  });
};

export const checkExportPaymentIsPaid = async (paymentID: string) => {
  return await exportOrderPaymentRepository.findOne({
    where: { ID: paymentID, STATUS: 'PAID' },
  });
};

export type whereCancelObj = {
  TYPE: 'NK' | 'XK';
  orderID: string;
  paymentID: string;
  Note: string;
};
const cancelOrder = async (whereObj: whereCancelObj) => {
  if (whereObj.TYPE == 'NK') {
    await importOrderPaymentEntityRepository.update(
      { ID: whereObj.paymentID },
      { STATUS: 'CANCELLED', CANCEL_REMARK: whereObj.Note, CANCEL_DATE: new Date() },
    );
    await importOrderRepository.update(
      { ID: whereObj.orderID },
      { STATUS: 'CANCELLED', CANCEL_NOTE: whereObj.Note },
    );
  } else {
    await exportOrderPaymentRepository.update(
      { ID: whereObj.paymentID },
      { STATUS: 'CANCELLED', CANCEL_REMARK: whereObj.Note, CANCEL_DATE: new Date() },
    );
    await exportOrderRepository.update(
      { ID: whereObj.orderID },
      { STATUS: 'CANCELLED', CANCEL_NOTE: whereObj.Note },
    );
  }
  return {};
};
export const getImportOrders = async ({
  shipperId,
  from,
  to,
}: {
  shipperId?: string;
  from?: string;
  to?: string;
}) => {
  const query = importOrderRepository
    .createQueryBuilder('io')
    .select([
      'io.ID AS ID',
      'io.PAYMENT_ID AS PAYMENT_ID',
      'io.NOTE AS NOTE',
      'io.CAN_CANCEL AS CAN_CANCEL',
      'io.STATUS AS STATUS',
      'io.CANCEL_NOTE AS CANCEL_NOTE',
      'io.CREATED_BY AS CREATED_BY',
      'io.CREATED_AT AS CREATED_AT',
      'io.UPDATED_BY AS UPDATED_BY',
      'io.UPDATED_AT AS UPDATED_AT',
    ]);

  if (shipperId) {
    query
      .innerJoin('IMPORT_ORDER_DETAIL', 'iod', 'io.ID = iod.ORDER_ID')
      .innerJoin('VOYAGE_CONTAINER', 'vc', 'iod.VOYAGE_CONTAINER_ID = vc.ID')
      .where('vc.SHIPPER_ID = :shipperId', { shipperId });
  }

  if (from) {
    query.andWhere('io.CREATED_AT >= :from', {
      from: new Date(from),
    });
  }

  if (to) {
    query.andWhere('io.CREATED_AT <= :to', {
      to: new Date(to),
    });
  }
  const importOrders = await query.getRawMany();
  const importOrderDetails = await importOrderDtlEntityRepository
    .createQueryBuilder('iod')
    .select([
      'iod.ROWGUID AS ROWGUID',
      'iod.ORDER_ID AS ORDER_ID',
      'iod.VOYAGE_CONTAINER_ID AS VOYAGE_CONTAINER_ID',
      'iod.CONTAINER_TARIFF_ID AS CONTAINER_TARIFF_ID',
      'iod.NOTE AS NOTE',
      'iod.CREATED_BY AS CREATED_BY',
      'iod.CREATED_AT AS CREATED_AT',
      'iod.UPDATED_BY AS UPDATED_BY',
      'iod.UPDATED_AT AS UPDATED_AT',
      'cus.ID AS CUSTOMER_ID',
      'us.USERNAME AS USERNAME',
      'vc.CNTR_SIZE AS CNTR_SIZE',
      'ct.UNIT_PRICE AS UNIT_PRICE',
      'ct.VAT_RATE AS VAT_RATE',
    ])
    .leftJoin('VOYAGE_CONTAINER', 'vc', 'iod.VOYAGE_CONTAINER_ID = vc.ID')
    .innerJoin('CUSTOMER', 'cus', 'cus.ID = vc.SHIPPER_ID')
    .innerJoin('USER', 'us', 'us.USERNAME = cus.USERNAME')
    .leftJoin('CONTAINER_TARIFF', 'ct', 'ct.CNTR_SIZE = vc.CNTR_SIZE')
    .getRawMany();

  importOrders.forEach(order => {
    order.ORDER_DETAILS = importOrderDetails.filter(detail => detail.ORDER_ID === order.ID);
  });

  return importOrders;
};

export const findOrderById = async (orderId: string) => {
  const importOrder = await importOrderRepository
    .createQueryBuilder('io')
    .where('io.ID = :id', { id: orderId })
    .getRawOne();
  return importOrder;
};

export const findImportDetailByOrderId = async (orderId: string) => {
  const importOrderDetails = await importOrderDtlEntityRepository
    .createQueryBuilder('iod')
    .innerJoin('VOYAGE_CONTAINER', 'vc', 'iod.VOYAGE_CONTAINER_ID = vc.ID')
    .innerJoin('VOYAGE', 'v', 'vc.VOYAGE_ID = v.ID')
    .select([
      'iod.ROWGUID AS ROWGUID',
      'iod.ORDER_ID AS ORDER_ID',
      'iod.VOYAGE_CONTAINER_ID AS VOYAGE_CONTAINER_ID',
      'iod.CONTAINER_TARIFF_ID AS CONTAINER_TARIFF_ID',
      'iod.NOTE AS NOTE',
      'iod.CREATED_BY AS CREATED_BY',
      'iod.CREATED_AT AS CREATED_AT',
      'iod.UPDATED_BY AS UPDATED_BY',
      'iod.UPDATED_AT AS UPDATED_AT',
      'vc.CNTR_NO AS CNTR_NO',
      'vc.CNTR_SIZE AS CNTR_SIZE',
      'vc.SEAL_NO AS SEAL_NO',
      'v.VESSEL_NAME AS VESSEL_NAME',
      'v.ETA AS ETA',
    ])
    .where('iod.ORDER_ID = :orderId', { orderId })
    .getRawMany();
  return importOrderDetails;
};

const findOrderByOrderId = async (orderId: string) => {
  return await importOrderRepository
    .createQueryBuilder('io')
    .select([
      'io.ID AS ID',
      'io.PAYMENT_ID AS PAYMENT_ID',
      'io.NOTE AS NOTE',
      'io.CAN_CANCEL AS CAN_CANCEL',
      'io.STATUS AS STATUS',
      'io.CANCEL_NOTE AS CANCEL_NOTE',
      'io.CREATED_BY AS CREATED_BY',
      'io.CREATED_AT AS CREATED_AT',
      'io.UPDATED_BY AS UPDATED_BY',
      'io.UPDATED_AT AS UPDATED_AT',
    ])
    .where('io.ID = :orderId', { orderId })
    .getRawOne();
};

export type filterRpRevenue = {
  fromDate?: Date;
  toDate?: Date;
  TYPE: '' | 'NK' | 'XK';
  PAYMENT_ID?: string;
  CUSTOMER_ID?: string;
};
const reportRevenue = async (whereObj: filterRpRevenue) => {
  let importRpData = importOrderPaymentEntityRepository
    .createQueryBuilder('ipm')
    .leftJoin('IMPORT_ORDER', 'ip', 'ip.PAYMENT_ID = ipm.ID')
    .leftJoin('IMPORT_ORDER_DETAIL', 'ipd', 'ip.ID = ipd.ORDER_ID')
    .leftJoin('VOYAGE_CONTAINER', 'cn', 'cn.ID = ipd.VOYAGE_CONTAINER_ID')
    .leftJoin('CUSTOMER', 'cus', 'cus.ID = cn.SHIPPER_ID')
    .leftJoin('USER', 'users', 'users.USERNAME = cus.USERNAME')
    .select([
      'ip.ID as order_ID',
      "'NK' as TYPE",
      'ipm.ID as ID',
      'ipm.PRE_VAT_AMOUNT as PRE_VAT_AMOUNT',
      'ipm.VAT_AMOUNT as VAT_AMOUNT',
      'ipm.TOTAL_AMOUNT as TOTAL_AMOUNT',
      'ipm.UPDATED_AT AS DatePayment',
      'users.FULLNAME as FULLNAME',
      'cus.ID as CUSTOMER_ID',
      'ipm.UPDATED_BY AS cashier',
      'ipm.STATUS as STATUS',
    ])
    .where('ipm.STATUS = :status', { status: 'PAID' })
    .andWhere('ipm.UPDATED_AT BETWEEN :fromDate AND :toDate', {
      fromDate: whereObj.fromDate,
      toDate: whereObj.toDate,
    })
    .groupBy('ipm.ID')
    .addGroupBy('ip.ID')
    .addGroupBy('ipm.PRE_VAT_AMOUNT')
    .addGroupBy('ipm.VAT_AMOUNT')
    .addGroupBy('ipm.TOTAL_AMOUNT')
    .addGroupBy('ipm.UPDATED_AT')
    .addGroupBy('ipm.UPDATED_BY')
    .addGroupBy('users.FULLNAME')
    .addGroupBy('cus.ID')
    .addGroupBy('ipm.STATUS');
  if (whereObj.CUSTOMER_ID) {
    importRpData = importRpData.andWhere('LOWER(cus.ID) LIKE LOWER(:FULLNAME)', {
      FULLNAME: `%${whereObj.CUSTOMER_ID}%`,
    });
  }
  if (whereObj.PAYMENT_ID) {
    importRpData = importRpData.andWhere('LOWER(ipm.ID) LIKE LOWER(:paymentID)', {
      paymentID: `%${whereObj.PAYMENT_ID}%`,
    });
  }

  let exportRpData = exportOrderPaymentRepository
    .createQueryBuilder('epm')
    .leftJoin('EXPORT_ORDER', 'ex', 'epm.ID = ex.PAYMENT_ID')
    .leftJoin('EXPORT_ORDER_DETAIL', 'epd', 'epd.ORDER_ID = ex.ID')
    .leftJoin('VOYAGE_CONTAINER_PACKAGE', 'pk', 'epd.VOYAGE_CONTAINER_PACKAGE_ID = pk.ID')
    .leftJoin('CUSTOMER', 'cus', 'cus.ID = pk.CONSIGNEE_ID')
    .leftJoin('USER', 'users', 'users.USERNAME = cus.USERNAME')
    .select([
      'ex.ID as order_ID',
      "'XK' as TYPE",
      'epm.ID as ID',
      'epm.PRE_VAT_AMOUNT as PRE_VAT_AMOUNT',
      'epm.VAT_AMOUNT as VAT_AMOUNT',
      'epm.TOTAL_AMOUNT as TOTAL_AMOUNT',
      'epm.UPDATED_AT AS DatePayment',
      'users.FULLNAME as FULLNAME',
      'cus.ID as CUSTOMER_ID',
      'epm.UPDATED_BY AS cashier',
      'epm.STATUS as STATUS',
    ])
    .where('epm.STATUS = :status', { status: 'PAID' })
    .andWhere('epm.UPDATED_AT BETWEEN :fromDate AND :toDate', {
      fromDate: whereObj.fromDate,
      toDate: whereObj.toDate,
    })
    .groupBy('epm.ID')
    .addGroupBy('ex.ID')
    .addGroupBy('epm.PRE_VAT_AMOUNT')
    .addGroupBy('epm.VAT_AMOUNT')
    .addGroupBy('epm.TOTAL_AMOUNT')
    .addGroupBy('epm.UPDATED_AT')
    .addGroupBy('epm.UPDATED_BY')
    .addGroupBy('users.FULLNAME')
    .addGroupBy('cus.ID')
    .addGroupBy('epm.STATUS');
  if (whereObj.CUSTOMER_ID) {
    exportRpData = exportRpData.andWhere('LOWER(cus.ID) LIKE LOWER(:FULLNAME)', {
      FULLNAME: `%${whereObj.CUSTOMER_ID}%`,
    });
  }
  if (whereObj.PAYMENT_ID) {
    exportRpData = exportRpData.andWhere('LOWER(epm.ID) LIKE LOWER(:paymentID)', {
      paymentID: `%${whereObj.PAYMENT_ID}%`,
    });
  }
  switch (whereObj.TYPE) {
    case 'NK':
      return await importRpData.getRawMany();
    case 'XK':
      return await exportRpData.getRawMany();
    default:
      return (await importRpData.getRawMany()).concat(await exportRpData.getRawMany());
  }
};

export {
  cancelOrder,
  findMaxOrderNo,
  getContainerTariff,
  loadCancelOrder,
  loadContInfoByID,
  loadImportContainer,
  loadImportVesselAnhCustomer,
  loadPaymentComplete,
  paymentComplete,
  saveImportOrder,
  saveImportOrderDtl,
  saveImportPayment,
  updateVoyageContainer,
  findOrderByOrderId,
  reportRevenue,
};
