import mssqlConnection from '../dbs/mssql.connect';
import { ExportOrderEntity } from '../entity/export-order.entity';
import { VoyageContainerPackageEntity } from '../entity/voyage-container-package.entity';

export const exportOrderRepository = mssqlConnection.getRepository(ExportOrderEntity);
export const voyageContainerPackageRepository = mssqlConnection.getRepository(
  VoyageContainerPackageEntity,
);

export const getExportOrderById = async (id: string) => {
  return await exportOrderRepository
    .createQueryBuilder()
    .select([
      'ID',
      'PAYMENT_ID',
      'PACKAGE_TARIFF_ID',
      'PICKUP_DATE',
      'NOTE',
      'CAN_CANCEL',
      'STATUS',
      'CREATED_BY',
      'CREATED_AT',
      'UPDATED_BY',
      'UPDATED_AT',
    ])
    .where('ID = :id', { id })
    .getRawOne();
};

export const getExportOrders = async ({
  consigneeId,
  from,
  to,
}: {
  consigneeId?: string;
  from?: string;
  to?: string;
}) => {
  const query = exportOrderRepository
    .createQueryBuilder('eo')
    .select([
      'eo.ID AS ID',
      'eo.PAYMENT_ID AS PAYMENT_ID',
      'eo.PACKAGE_TARIFF_ID AS PACKAGE_TARIFF_ID',
      'eo.PICKUP_DATE AS PICKUP_DATE',
      'eo.NOTE AS NOTE',
      'eo.CAN_CANCEL AS CAN_CANCEL',
      'eo.STATUS AS STATUS',
      'eo.CREATED_BY AS CREATED_BY',
      'eo.CREATED_AT AS CREATED_AT',
      'eo.UPDATED_BY AS UPDATED_BY',
      'eo.UPDATED_AT AS UPDATED_AT',
    ]);

  if (consigneeId) {
    query
      .innerJoin('EXPORT_ORDER_DETAIL', 'eod', 'eo.ID = eod.ORDER_ID')
      .innerJoin('VOYAGE_CONTAINER_PACKAGE', 'vcp', 'eod.VOYAGE_CONTAINER_PACKAGE_ID = vcp.ID')
      .where('vcp.CONSIGNEE_ID = :consigneeId', { consigneeId });
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

  const exportOrders = await query.getRawMany();

  // Get EXPORT_ORDER_DETAILS by querying all items in EXPORT_ORDER_DETAIL table and add to exportOrders, e.g. exportOrders[0].EXPORT_ORDER_DETAILS
  const exportOrderDetails = await mssqlConnection
    .getRepository('EXPORT_ORDER_DETAIL')
    .createQueryBuilder('eod')
    .select([
      'eod.ROWGUID AS ROWGUID',
      'eod.ORDER_ID AS ORDER_ID',
      'eod.VOYAGE_CONTAINER_PACKAGE_ID AS VOYAGE_CONTAINER_PACKAGE_ID',
      'eod.CBM AS CBM',
      'eod.TOTAL_DAYS AS TOTAL_DAYS',
      'eod.CREATED_BY AS CREATED_BY',
      'eod.CREATED_AT AS CREATED_AT',
      'eod.UPDATED_BY AS UPDATED_BY',
      'eod.UPDATED_AT AS UPDATED_AT',
    ])
    .getRawMany();

  exportOrders.forEach((eo: any) => {
    eo.EXPORT_ORDER_DETAILS = exportOrderDetails.filter((eod: any) => eod.ORDER_ID === eo.ID);
  });

  // Get PAYMENT by querying all items in PAYMENT table and add to exportOrders, e.g. exportOrders[0].PAYMENT
  const payments = await mssqlConnection
    .getRepository('EXPORT_ORDER_PAYMENT')
    .createQueryBuilder('p')
    .select([
      'p.ID AS ID',
      'p.PRE_VAT_AMOUNT AS PRE_VAT_AMOUNT',
      'p.VAT_AMOUNT AS VAT_AMOUNT',
      'p.TOTAL_AMOUNT AS TOTAL_AMOUNT',
      'p.STATUS AS STATUS',
      'p.CREATED_BY AS CREATED_BY',
      'p.CREATED_AT AS CREATED_AT',
      'p.UPDATED_BY AS UPDATED_BY',
      'p.UPDATED_AT AS UPDATED_AT',
    ])
    .getRawMany();

  exportOrders.forEach((eo: any) => {
    eo.PAYMENT = payments.find((p: any) => eo.PAYMENT_ID === p.ID);
  });

  return exportOrders;
};

export const getAllCustomerCanExportOrders = async () => {
  return await voyageContainerPackageRepository
    .createQueryBuilder('pk')
    .leftJoin('EXPORT_ORDER_DETAIL', 'eod', 'pk.ID = eod.VOYAGE_CONTAINER_PACKAGE_ID')
    .innerJoinAndSelect('CUSTOMER', 'cus', 'pk.CONSIGNEE_ID = cus.ID')
    .innerJoinAndSelect('USER', 'us', 'cus.USERNAME = us.USERNAME')
    .select([
      'pk.CONSIGNEE_ID AS CONSIGNEE_ID',
      'pk.STATUS AS STATUS',
      'cus.USERNAME AS EMAIL',
      'cus.TAX_CODE AS TAX_CODE',
      'us.FULLNAME AS FULLNAME',
      'us.ADDRESS AS ADDRESS',
      'COUNT(pk.ID) AS num_of_pk_can_export',
    ])
    .where('pk.STATUS = :status', { status: 'IN_WAREHOUSE' })
    .andWhere('eod.ROWGUID IS NULL')
    .groupBy('pk.CONSIGNEE_ID, pk.STATUS, cus.TAX_CODE, us.FULLNAME, cus.USERNAME, us.ADDRESS')
    .getRawMany();
};

export const getPackageCanExportByConsigneeId = async (consigneeId: string) => {
  return await voyageContainerPackageRepository
    .createQueryBuilder('pk')
    .leftJoin('EXPORT_ORDER_DETAIL', 'eod', 'pk.ID = eod.VOYAGE_CONTAINER_PACKAGE_ID')
    .select([
      'pk.ID AS ID',
      'pk.VOYAGE_CONTAINER_ID AS VOYAGE_CONTAINER_ID',
      'pk.HOUSE_BILL AS HOUSE_BILL',
      'pk.PACKAGE_TYPE_ID AS PACKAGE_TYPE_ID',
      'pk.CONSIGNEE_ID AS CONSIGNEE_ID',
      'pk.PACKAGE_UNIT AS PACKAGE_UNIT',
      'pk.CBM AS CBM',
      'pk.TOTAL_ITEMS AS TOTAL_ITEMS',
      'pk.NOTE AS NOTE',
      'pk.TIME_IN AS TIME_IN',
      'pk.STATUS AS STATUS',
    ])
    .where('pk.CONSIGNEE_ID = :consigneeId', { consigneeId })
    .andWhere('pk.STATUS = :status', { status: 'IN_WAREHOUSE' })
    .andWhere('eod.ROWGUID IS NULL')
    .getRawMany();
};

export const getExportOrderForDocById = async (id: string) => {
  return await exportOrderRepository
    .createQueryBuilder('ord')
    .leftJoinAndSelect('EXPORT_ORDER_DETAIL', 'eod', 'ord.ID = eod.ORDER_ID')
    .innerJoinAndSelect('VOYAGE_CONTAINER_PACKAGE', 'pk', 'pk.ID = eod.VOYAGE_CONTAINER_PACKAGE_ID')
    .innerJoinAndSelect('CUSTOMER', 'cus', 'pk.CONSIGNEE_ID = cus.ID')
    .innerJoinAndSelect('USER', 'us', 'cus.USERNAME = us.USERNAME')
    .select([
      'ord.ID AS ID',
      'ord.PAYMENT_ID AS PAYMENT_ID',
      'ord.PACKAGE_TARIFF_ID AS PACKAGE_TARIFF_ID',
      'ord.PICKUP_DATE AS PICKUP_DATE',
      'ord.NOTE AS NOTE',
      'ord.STATUS AS STATUS',
      'eod.TOTAL_DAYS AS TOTAL_DAYS',
      'pk.HOUSE_BILL AS HOUSE_BILL',
      'pk.CONSIGNEE_ID AS CONSIGNEE_ID',
      'pk.PACKAGE_UNIT AS PACKAGE_UNIT',
      'pk.PACKAGE_TYPE_ID AS PACKAGE_TYPE_ID',
      'pk.CBM AS CBM',
      'pk.TOTAL_ITEMS AS TOTAL_ITEMS',
      'pk.TIME_IN AS TIME_IN',
      'cus.TAX_CODE AS TAX_CODE',
      'us.USERNAME AS EMAIL',
      'us.FULLNAME AS FULLNAME',
      'us.ADDRESS AS ADDRESS',
      'us.TELEPHONE AS TELEPHONE',
    ])
    .where('ord.ID = :id', { id })
    .getRawMany();
};
