import { Brackets, EntityManager } from 'typeorm';
// import { DeliverOrderEntity } from '../../../SFCM_BE/src/entity/deliver-order.entity';
// import { JobQuantityCheckEntity } from '../../../SFCM_BE/src/entity/job-quantity-check.entity';
// import { JobQuantityCheck as JobQuantityCheckModel } from '../../../SFCM_BE/src/models/job-quantity-check.model';
// import { PalletStockEntity } from '../../../SFCM_BE/src/entity/pallet-stock.entity';
// import { PalletModel } from '../../../SFCM_BE/src/models/pallet-stock.model';
import moment from 'moment';
import mssqlConnection from '../dbs/mssql.connect';
import { PackageCellAllocationEntity } from '../entity/package-cell-allocation.entity';
import { User } from '../entity/user.entity';
import { VoyageContainerPackageEntity } from '../entity/voyage-container-package.entity';
import { VoyageContainerEntity } from '../entity/voyage-container.entity';
import { PackageCellAllocation, PackageCellQuantityCheck } from '../models/package-cell-allocation';
import { ExportOrderPaymentEntity } from '../entity/export-order-payment.entity';

const packageCellAllocationRepository = mssqlConnection.getRepository(PackageCellAllocationEntity);
// const tbJobQuantityCheck = mssqlConnection.getRepository(JobQuantityCheckEntity);
const tbPackage = mssqlConnection.getRepository(VoyageContainerPackageEntity);
const voyageContainer = mssqlConnection.getRepository(VoyageContainerEntity);
const exportOrderPaymentRepository = mssqlConnection.getRepository(ExportOrderPaymentEntity);

export const getPackageCellAllocationForDocByRowguid = async (ROWGUID: string) => {
  return await packageCellAllocationRepository
    .createQueryBuilder('pca')
    .leftJoinAndSelect('VOYAGE_CONTAINER_PACKAGE', 'pk', 'pca.VOYAGE_CONTAINER_PACKAGE_ID = pk.ID')
    .innerJoinAndSelect('CUSTOMER', 'cus', 'pk.CONSIGNEE_ID = cus.ID')
    .innerJoinAndSelect('USER', 'us', 'cus.USERNAME = us.USERNAME')
    .innerJoinAndSelect('VOYAGE_CONTAINER', 'cont', 'cont.ID = pk.VOYAGE_CONTAINER_ID')
    .innerJoinAndSelect('VOYAGE', 'voy', 'cont.VOYAGE_ID = voy.ID')
    .where('pca.ROWGUID = :id', { id: ROWGUID })
    .getRawOne();
};

export const getAllImportedContainer = async () => {
  return await voyageContainer
    .createQueryBuilder('cont')
    .leftJoinAndSelect('VOYAGE_CONTAINER_PACKAGE', 'pk', 'pk.VOYAGE_CONTAINER_ID = cont.ID')
    .innerJoinAndSelect('VOYAGE', 'voy', 'voy.ID = cont.VOYAGE_ID')
    .select([
      'cont.ID as VOYAGE_CONTAINER_ID',
      'cont.CNTR_NO as CNTR_NO',
      'cont.CNTR_SIZE as CNTR_SIZE',
      'cont.SHIPPER_ID as SHIPPER_ID',
      'cont.SEAL_NO as SEAL_NO',
      'cont.STATUS as STATUS',
      'cont.NOTE as NOTE',
      'voy.ID as ID',
      'voy.VESSEL_NAME as VESSEL_NAME',
      'voy.ETA as ETA',
    ])
    .where('cont.STATUS = :status', { status: 'IMPORTED' })
    .andWhere('pk.STATUS IN (:...pkStatus)', { pkStatus: ['IN_CONTAINER', 'ALLOCATING'] })
    .groupBy(
      'cont.ID, cont.CNTR_NO, cont.CNTR_SIZE, cont.SHIPPER_ID, cont.SEAL_NO, cont.STATUS, cont.NOTE, voy.ID, voy.VESSEL_NAME, voy.ETA',
    )
    .getRawMany();
};

