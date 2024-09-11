import { BadRequestError } from '../core/error.response';
import { User } from '../entity/user.entity';
import {
  checkDuplicateBlock,
  createBlockandCell,
  deleteBlockMany,
  getAllBlock,
  isValidWarehouseCode,
  updateBlock,
  checkCellStatus,
  getAllCell,
} from '../repositories/block.repo';
import { Block, BlockListInfo } from '../models/block.model';
class BlockService {
  static createAndUpdateBlockAndCell = async (blockListInfo: BlockListInfo, createBy: User) => {
    const insertData = blockListInfo.insert;
    const updateData = blockListInfo.update;

    let newCreatedBlock: Block[] = [];
    let updatedBlock;
    if (insertData.length) {
      for (const blockInfo of insertData) {
        const block = await isValidWarehouseCode(blockInfo.WAREHOUSE_ID);

        if (!block) {
          throw new BadRequestError(`Kho ${blockInfo.WAREHOUSE_ID} không tồn tại`);
        }

        const isDuplicateBlock = await checkDuplicateBlock(blockInfo.ID);
        if (isDuplicateBlock) {
          throw new BadRequestError(
            // `Không thể thêm dãy ${blockInfo.BLOCK_NAME} ở kho ${blockInfo.WAREHOUSE_CODE} (Đã tồn tại)`,
            `Mã dãy ${blockInfo.ID} đã tồn tại`,
          );
        }

        blockInfo.CREATED_BY = createBy.ROWGUID;
        blockInfo.UPDATED_BY = createBy.ROWGUID;
        blockInfo.UPDATED_AT = new Date();
      }

      newCreatedBlock = await createBlockandCell(insertData);
    }

    if (updateData.length) {
      const cellArrStatus = await checkCellStatus(updateData.map(e => e.ID));
      if (cellArrStatus.length) {
        throw new BadRequestError(
          `Không thể cập nhật mã dãy ${cellArrStatus.map(e => e.BLOCK_ID).join(', ')} đang hoạt động`,
        );
      }
      for (const blockInfo of updateData) {
        blockInfo.CREATED_BY = createBy.ROWGUID;
        blockInfo.UPDATED_BY = createBy.ROWGUID;
        blockInfo.UPDATED_AT = new Date();
      }
      updatedBlock = await updateBlock(updateData);
    }

    return {
      newCreatedBlock,
      updatedBlock,
    };
  };

  static deleteBlockNCell = async (blockListID: string[]) => {
    const cellArrStatus = await checkCellStatus(blockListID);
    if (cellArrStatus.length) {
      throw new BadRequestError(
        `Không thể xóa mã dãy ${cellArrStatus.map(e => e.BLOCK_ID).join(', ')} vì dãy đang hoạt động`,
      );
    }
    return await deleteBlockMany(blockListID);
  };

  static getAllBlock = async () => {
    return await getAllBlock();
  };

  static getAllCell = async (WAREHOUSE_CODE: string, BLOCK_CODE: string) => {
    return await getAllCell(WAREHOUSE_CODE, BLOCK_CODE);
  };
}
export default BlockService;
