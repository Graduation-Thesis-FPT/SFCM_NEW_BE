import { BadRequestError } from '../core/error.response';
import { User } from '../entity/user.entity';
import { Cell } from '../models/cell.model';
import {
  PackageCellAllocation,
  PackageDimension,
  PackagePositionReq,
  PackageReq,
} from '../models/package-cell-allocation';
import {
  findCellById,
  findCellByWarehouseCode,
  findCellInWarehouse,
  getAllAvailableCell,
  getAllPackagePositionByWarehouseCode,
  updateNewCellStatus,
  updateOldCellStatus,
} from '../repositories/cell.repo';
import {
  findPackageById,
  updatePackageCellPosition,
} from '../repositories/package-cell-allocation.repo';
import {
  findVoyageContainerPackageById,
  updateVoyageContainerPackageTimeIn,
} from '../repositories/voyage-container-package.repo';
import { findWarehouse } from '../repositories/warehouse.repo';
import _ from 'lodash';

class CellService {
  static suggestCell = async (palletInfo: PackageDimension, warehouseCode: string) => {
    const warehouse = await findWarehouse(warehouseCode);
    if (!warehouse) {
      throw new BadRequestError(`Nhà kho ${warehouseCode} không tồn tại`);
    }
    if (
      !palletInfo.SEPARATED_PACKAGE_HEIGHT ||
      !palletInfo.SEPARATED_PACKAGE_LENGTH ||
      !palletInfo.SEPARATED_PACKAGE_WIDTH
    ) {
      throw new BadRequestError('Kiện hàng phải có đủ chiều dài, rộng, cao');
    }
    const cell = await findCellByWarehouseCode(warehouseCode); // tìm cell theo warehouseCode có status = 0
    if (!cell.length) {
      throw new BadRequestError(`Không tìm thấy cell trong kho ${warehouseCode}`);
    }
    const groupCellByBlock = _.groupBy(cell, 'BLOCK_ID');
    const newListCell = [];
    for (const block in groupCellByBlock) {
      newListCell.push(groupCellByBlock[block].sort((a, b) => a.TIER_ORDERED - b.TIER_ORDERED)[0]);
    }
    const cellVolume = newListCell.map(item => {
      return {
        ...item,
        VOLUME: item.CELL_LENGTH * item.CELL_WIDTH * item.CELL_HEIGHT,
      };
    });
    const cellVolumeFilter: Cell[] = cellVolume
      .filter(
        cell =>
          cell.CELL_HEIGHT >= palletInfo.SEPARATED_PACKAGE_HEIGHT &&
          cell.CELL_LENGTH >= palletInfo.SEPARATED_PACKAGE_LENGTH &&
          cell.CELL_WIDTH >= palletInfo.SEPARATED_PACKAGE_WIDTH,
      )
      .sort((a, b) => a.VOLUME - b.VOLUME);
    const match = cellVolumeFilter.length > 0 ? cellVolumeFilter[0] : null;
    if (!match) {
      throw new BadRequestError('Không tìm thấy ô phù hợp');
    }
    if (
      palletInfo.SEPARATED_PACKAGE_HEIGHT > match.CELL_HEIGHT ||
      palletInfo.SEPARATED_PACKAGE_LENGTH > match.CELL_LENGTH ||
      palletInfo.SEPARATED_PACKAGE_WIDTH > match.CELL_WIDTH
    ) {
      throw new BadRequestError('Kích thước pallet không phù hợp');
    }
    return { matchedCell: match, listCellSuggested: cellVolume };
  };

  static getAvailableCell = async (
    SEPARATED_PACKAGE_LENGTH: number,
    SEPARATED_PACKAGE_WIDTH: number,
    SEPARATED_PACKAGE_HEIGHT: number,
  ) => {
    return await getAllAvailableCell({
      SEPARATED_PACKAGE_LENGTH,
      SEPARATED_PACKAGE_WIDTH,
      SEPARATED_PACKAGE_HEIGHT,
    });
  };