export const getPackageByVoyageContainerId = async (CONTAINER_ID: string) => {
  return await tbPackage
    .createQueryBuilder('package')
    .leftJoinAndSelect(
      'PACKAGE_CELL_ALLOCATION',
      'pca',
      'pca.VOYAGE_CONTAINER_PACKAGE_ID = package.ID',
    )
    .select([
      'package.ID as ID',
      'package.HOUSE_BILL as HOUSE_BILL',
      'package.VOYAGE_CONTAINER_ID as VOYAGE_CONTAINER_ID',
      'package.PACKAGE_TYPE_ID as PACKAGE_TYPE_ID',
      'package.CONSIGNEE_ID as CONSIGNEE_ID',
      'package.PACKAGE_UNIT as PACKAGE_UNIT',
      'package.CBM as CBM',
      'package.TOTAL_ITEMS as TOTAL_ITEMS',
      'package.NOTE as NOTE',
      'package.TIME_IN as TIME_IN',
      'package.STATUS as STATUS',
      'pca.IS_SEPARATED as IS_SEPARATED',
    ])
    .where('package.VOYAGE_CONTAINER_ID = :id', { id: CONTAINER_ID })
    .groupBy(
      'package.ID, package.HOUSE_BILL, package.VOYAGE_CONTAINER_ID, package.PACKAGE_TYPE_ID, package.CONSIGNEE_ID, package.PACKAGE_UNIT, package.CBM, package.TOTAL_ITEMS, package.NOTE, package.TIME_IN, package.STATUS, pca.IS_SEPARATED',
    )
    // .andWhere('package.STATUS = :status', { status: 'ALLOCATING' })
    .getRawMany();
};

export const getAllPackageCellById = async (VOYAGE_CONTAINER_PACKAGE_ID: string) => {
  return packageCellAllocationRepository
    .createQueryBuilder('packageCellAllocation')
    .select([
      'packageCellAllocation.ROWGUID as ROWGUID',
      'packageCellAllocation.VOYAGE_CONTAINER_PACKAGE_ID as VOYAGE_CONTAINER_PACKAGE_ID',
      'packageCellAllocation.CELL_ID as CELL_ID',
      'packageCellAllocation.ITEMS_IN_CELL as ITEMS_IN_CELL',
      'packageCellAllocation.NOTE as NOTE',
      'packageCellAllocation.SEPARATED_PACKAGE_LENGTH as SEPARATED_PACKAGE_LENGTH',
      'packageCellAllocation.SEPARATED_PACKAGE_WIDTH as SEPARATED_PACKAGE_WIDTH',
      'packageCellAllocation.SEPARATED_PACKAGE_HEIGHT as SEPARATED_PACKAGE_HEIGHT',
      'packageCellAllocation.IS_SEPARATED as IS_SEPARATED',
      'packageCellAllocation.SEQUENCE as SEQUENCE',
    ])
    .where('VOYAGE_CONTAINER_PACKAGE_ID = :id', {
      id: VOYAGE_CONTAINER_PACKAGE_ID,
    })
    .orderBy('SEQUENCE', 'ASC')
    .getRawMany();
};

export const createPackageCellAllocation = async (
  listData: PackageCellAllocation[],
  totalVoyageContainerPackage: number,
  transactionalEntityManager: EntityManager,
) => {
  listData.sort((a: any, b: any) => a.SEQUENCE - b.SEQUENCE);

  const totalSeparatedItems = await checkTotalItemsSeparated(
    listData[0].VOYAGE_CONTAINER_PACKAGE_ID,
  );

  if (totalSeparatedItems.totalItems === totalVoyageContainerPackage) {
    throw new Error('Số lượng hàng đã tách bằng số lượng hàng trong container');
  }

  const packageCellAlocation = packageCellAllocationRepository.create(listData);

  return transactionalEntityManager.save(packageCellAlocation);
};

const checkTotalItemsSeparated = async (
  VOYAGE_CONTAINER_PACKAGE_ID: string,
): Promise<PackageCellQuantityCheck> => {
  return await packageCellAllocationRepository
    .createQueryBuilder('packageCellAllocation')
    .select('SUM(packageCellAllocation.ITEMS_IN_CELL) as totalItems')
    .where('packageCellAllocation.VOYAGE_CONTAINER_PACKAGE_ID = :id', {
      id: VOYAGE_CONTAINER_PACKAGE_ID,
    })
    .getRawOne();
};

export const updatePackageCellAllocation = async (
  packageAllocationInfo: PackageCellAllocation[],
  transactionalEntityManager: EntityManager,
) => {
  return await Promise.all(
    packageAllocationInfo.map(packageData =>
      transactionalEntityManager.update(
        PackageCellAllocationEntity,
        packageData.ROWGUID,
        packageData,
      ),
    ),
  );
};

