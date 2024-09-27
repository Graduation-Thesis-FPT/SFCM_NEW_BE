import { Router } from 'express';
import { authentication } from '../../auth/authUtils';
import paymentController from '../../controllers/payment.controller';
import { grantPermission } from '../../middlewares';
import { asyncHandler } from '../../utils';

const router = Router();

router.use(authentication);
router.get('/', asyncHandler(grantPermission), asyncHandler(paymentController.getAllPayments));

router.post(
  '/',
  asyncHandler(grantPermission),
  asyncHandler(paymentController.updatePaymentStatus),
);
export default router;
