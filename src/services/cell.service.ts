import { BadRequestError } from '../core/error.response';
import { Cell } from '../models/cell.model';
import {
  findCellByWarehouseCode,
  // , getAllAvailableCell
} from '../repositories/cell.repo';
import { findWarehouse } from '../repositories/warehouse.repo';
import _ from 'lodash';

class CellService {
  // static suggestCell = async (palletInfo: Pallet, warehouseCode: string) => {
  //   const warehouse = await findWarehouse(warehouseCode);
  //   if (!warehouse) {
  //     throw new BadRequestError(`Nhà kho ${warehouseCode} không tồn tại`);
  //   }
  //   if (!palletInfo.PALLET_HEIGHT || !palletInfo.PALLET_LENGTH || !palletInfo.PALLET_WIDTH) {
  //     throw new BadRequestError('Pallet phải có đủ chiều dài, rộng, cao');
  //   }
  //   const cell = await findCellByWarehouseCode(warehouseCode); // tìm cell theo warehouseCode có status = 0
  //   if (!cell.length) {
  //     throw new BadRequestError(`Không tìm thấy cell trong kho ${warehouseCode}`);
  //   }
  //   const groupCellByBlock = _.groupBy(cell, 'BLOCK_CODE');
  //   const newListCell = [];
  //   for (const block in groupCellByBlock) {
  //     newListCell.push(groupCellByBlock[block].sort((a, b) => a.TIER_ORDERED - b.TIER_ORDERED)[0]);
  //   }
  //   const cellVolume = newListCell.map(item => {
  //     return {
  //       ...item,
  //       VOLUME: item.CELL_LENGTH * item.CELL_WIDTH * item.CELL_HEIGHT,
  //     };
  //   });
  //   const cellVolumeFilter: Cell[] = cellVolume
  //     .filter(
  //       cell =>
  //         cell.CELL_HEIGHT >= palletInfo.PALLET_HEIGHT &&
  //         cell.CELL_LENGTH >= palletInfo.PALLET_LENGTH &&
  //         cell.CELL_WIDTH >= palletInfo.PALLET_WIDTH,
  //     )
  //     .sort((a, b) => a.VOLUME - b.VOLUME);
  //   const match = cellVolumeFilter.length > 0 ? cellVolumeFilter[0] : null;
  //   if (!match) {
  //     throw new BadRequestError('Không tìm thấy ô phù hợp');
  //   }
  //   if (
  //     palletInfo.PALLET_HEIGHT > match.CELL_HEIGHT ||
  //     palletInfo.PALLET_LENGTH > match.CELL_LENGTH ||
  //     palletInfo.PALLET_WIDTH > match.CELL_WIDTH
  //   ) {
  //     throw new BadRequestError('Kích thước pallet không phù hợp');
  //   }
  //   return { matchedCell: match, listCellSuggested: cellVolume };
  // };
  // static getAvailableCell = async (
  //   palletLength: number,
  //   palletWidth: number,
  //   palletHeight: number,
  // ) => {
  //   return await getAllAvailableCell({ palletLength, palletWidth, palletHeight });
  // };
}
export default CellService;
