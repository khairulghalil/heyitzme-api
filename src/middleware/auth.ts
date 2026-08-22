import { env } from 'cloudflare:workers';
import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../common/jwt';
import type { Env } from '../types/env';
import { AppError } from '../common';
import { ERROR_MESSAGES } from '../constants';

const workerEnv = env as unknown as Env;

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.cookies.access_token;

		if (!token) {
			throw new AppError(ERROR_MESSAGES.UNAUTHORIZED);
		}

		const user = await verifyToken(token, workerEnv.JWT_SECRET);

		if (!user?.sub) {
			throw new AppError(ERROR_MESSAGES.UNAUTHORIZED);
		}

		req.user = {
			id: user.sub,
		};

		next();
	} catch (err) {
		const error = err instanceof AppError ? err.message : 'An error occurred';
		const statusCode = err instanceof AppError ? err.statusCode : 500;

		res.status(statusCode).json({
			success: false,
			message: error,
		});
	}
};
