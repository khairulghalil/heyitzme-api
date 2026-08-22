import { StatusCodes } from 'http-status-codes';

export const ERROR_MESSAGES = {
	UNAUTHORIZED: {
		statusCode: StatusCodes.UNAUTHORIZED,
		message: 'UNAUTHORIZED',
	},

	FORBIDDEN: {
		statusCode: StatusCodes.FORBIDDEN,
		message: 'FORBIDDEN',
	},

	NOT_FOUND: {
		statusCode: StatusCodes.NOT_FOUND,
		message: 'NOT_FOUND',
	},

	INVALID_CREDENTIALS: {
		statusCode: StatusCodes.UNAUTHORIZED,
		message: 'INVALID_CREDENTIALS',
	},

	INTERNAL_SERVER_ERROR: {
		statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
		message: 'INTERNAL_SERVER_ERROR',
	},
} as const;
