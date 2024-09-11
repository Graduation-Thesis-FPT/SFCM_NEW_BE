import { Router } from 'express';
import { asyncHandler } from '../../utils';
import { authentication } from '../../auth/authUtils';
import { grantPermission } from '../../middlewares';
import customerController from '../../controllers/customer.controller';
import { validateCustomerRequest } from '../../middlewares/helpers/customerValidator';

const router = Router();

router.use(authentication);

router.post(
  '',
  asyncHandler(grantPermission),
  validateCustomerRequest,
  asyncHandler(customerController.createAndUpdateCustomer),
);
router.delete('', asyncHandler(grantPermission), asyncHandler(customerController.deleteCustomer));
router.get('', asyncHandler(customerController.getCustomer));

export default router;
