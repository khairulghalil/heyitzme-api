import type { Request, Response } from 'express';
import { AppError } from '../../common';
import { env } from 'cloudflare:workers';
import type { Env } from '../../types/env';
import { loginByUsername } from './service';

const workerEnv = env as unknown as Env;

export const login = async (req: Request, res: Response) => {
	try {
		const data = req.body;
		const response = await loginByUsername(data);

		const isProduction = workerEnv.ENV === 'production';

		res.cookie('access_token', response.accessToken, {
			httpOnly: true,
			secure: isProduction,
			sameSite: 'lax',
			path: '/',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		res.json({
			success: true,
			data: response.authHint,
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