  static placePackageIntoCell = async (data: PackageReq, createBy: User) => {
    const cell = await findCellInWarehouse(data.CELL_ID, data.WAREHOUSE_ID);
    if (!cell) {
      throw new BadRequestError(`ô không hợp lệ!`);
    }
    if (cell.IS_FILLED) {
      throw new BadRequestError(
        `Ô ${cell.BLOCK_ID}-${cell.TIER_ORDERED}-${cell.SLOT_ORDERED} đã chứa hàng, xin vui lòng chọn ô khác!`,
      );
    }
    const packageAllocated = await findPackageById(data.PACKAGE_ROWGUID);

    if (!packageAllocated) {
      throw new BadRequestError(`package allocation không tồn tại, vui lòng kiểm tra lại!`);
    }

    const { SEPARATED_PACKAGE_HEIGHT, SEPARATED_PACKAGE_WIDTH, SEPARATED_PACKAGE_LENGTH } =
      packageAllocated;
    const { CELL_HEIGHT, CELL_WIDTH, CELL_LENGTH } = cell;
    if (
      SEPARATED_PACKAGE_HEIGHT > CELL_HEIGHT ||
      SEPARATED_PACKAGE_LENGTH > CELL_LENGTH ||
      SEPARATED_PACKAGE_WIDTH > CELL_WIDTH
    ) {
      throw new BadRequestError(`Kích thước package không phù hợp`);
    }

    const packageInfo = await findVoyageContainerPackageById(
      packageAllocated.VOYAGE_CONTAINER_PACKAGE_ID,
    );

    if (!packageInfo) {
      throw new BadRequestError(`Kiện hàng không tồn tại, vui lòng kiểm tra lại!`);
    }

    if (!packageInfo.TIME_IN) {
      packageInfo.TIME_IN = new Date();
      await updateVoyageContainerPackageTimeIn(packageInfo, createBy.USERNAME);
    }
    return await Promise.all([
      updatePackageCellPosition(data.CELL_ID, data.PACKAGE_ROWGUID),
      updateNewCellStatus(data.CELL_ID),
    ]);
  };

  static changePackagePosition = async (data: PackagePositionReq, createBy: User) => {
    const packageAllocated = await findPackageById(data.PACKAGE_ROWGUID);

    if (!packageAllocated) {
      throw new BadRequestError(`package allocation không tồn tại, vui lòng kiểm tra lại!`);
    }

    //2: tìm cell id của ô muốn chuyển đến, kiểm tra ô có chứa hàng không
    const cell = await findCellById(data.CELL_ID);

    if (!cell) {
      throw new BadRequestError(`Ô không không tồn tại trong kho!`);
    }

    if (cell.IS_FILLED) {
      throw new BadRequestError(
        `Ô ${cell.BLOCK_ID}-${cell.TIER_ORDERED}-${cell.SLOT_ORDERED} đã chứa hàng, xin vui lòng chọn ô khác!`,
      );
    }

    const { SEPARATED_PACKAGE_HEIGHT, SEPARATED_PACKAGE_WIDTH, SEPARATED_PACKAGE_LENGTH } =
      packageAllocated;
    const { CELL_HEIGHT, CELL_WIDTH, CELL_LENGTH } = cell;
    const cellVolumn = CELL_HEIGHT * CELL_WIDTH * CELL_LENGTH;
    const palletVolumn =
      SEPARATED_PACKAGE_HEIGHT * SEPARATED_PACKAGE_WIDTH * SEPARATED_PACKAGE_LENGTH;

    if (palletVolumn > cellVolumn) {
      throw new BadRequestError(`Kích thước pallet không phù hợp`);
    }

    if (
      SEPARATED_PACKAGE_HEIGHT > CELL_HEIGHT ||
      SEPARATED_PACKAGE_LENGTH > CELL_LENGTH ||
      SEPARATED_PACKAGE_WIDTH > CELL_WIDTH
    ) {
      throw new BadRequestError(`Kích thước pallet không phù hợp`);
    }

    return await Promise.all([
      updatePackageCellPosition(data.CELL_ID, data.PACKAGE_ROWGUID),
      updateNewCellStatus(data.CELL_ID),
      updateOldCellStatus(packageAllocated.CELL_ID),
    ]);
  };

  static getPackagePosition = async (warehouseCode: string) => {
    const packageAllocatedList = await getAllPackagePositionByWarehouseCode(warehouseCode);
    const groupPackageByBlock = _.groupBy(packageAllocatedList, 'BLOCK_ID');
    return groupPackageByBlock;
  };
}
export default CellService;