export const completePackageSepareate = async (
  VOYAGE_CONTAINER_PACKAGE_ID: string,
  transactionalEntityManager: EntityManager,
  createBy: User,
) => {
  return await transactionalEntityManager
    .createQueryBuilder(PackageCellAllocationEntity, 'packageCellAllocation')
    .update(PackageCellAllocationEntity)
    .set({
      IS_SEPARATED: true,
      UPDATED_AT: moment().format('YYYY-MM-DD HH:mm:ss'),
      UPDATED_BY: createBy.USERNAME,
    })
    .where('VOYAGE_CONTAINER_PACKAGE_ID = :id', { id: VOYAGE_CONTAINER_PACKAGE_ID })
    .execute();
};

//check
export const checkPackageIdExist = async (
  PACKAGE_ID: string,
  transactionalEntityManager: EntityManager,
) => {
  return await transactionalEntityManager.findOne(VoyageContainerPackageEntity, {
    where: { ID: PACKAGE_ID },
  });
};

// export const checkEstimatedCargoPieceIsValid = async (
//   PACKAGE_ID: string,
//   transactionalEntityManager: EntityManager,
// ) => {
//   const sum = await transactionalEntityManager
//     .createQueryBuilder(JobQuantityCheckEntity, 'job')
//     .select('SUM(job.ESTIMATED_CARGO_PIECE) as sum')
//     .where('job.PACKAGE_ID = :package_id', { package_id: PACKAGE_ID })
//     .getRawOne();
//   const actual = await transactionalEntityManager
//     .createQueryBuilder(PackageCellAllocationEntity, 'pk')
//     .select('SUM(pk.CARGO_PIECE) as acctual')
//     .where('pk.ROWGUID = :id', { id: PACKAGE_ID })
//     .getRawOne();
//   if (sum.sum > actual.acctual) {
//     return false;
//   }
//   return true;
// };

// export const checkSEQExist = async (PACKAGE_ID: string, SEQ: number) => {
//   return await tbJobQuantityCheck.findOne({ where: { PACKAGE_ID: PACKAGE_ID, SEQ: SEQ } });
// };

export const findCellAllocationByPackageId = async (
  PACKAGE_ID: string,
  transactionalEntityManager: EntityManager,
) => {
  return await transactionalEntityManager
    .createQueryBuilder(PackageCellAllocationEntity, 'pk')
    .where('pk.ROWGUID = :id', { id: PACKAGE_ID })
    .getOne();
};

export const findPackageById = async (PACKAGE_ID: string) => {
  return await packageCellAllocationRepository.findOne({ where: { ROWGUID: PACKAGE_ID } });
};

export const updatePackageCellPosition = async (cellId: string | null, packageRowId: string) => {
  return await packageCellAllocationRepository
    .createQueryBuilder('packageCellAllocation')
    .update(PackageCellAllocationEntity)
    .set({
      CELL_ID: cellId,
    })
    .where('ROWGUID = :id', { id: packageRowId })
    .execute();
};

export const getReadyToWarehouse = async () => {
  return await packageCellAllocationRepository
    .createQueryBuilder('pca')
    .innerJoin('VOYAGE_CONTAINER_PACKAGE', 'pk', 'pk.ID = pca.VOYAGE_CONTAINER_PACKAGE_ID')
    .innerJoin('VOYAGE_CONTAINER', 'cont', 'cont.ID = pk.VOYAGE_CONTAINER_ID')
    .innerJoin('IMPORT_ORDER_DETAIL', 'iod', 'cont.ID = iod.VOYAGE_CONTAINER_ID')
    .innerJoin('IMPORT_ORDER', 'io', 'iod.ORDER_ID = io.ID')
    .innerJoin('IMPORT_ORDER_PAYMENT', 'pay', 'pay.ID = io.PAYMENT_ID')
    .select([
      'io.ID as ORDER_ID',
      'pk.HOUSE_BILL AS HOUSE_BILL',
      'pk.CONSIGNEE_ID AS CONSIGNEE_ID',
      'pk.PACKAGE_UNIT AS PACKAGE_UNIT',
      'pk.ID as ID',
      'pca.ROWGUID as ROWGUID',
      'pca.VOYAGE_CONTAINER_PACKAGE_ID as VOYAGE_CONTAINER_PACKAGE_ID',
      'pca.CELL_ID as CELL_ID',
      'pca.ITEMS_IN_CELL as ITEMS_IN_CELL',
      'pca.NOTE as NOTE',
      'pca.SEPARATED_PACKAGE_LENGTH as SEPARATED_PACKAGE_LENGTH',
      'pca.SEPARATED_PACKAGE_WIDTH as SEPARATED_PACKAGE_WIDTH',
      'pca.SEPARATED_PACKAGE_HEIGHT as SEPARATED_PACKAGE_HEIGHT',
      'pca.SEQUENCE as SEQUENCE',
      'cont.CNTR_NO as CNTR_NO',
    ])
    .where('pca.IS_SEPARATED = :isSeparated', { isSeparated: true })
    .andWhere('pca.CELL_ID IS NULL')
    .andWhere('io.STATUS = :statusCompleted', { statusCompleted: 'COMPLETED' })
    .andWhere('pk.STATUS != :status', { status: 'OUT_FOR_DELIVERY' })
    .andWhere('pay.STATUS = :status', { status: 'PAID' })
    .orderBy('pk.ID', 'ASC')
    .getRawMany();
};

