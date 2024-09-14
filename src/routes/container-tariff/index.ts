import { Router } from 'express';
import { asyncHandler } from '../../utils';
import { authentication } from '../../auth/authUtils';
import { grantPermission } from '../../middlewares';
import ConatinerTariffController from '../../controllers/container-tariff.controller';
import { validateContainerRequest } from '../../middlewares/helpers/container-tariffValidator';

const router = Router();

router.use(authentication);

router.post(
  '',
  asyncHandler(grantPermission),
  validateContainerRequest,
  asyncHandler(ConatinerTariffController.createAndUpdateConatinerTariff),
);
router.delete(
  '',
  asyncHandler(grantPermission),
  asyncHandler(ConatinerTariffController.deleteConatinerTariff),
);
router.get(
  '',
  asyncHandler(grantPermission),
  asyncHandler(ConatinerTariffController.getConatinerTariff),
);

export default router;
