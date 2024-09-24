import { Router } from 'express';
import { asyncHandler } from '../../utils';
import { authentication } from '../../auth/authUtils';
import { grantPermission } from '../../middlewares';
import PackageTariffController from '../../controllers/package-tariff.controller';
import { validatePackageTariffDetail } from '../../middlewares/helpers/packageTariffDetailValidator copy';
import packageTariffDetailController from '../../controllers/package-tariff-detail.controller';

const router = Router();

router.use(authentication);

router.post(
  '',
  // asyncHandler(grantPermission),
  validatePackageTariffDetail,
  asyncHandler(packageTariffDetailController.createPackageTariffDetail),
);
router.delete(
  '',
  asyncHandler(grantPermission),
  asyncHandler(packageTariffDetailController.deletePackageTariffDetail),
);
router.get('', asyncHandler(packageTariffDetailController.getPackageTariffDetail));

export default router;
