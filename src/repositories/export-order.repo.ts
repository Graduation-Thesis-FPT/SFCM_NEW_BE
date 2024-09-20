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
    query.andWhere('eo.PICKUP_DATE >= :from', {
      from: new Date(from),
    });
  }

  if (to) {
    query.andWhere('eo.PICKUP_DATE <= :to', {
      to: new Date(to),
    });
  }

  return await query.getRawMany();
};
