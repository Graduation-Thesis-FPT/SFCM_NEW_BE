import { Brackets, EntityManager } from 'typeorm';
import { DeliverOrderEntity } from '../../../SFCM_BE/src/entity/deliver-order.entity';
import { JobQuantityCheckEntity } from '../../../SFCM_BE/src/entity/job-quantity-check.entity';
import { JobQuantityCheck as JobQuantityCheckModel } from '../../../SFCM_BE/src/models/job-quantity-check.model';
import { PalletStockEntity } from '../../../SFCM_BE/src/entity/pallet-stock.entity';
import { PalletModel } from '../../../SFCM_BE/src/models/pallet-stock.model';
import moment from 'moment';
import { VoyageContainerPackage } from '../entity/voyage-container-package.entity';
import { PackageCellAllocationEntity } from '../entity/package-cell-allocation.entity';
import {
  PackageCellAllocation,
  PackageCellAllocationInfo,
} from '../models/package-cell-allocation';
import mssqlConnection from '../dbs/mssql.connect';
import { User } from '../entity/user.entity';
import { VoyageContainerEntity } from '../entity/voyage-container.entity';

const packageCellAllocationRepository = mssqlConnection.getRepository(PackageCellAllocationEntity);
const tbJobQuantityCheck = mssqlConnection.getRepository(JobQuantityCheckEntity);
const tbPackage = mssqlConnection.getRepository(VoyageContainerPackage);
const voyageContainer = mssqlConnection.getRepository(VoyageContainerEntity);

export const getAllImportedContainer = async () => {
  return await voyageContainer
    .createQueryBuilder('voyageContainer')
    .select([
      'voyageContainer.ID as ID',
      'voyageContainer.CNTR_NO as CNTR_NO',
      'voyageContainer.CNTR_SIZE as CNTR_SIZE',
      'voyageContainer.SHIPPER_ID as SHIPPER_ID',
      'voyageContainer.SEAL_NO as SEAL_NO',
      'voyageContainer.STATUS as STATUS',
      'voyageContainer.NOTE as NOTE',
    ])
    .where('voyageContainer.STATUS = :status', { status: 'IMPORTED' })
    .getRawMany();
};

export const getPackageByVoyageContainerId = async (CONTAINER_ID: string) => {
  return await tbPackage
    .createQueryBuilder('package')
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
    ])
    .where('package.VOYAGE_CONTAINER_ID = :id', { id: CONTAINER_ID })
    .andWhere('package.STATUS = :status', { status: 'ALLOCATING' })
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
    .getRawMany();
};

export const createPackageCellAllocation = async (
  listData: PackageCellAllocation[],
  transactionalEntityManager: EntityManager,
) => {
  listData.sort((a: any, b: any) => a.SEQUENCE - b.SEQUENCE);
  const packageCellAlocation = packageCellAllocationRepository.create(listData);

  return transactionalEntityManager.save(packageCellAlocation);
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
export const checkPackageIdExist = async (PACKAGE_ID: string) => {
  return await tbPackage.findOne({ where: { ID: PACKAGE_ID } });
};

export const checkEstimatedCargoPieceIsValid = async (
  PACKAGE_ID: string,
  transactionalEntityManager: EntityManager,
) => {
  const sum = await transactionalEntityManager
    .createQueryBuilder(JobQuantityCheckEntity, 'job')
    .select('SUM(job.ESTIMATED_CARGO_PIECE) as sum')
    .where('job.PACKAGE_ID = :package_id', { package_id: PACKAGE_ID })
    .getRawOne();
  const actual = await transactionalEntityManager
    .createQueryBuilder(PackageCellAllocationEntity, 'pk')
    .select('SUM(pk.CARGO_PIECE) as acctual')
    .where('pk.ROWGUID = :id', { id: PACKAGE_ID })
    .getRawOne();
  if (sum.sum > actual.acctual) {
    return false;
  }
  return true;
};

export const checkSEQExist = async (PACKAGE_ID: string, SEQ: number) => {
  return await tbJobQuantityCheck.findOne({ where: { PACKAGE_ID: PACKAGE_ID, SEQ: SEQ } });
};

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

export const updatePackageCellPosition = async (cellId: string, packageRowId: string) => {
  return await packageCellAllocationRepository
    .createQueryBuilder('packageCellAllocation')
    .update(PackageCellAllocationEntity)
    .set({
      CELL_ID: cellId,
    })
    .where('ROWGUID = :id', { id: packageRowId })
    .execute();
};

export const getAllPackageCellSeparated = async () => {
  return await packageCellAllocationRepository
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
    .where('packageCellAllocation.IS_SEPARATED = 1')
    .getRawMany();
};
