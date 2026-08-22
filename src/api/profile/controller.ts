import type { Request, Response } from 'express';
import { AppError } from '../../common';
import { getProfileByUsername } from './service';

export const getProfile = async (req: Request, res: Response) => {
	try {
		const username = req.params.username as string;
		const response = await getProfileByUsername(username);

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
