import { Between, EntityManager } from 'typeorm';
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

export const exportOrderPaymentRepository = mssqlConnection.getRepository(ExportOrderPaymentEntity);
export const importOrderPaymentEntityRepository =
  mssqlConnection.getRepository(ImportOrderPaymentEntity);
export const importOrderRepository = mssqlConnection.getRepository(ImportOrderEntity);
export const importOrderDtlEntityRepository =
  mssqlConnection.getRepository(ImportOrderDetailEntity);

export const customerRepository = mssqlConnection.getRepository(CustomerEntity);
export const voyageContainerRepository = mssqlConnection.getRepository(VoyageContainerEntity);
export const contTariffRepository = mssqlConnection.getRepository(ContainerTariff);

export const getAllVoyageWithCustomerCanImportOrder = async () => {
  return await voyageContainerRepository
    .createQueryBuilder('cont')
    .select([
      'voy.ID AS ID',
      'voy.VESSEL_NAME AS VESSEL_NAME',
      'voy.ETA AS ETA',
      'cont.SHIPPER_ID AS SHIPPER_ID',
      'us.FULLNAME AS FULLNAME',
      'cus.TAX_CODE AS TAX_CODE',
      'COUNT(voy.ID) AS num_of_cont_can_import',
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
    .createQueryBuilder()
    .where('VOYAGE_ID = :voyage', { voyage: whereObj.VOYAGE_ID })
    .andWhere('SHIPPER_ID = :shipper', { shipper: whereObj.SHIPPER_ID })
    .andWhere('STATUS = :status', { status: 'PENDING' })
    .getMany();
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
const paymentComplete = async (whereObj: wherePaymentCompleteObj) => {
  if (whereObj.TYPE == 'NK') {
    await importOrderPaymentEntityRepository.update({ ID: whereObj.ID }, { STATUS: 'PAID' });
  } else {
    await exportOrderPaymentRepository.update({ ID: whereObj.ID }, { STATUS: 'PAID' });
  }
  return {};
};

export type filterCancelOrder = {
  fromDate?: Date;
  toDate?: Date;
};
// const loadCancelOrder = async (whereObj: filterCancelOrder) => {
//   let filterObj: any = {
//     STATUS: 'COMPLETED',
//   };
//   if (whereObj?.fromDate && whereObj?.toDate) {
//     filterObj = { CREATED_AT: Between(whereObj?.fromDate, whereObj?.toDate) };
//   }
// };

const cancelOrder = async () => {};

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
    query.andWhere('eo.CREATED_AT >= :from', {
      from: new Date(from),
    });
  }

  if (to) {
    query.andWhere('eo.CREATED_AT <= :to', {
      to: new Date(to),
    });
  }

  return await query.getRawMany();
};

export {
  findMaxOrderNo,
  getContainerTariff,
  loadContInfoByID,
  loadImportContainer,
  loadImportVesselAnhCustomer,
  loadPaymentComplete,
  paymentComplete,
  saveImportOrder,
  saveImportOrderDtl,
  saveImportPayment,
  updateVoyageContainer,
};
