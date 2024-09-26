import { Router } from 'express';
import { authentication } from '../../auth/authUtils';
import { asyncHandler } from '../../utils';
import { grantPermission } from '../../middlewares';
import customerOrderController from '../../controllers/customer-order.controller';
import importExportOrderController from '../../controllers/import-export-order.controller';

const router = Router();

router.use(authentication);
// router.get(
//   '',
//   asyncHandler(grantPermission),
//   asyncHandler(customerOrderController.getOrdersByCustomerId),
// );

router.get(
  '/',
  // asyncHandler(grantPermission),
  asyncHandler(importExportOrderController.getImportExportOrders),
);
router.get(
  '/order/:orderNo',
  asyncHandler(grantPermission),
  asyncHandler(customerOrderController.getOrderByOrderNo),
);
router.get(
  '/import-orders',
  // asyncHandler(grantPermission),
  asyncHandler(customerOrderController.getImportedOrders),
);
router.get(
  '/export-orders',
  asyncHandler(grantPermission),
  asyncHandler(customerOrderController.getExportedOrders),
);
export default router;
