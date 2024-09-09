import { Router } from 'express';
import userController from '../../controllers/user.controller';
import { asyncHandler } from '../../utils';
import { authentication } from '../../auth/authUtils';
import { grantPermission } from '../../middlewares';

const router = Router();

router.use(authentication);

router.get('/:id', asyncHandler(userController.findUserById));
router.get('', asyncHandler(grantPermission), asyncHandler(userController.getAllUser));
router.post('', asyncHandler(grantPermission), asyncHandler(userController.createUserAccount));
router.delete('/:id', asyncHandler(grantPermission), asyncHandler(userController.deleteUserById));
router.patch(
  '/deactive/:id',
  asyncHandler(grantPermission),
  asyncHandler(userController.deactivateUser),
);
router.patch(
  '/active/:id',
  asyncHandler(grantPermission),
  asyncHandler(userController.activateUser),
);

router.patch('/:userId', asyncHandler(userController.updateUser));
router.patch(
  '/reset-password/:userId',
  asyncHandler(grantPermission),
  asyncHandler(userController.resetPasswordById),
);

export default router;
