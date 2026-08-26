import { Router } from 'express';
import { getProfile, updateProfile } from './controller';
import { requireAuth } from '../../middleware/auth';
import { parseMultipart } from '../../middleware/multipart';

const router = Router();

router.get('/:username', getProfile);

router.put('/:username', parseMultipart, requireAuth, updateProfile);

export default router;
