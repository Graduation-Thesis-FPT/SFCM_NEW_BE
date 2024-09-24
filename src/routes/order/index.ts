import { Router } from 'express';
import { authentication } from '../../auth/authUtils';
import importExportOrderController from '../../controllers/import-export-order.controller';
import { grantPermission } from '../../middlewares';
import { asyncHandler } from '../../utils';

const router = Router();

router.use(authentication);

router.get(
  '/',
  asyncHandler(grantPermission),
  asyncHandler(importExportOrderController.getImportExportOrders),
);

export default router;