export const getListExportPackage = async () => {
  return await exportOrderPaymentRepository
    .createQueryBuilder('eop')
    .leftJoinAndSelect('EXPORT_ORDER', 'eo', 'eop.ID = eo.PAYMENT_ID')
    .leftJoinAndSelect('EXPORT_ORDER_DETAIL', 'eod', 'eod.ORDER_ID = eo.ID')
    .leftJoinAndSelect('VOYAGE_CONTAINER_PACKAGE', 'pk', 'pk.ID = eod.VOYAGE_CONTAINER_PACKAGE_ID')
    .leftJoinAndSelect('PACKAGE_CELL_ALLOCATION', 'pca', 'pca.VOYAGE_CONTAINER_PACKAGE_ID = pk.ID')
    .innerJoinAndSelect('CELL', 'cell', 'cell.ROWGUID =	pca.CELL_ID')
    .innerJoinAndSelect('BLOCK', 'bl', 'bl.ID = cell.BLOCK_ID')
    .select([
      'eo.ID AS ORDER_ID',
      'pk.HOUSE_BILL AS HOUSE_BILL',
      'pk.CONSIGNEE_ID AS CONSIGNEE_ID',
      'pk.PACKAGE_UNIT AS PACKAGE_UNIT',
      'pk.ID as ID',
      'pca.ROWGUID AS ROWGUID',
      'pca.CELL_ID AS CELL_ID',
      'pca.ITEMS_IN_CELL AS ITEMS_IN_CELL',
      'pca.NOTE AS NOTE',
      'pca.SEPARATED_PACKAGE_LENGTH as SEPARATED_PACKAGE_LENGTH',
      'pca.SEPARATED_PACKAGE_WIDTH as SEPARATED_PACKAGE_WIDTH',
      'pca.SEPARATED_PACKAGE_HEIGHT as SEPARATED_PACKAGE_HEIGHT',
      'pca.SEQUENCE as SEQUENCE',
      'bl.WAREHOUSE_ID AS WAREHOUSE_ID',
      'pk.ID AS VOYAGE_CONTAINER_PACKAGE_ID',
    ])
    .where('eop.STATUS = :statusPaid', { statusPaid: 'PAID' })
    .andWhere('pk.STATUS != :statusInWarehouse', { statusInWarehouse: 'OUT_FOR_DELIVERY' })
    .andWhere('eo.STATUS = :statusCompleted', { statusCompleted: 'COMPLETED' })
    .andWhere('pca.IS_SEPARATED = :isSeparated', { isSeparated: true })
    .andWhere('pca.CELL_ID IS NOT NULL')
    .orderBy('pk.ID', 'ASC')
    .getRawMany();
};

export const checkExportOrderStatus = async (packageCellID: string) => {
  return await packageCellAllocationRepository
    .createQueryBuilder('packageCell')
    .innerJoin(
      'VOYAGE_CONTAINER_PACKAGE',
      'voyageContainerpackage',
      'voyageContainerpackage.ID = packageCell.VOYAGE_CONTAINER_PACKAGE_ID',
    )
    .innerJoin(
      'EXPORT_ORDER_DETAIL',
      'ex',
      'ex.VOYAGE_CONTAINER_PACKAGE_ID = voyageContainerpackage.ID',
    )
    .innerJoin('EXPORT_ORDER', 'eo', 'eo.ID = ex.ORDER_ID')
    .select(['eo.STATUS as STATUS', 'packageCell.ROWGUID as ROWGUID'])
    .where('packageCell.ROWGUID = :id', { id: packageCellID })
    .andWhere('eo.STATUS = :status', { status: 'COMPLETED' })
    .getRawOne();
};

export const updateVoyageContainerPackageStatus = async (voyageContainerPackageId: string) => {
  return await tbPackage
    .createQueryBuilder('voyageContainerPackage')
    .update(VoyageContainerPackageEntity)
    .set({
      STATUS: 'OUT_FOR_DELIVERY',
    })
    .where('ID = :voyageContainerPackageId', { voyageContainerPackageId })
    .execute();
};
