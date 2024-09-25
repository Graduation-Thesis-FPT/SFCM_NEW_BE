import { Router } from 'express';
import { authentication } from '../../auth/authUtils';
import exportOrderController from '../../controllers/export-order.controller';
import { grantPermission } from '../../middlewares';
import { asyncHandler } from '../../utils';

const router = Router();

router.use(authentication);

router.post(
  '/calculate',
  asyncHandler(grantPermission),
  asyncHandler(exportOrderController.calculateExportOrder),
);
router.post(
  '/create',
  asyncHandler(grantPermission),
  asyncHandler(exportOrderController.createExportOrder),
);

router.get(
  '/package-can-export',
  asyncHandler(exportOrderController.getPackageCanExportByConsigneeId),
);

router.get('/suggest', asyncHandler(exportOrderController.getAllCustomerCanExportOrders));

router.get('/doc', asyncHandler(exportOrderController.getExportOrderForDocById));

router.get(
  '/:id',
  asyncHandler(grantPermission),
  asyncHandler(exportOrderController.getExportOrder),
);
router.get('/', asyncHandler(grantPermission), asyncHandler(exportOrderController.getExportOrders));

export default router;
