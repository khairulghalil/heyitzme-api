import { Router } from 'express';

import authRoutes from './auth/routes';
import profileRoutes from './profile/routes';
import paymentRoutes from './payment/routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/payment', paymentRoutes);

export default router;
