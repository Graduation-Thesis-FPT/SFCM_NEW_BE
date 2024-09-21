import { Router } from 'express';
import { asyncHandler } from '../../utils';
import { authentication } from '../../auth/authUtils';
import itemtypeController from '../../controllers/package-type.controller';
import { grantPermission } from '../../middlewares';
import { validateItemTypeRequest } from '../../middlewares/helpers/item-typeValidation';
import PackageTariffController from '../../controllers/package-tariff.controller';
import { validatePackageTariff } from '../../middlewares/helpers/packageTariffValidator';

const router = Router();

router.use(authentication);

router.post(
  '',
  asyncHandler(grantPermission),
  validatePackageTariff,
  asyncHandler(PackageTariffController.createPackageTariff),
);
router.delete(
  '',
  asyncHandler(grantPermission),
  asyncHandler(PackageTariffController.deletePackageTariff),
);
router.get('', asyncHandler(PackageTariffController.getPackageTariff));

export default router;
