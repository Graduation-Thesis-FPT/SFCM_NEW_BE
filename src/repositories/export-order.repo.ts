import mssqlConnection from '../dbs/mssql.connect';
import { ExportOrderEntity } from '../entity/export-order.entity';

export const exportOrderRepository = mssqlConnection.getRepository(ExportOrderEntity);

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
