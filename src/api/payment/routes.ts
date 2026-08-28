import { Router } from 'express';
import { createPayment, getPaymentStatus, paymentCallback } from './controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.post('/create', requireAuth, createPayment);
router.post('/callback', paymentCallback);
router.get('/status/:billCode', requireAuth, getPaymentStatus);

export default router;
