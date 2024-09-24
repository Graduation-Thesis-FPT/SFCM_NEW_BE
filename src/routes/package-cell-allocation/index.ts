import { Router } from 'express';
import { asyncHandler } from '../../utils';
import { authentication } from '../../auth/authUtils';
import { grantPermission } from '../../middlewares';
import packageCellAllocationController from '../../controllers/package-cell-allocation.controller';
import { validatePackageAllocation } from '../../middlewares/helpers/packageCellAllocationValidator';

const router = Router();

router.use(authentication);

// danh sách các package chuẩn bị đưa vào kho
router.get(
  '/ready-to-warehouse',
  asyncHandler(grantPermission),
  asyncHandler(packageCellAllocationController.getReadyToWarehouse),
);

// lấy tất cả container đã import
router.get(
  '/imported-containers',
  asyncHandler(grantPermission),
  asyncHandler(packageCellAllocationController.getAllImportedContainer),
);

// danh sách cách package trong container
router.get(
  '/voyage-package/:CONTAINER_ID',
  asyncHandler(grantPermission),
  asyncHandler(packageCellAllocationController.getImportTallyContainerInfo),
);

// xác nhận hoàn thành việc tách package
router.patch(
  '/complete/:VOYAGE_CONTAINER_PACKAGE_ID',
  asyncHandler(grantPermission),
  asyncHandler(packageCellAllocationController.completePackageSeparate),
);

// lấy các package đã tách theo voyage_container_package_id
router.get(
  '/:VOYAGE_CONTAINER_PACKAGE_ID',
  asyncHandler(grantPermission),
  asyncHandler(packageCellAllocationController.getAllPackageCellById),
);

// thêm mới hoặc cập nhật package allocation
router.post(
  '',
  asyncHandler(grantPermission),
  validatePackageAllocation,
  asyncHandler(packageCellAllocationController.insertAndUpdatePackageAllocation),
);

export default router;
