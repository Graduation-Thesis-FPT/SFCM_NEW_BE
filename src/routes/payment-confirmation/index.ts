import { Router } from 'express';
import { authentication } from '../../auth/authUtils';
import { asyncHandler } from '../../utils';
import { grantPermission } from '../../middlewares';
import paymentController from '../../controllers/payment.controller';

const router = Router();

router.use(authentication);
router.get(
  '/',
  asyncHandler(grantPermission),
  asyncHandler(paymentController.getAllPayments),
);
export default router;
