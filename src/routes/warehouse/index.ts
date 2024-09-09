import { Router } from 'express';
import { asyncHandler } from '../../utils';
import { authentication } from '../../auth/authUtils';
import warehouseController from '../../controllers/warehouse.controller';
import { grantPermission } from '../../middlewares';
import { validateWarehouseRequest } from '../../middlewares/helpers/warehouseValidator';

const router = Router();

router.use(authentication);

router.post(
  '',
  asyncHandler(grantPermission),
  validateWarehouseRequest,
  asyncHandler(warehouseController.createWarehouse),
);
router.delete('', asyncHandler(grantPermission), asyncHandler(warehouseController.deleteWarehouse));
router.get('', asyncHandler(warehouseController.getWarehouse));

export default router;
