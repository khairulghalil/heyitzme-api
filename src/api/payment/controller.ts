import type { Request, Response } from 'express';
import { AppError } from '../../common';
import { createPaymentService, getPaymentStatusService, handlePaymentCallback } from './service';
import { ERROR_MESSAGES } from '../../constants';
import type { ToyyibPayCallbackPayload } from './toyyibpay';

export const createPayment = async (req: Request, res: Response) => {
	try {
		const response = await createPaymentService(req.body);

		res.json({
			success: true,
			data: response,
		});
	} catch (err) {
		const error = err instanceof AppError ? err.message : 'An error occurred';
		const statusCode = err instanceof AppError ? err.statusCode : 500;

		res.status(statusCode).json({
			success: false,
			message: error,
		});
	}
};

export const paymentCallback = async (req: Request, res: Response) => {
	try {
		await handlePaymentCallback(req.body as ToyyibPayCallbackPayload);

		res.status(200).send('OK');
	} catch (err) {
		const statusCode = err instanceof AppError ? err.statusCode : 500;

		res.status(statusCode).send('FAILED');
	}
};

export const getPaymentStatus = async (req: Request, res: Response) => {
	try {
		const { billCode } = req.params;

		if (typeof billCode !== 'string') {
			throw new AppError(ERROR_MESSAGES.BAD_REQUEST);
		}

		const response = await getPaymentStatusService(billCode);

		res.json({
			success: true,
			data: response,
		});
	} catch (err) {
		const error = err instanceof AppError ? err.message : 'An error occurred';
		const statusCode = err instanceof AppError ? err.statusCode : 500;

		res.status(statusCode).json({
			success: false,
			message: error,
		});
	}
};
