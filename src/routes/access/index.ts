import { Router } from 'express';
import accessController from '../../controllers/access.controller';
import { asyncHandler } from '../../utils';
import { authentication, verifyRefreshToken } from '../../auth/authUtils';

const router = Router();

router.post('/login', asyncHandler(accessController.login));

router.post(
  '/refresh-token',
  verifyRefreshToken,
  asyncHandler(accessController.handlerRefreshToken),
);

router.patch(
  '/change-default-password/:userId',
  asyncHandler(accessController.changeDefaultPassword),
);

router.use(authentication);
router.patch('/change-password', asyncHandler(accessController.changePassword));

export default router;
