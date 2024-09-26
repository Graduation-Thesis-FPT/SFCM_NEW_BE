import mssqlConnection from '../dbs/mssql.connect';
import { ExportOrderEntity } from '../entity/export-order.entity';
import { ImportOrder } from '../entity/import-order.entity';

const importOrderRepository = mssqlConnection.getRepository(ImportOrder);
const exportOrderRepository = mssqlConnection.getRepository(ExportOrderEntity);

export const findImportedOrdersByStatus = async (customerID: string) => {
  return await importOrderRepository
    .createQueryBuilder('importOrder')
    .innerJoin(
      'IMPORT_ORDER_PAYMENT',
      'importOrderPayment',
      'importOrder.PAYMENT_ID = importOrderPayment.ID',
    )
    .innerJoin(
      'IMPORT_ORDER_DETAIL',
      'importOrderDetail',
      'importOrder.ID = importOrderDetail.ORDER_ID',
    )
    .innerJoin(
      'VOYAGE_CONTAINER',
      'voyageContainer',
      'importOrderDetail.VOYAGE_CONTAINER_ID = voyageContainer.ID',
    )
    .select([
      'importOrder.ID as ORDER_ID',
      'importOrder.STATUS as ORDER_STATUS',
      'importOrderDetail.VOYAGE_CONTAINER_ID as VOYAGE_CONTAINER_ID',
      'importOrder.CREATED_AT as CREATED_AT',
      'importOrderPayment.STATUS as PAYMENT_STATUS',
      'voyageContainer.SHIPPER_ID as SHIPPER_ID',
      'voyageContainer.CNTR_NO as CNTR_NO',
      'voyageContainer.CNTR_SIZE as CNTR_SIZE',
      'voyageContainer.SEAL_NO as SEAL_NO',
      'voyageContainer.STATUS as CNTR_STATUS',
    ])
    .where('voyageContainer.SHIPPER_ID = :customerID', { customerID })
    .getRawMany();
};

export const findExportedOrdersByStatus = async (customerCode: string) => {
  return await exportOrderRepository
    .createQueryBuilder('exportOrder')
    .innerJoin(
      'EXPORT_ORDER_DETAIL',
      'exportOrderDetail',
      'exportOrder.ID = exportOrderDetail.ORDER_ID',
    )
    .innerJoin(
      'EXPORT_ORDER_PAYMENT',
      'exportOrderPayment',
      'exportOrder.PAYMENT_ID = exportOrderPayment.ID',
    )
    .innerJoin(
      'VOYAGE_CONTAINER_PACKAGE',
      'voyageContainerPackage',
      'exportOrderDetail.VOYAGE_CONTAINER_PACKAGE_ID = voyageContainerPackage.ID',
    )
    .select([
      'exportOrder.ID as ORDER_ID',
      'exportOrder.STATUS as ORDER_STATUS',
      'exportOrderDetail.VOYAGE_CONTAINER_PACKAGE_ID as VOYAGE_CONTAINER_PACKAGE_ID',
      'exportOrder.CREATED_AT as CREATED_AT',
      'exportOrderPayment.STATUS as PAYMENT_STATUS',
      'voyageContainerPackage.CONSIGNEE_ID as CONSIGNEE_ID',
      'voyageContainerPackage.VOYAGE_CONTAINER_ID as VOYAGE_CONTAINER_ID',
    ])
    .where('voyageContainerPackage.CONSIGNEE_ID = :customerCode', { customerCode })
    .getRawMany();
};
