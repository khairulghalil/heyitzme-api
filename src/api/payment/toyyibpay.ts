import { md5 } from '../../common/md5';

const TOYYIBPAY_ENDPOINTS = {
	createBill: 'index.php/api/createBill',
	getBillTransactions: 'index.php/api/getBillTransactions',
	inactiveBill: 'index.php/api/inactiveBill',
} as const;

export interface ToyyibPayConfig {
	baseUrl: string;
	secretKey: string;
	categoryCode: string;
}

export interface CreateBillParams {
	billName: string;
	billDescription: string;
	billAmountCents: number;
	billTo: string;
	billEmail: string;
	billPhone: string;
	billReturnUrl: string;
	billCallbackUrl: string;
	billExternalReferenceNo: string;
}

export interface ToyyibPayTransaction {
	billName: string;
	billpaymentStatus: '1' | '2' | '3' | '4';
	billpaymentAmount: string;
	billpaymentInvoiceNo: string;
	billExternalReferenceNo: string;
	billPaymentDate?: string;
}

const postForm = async (config: ToyyibPayConfig, endpoint: string, fields: Record<string, string | number>) => {
	const body = new URLSearchParams();

	for (const [key, value] of Object.entries(fields)) {
		body.append(key, String(value));
	}

	const response = await fetch(`${config.baseUrl}/${endpoint}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body,
	});

	if (!response.ok) {
		throw new Error(`toyyibPay request failed with status ${response.status}`);
	}

	return response.json();
};

export const createBill = async (config: ToyyibPayConfig, params: CreateBillParams) => {
	const result = await postForm(config, TOYYIBPAY_ENDPOINTS.createBill, {
		userSecretKey: config.secretKey,
		categoryCode: config.categoryCode,
		billName: params.billName,
		billDescription: params.billDescription,
		billPriceSetting: 1,
		billPayorInfo: 1,
		billAmount: params.billAmountCents,
		billReturnUrl: params.billReturnUrl,
		billCallbackUrl: params.billCallbackUrl,
		billExternalReferenceNo: params.billExternalReferenceNo,
		billTo: params.billTo,
		billEmail: params.billEmail,
		billPhone: params.billPhone,
		billPaymentChannel: 0,
	});

	const billCode = Array.isArray(result) ? result[0]?.BillCode : undefined;

	if (!billCode) {
		throw new Error('toyyibPay did not return a bill code');
	}

	return {
		billCode: billCode as string,
		paymentUrl: `${config.baseUrl}/${billCode}`,
	};
};

export const getBillTransactions = async (config: ToyyibPayConfig, billCode: string) => {
	const result = await postForm(config, TOYYIBPAY_ENDPOINTS.getBillTransactions, {
		billCode,
	});

	return (Array.isArray(result) ? result : []) as ToyyibPayTransaction[];
};

export interface ToyyibPayCallbackPayload {
	refno: string;
	status: string;
	reason: string;
	billcode: string;
	order_id: string;
	amount: string;
	transaction_time?: string;
	hash: string;
}

export const verifyCallbackHash = (secretKey: string, payload: ToyyibPayCallbackPayload) => {
	const expectedHash = md5(`${secretKey}${payload.status}${payload.order_id}${payload.refno}ok`);
	return expectedHash === payload.hash;
};
