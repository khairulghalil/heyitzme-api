import { env } from 'cloudflare:workers';
import type { Env } from '../../types/env';
import { ERROR_MESSAGES } from '../../constants';
import { AppError, logger } from '../../common';
import { createBill, getBillTransactions, verifyCallbackHash, type ToyyibPayCallbackPayload } from './toyyibpay';

const workerEnv = env as unknown as Env;

const toyyibPayConfig = () => ({
	baseUrl: workerEnv.TOYYIBPAY_BASE_URL,
	secretKey: workerEnv.TOYYIBPAY_SECRET_KEY,
	categoryCode: workerEnv.TOYYIBPAY_CATEGORY_CODE,
});

export interface CreatePaymentInput {
	amount: number;
	billName: string;
	billDescription: string;
	billTo: string;
	billEmail: string;
	billPhone: string;
	externalReferenceNo?: string;
}

export const createPaymentService = async (params: CreatePaymentInput) => {
	if (!params.amount || !params.billName || !params.billEmail || !params.billPhone) {
		throw new AppError(ERROR_MESSAGES.BAD_REQUEST);
	}

	const externalReferenceNo = params.externalReferenceNo ?? crypto.randomUUID();

	try {
		const bill = await createBill(toyyibPayConfig(), {
			billName: params.billName,
			billDescription: params.billDescription,
			billAmountCents: Math.round(params.amount * 100),
			billTo: params.billTo,
			billEmail: params.billEmail,
			billPhone: params.billPhone,
			billReturnUrl: workerEnv.TOYYIBPAY_RETURN_URL,
			billCallbackUrl: workerEnv.TOYYIBPAY_CALLBACK_URL,
			billExternalReferenceNo: externalReferenceNo,
		});

		return { ...bill, externalReferenceNo };
	} catch (error) {
		logger.error('toyyibPay createBill failed', error);
		throw new AppError(ERROR_MESSAGES.PAYMENT_GATEWAY_ERROR);
	}
};

export const handlePaymentCallback = async (payload: ToyyibPayCallbackPayload) => {
	if (!verifyCallbackHash(workerEnv.TOYYIBPAY_SECRET_KEY, payload)) {
		logger.warn('Rejected toyyibPay callback with invalid hash', { billcode: payload.billcode });
		throw new AppError(ERROR_MESSAGES.UNAUTHORIZED);
	}

	logger.info('toyyibPay callback verified', {
		billcode: payload.billcode,
		orderId: payload.order_id,
		status: payload.status,
	});

	// Persist payment status against your own order/subscription record here,
	// e.g. by matching `payload.order_id` to a row in Supabase.
};

export const getPaymentStatusService = async (billCode: string) => {
	if (!billCode) {
		throw new AppError(ERROR_MESSAGES.BAD_REQUEST);
	}

	try {
		return await getBillTransactions(toyyibPayConfig(), billCode);
	} catch (error) {
		logger.error('toyyibPay getBillTransactions failed', error);
		throw new AppError(ERROR_MESSAGES.PAYMENT_GATEWAY_ERROR);
	}
};
