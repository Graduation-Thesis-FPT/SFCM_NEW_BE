import { Router } from 'express';
import exportOrderController from '../../controllers/export-order.controller';
import { asyncHandler } from '../../utils';

const router = Router();

// router.use(authentication);

router.post(
  '/calculate',
  // asyncHandler(grantPermission),
  asyncHandler(exportOrderController.calculateExport),
);
router.post(
  '/create',
  // asyncHandler(grantPermission),
  asyncHandler(exportOrderController.createExportOrder),
);

export default router;
