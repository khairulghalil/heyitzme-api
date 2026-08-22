import { Router } from 'express';
import { getProfile, updateProfile } from './controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.get('/:username', getProfile);

router.put('/:username', requireAuth, updateProfile);

export default router;
