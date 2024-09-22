import { Router } from 'express';
import { asyncHandler } from '../../utils';
import { authentication } from '../../auth/authUtils';
import { grantPermission } from '../../middlewares';
import { validateWarehouseRequest } from '../../middlewares/helpers/warehouseValidator';
import importOrderController from '../../controllers/import-order.controller';

const router = Router();

router.use(authentication);

router.get(
  '/import-vessel-customer',
  asyncHandler(importOrderController.loadImportVesselAnhCustomer),
);
router.get('/import-container', asyncHandler(importOrderController.loadImportContainer));
router.post(
  '/calculate',
  asyncHandler(grantPermission),
  asyncHandler(importOrderController.calculateImport),
);
router.post(
  '/save',
  asyncHandler(grantPermission),
  asyncHandler(importOrderController.saveImportOrder),
);

export default router;
