import type { Request, Response } from 'express';
import { AppError } from '../../common';
import { getProfileByUsername, updateProfileByUsername } from './service';
import { ERROR_MESSAGES } from '../../constants';

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

export const updateProfile = async (req: Request, res: Response) => {
	try {
		const { username } = req.params;

		if (req.user?.id !== username) {
			throw new AppError(ERROR_MESSAGES.FORBIDDEN);
		}

		const dataString = req.body.data;

		if (typeof dataString !== 'string') {
			throw new AppError(ERROR_MESSAGES.BAD_REQUEST);
		}

		const data = JSON.parse(dataString);
		const image = req.file ?? null;

		const banner = req.bannerFile ?? null;

		const response = await updateProfileByUsername(
			username as string,
			data,
			image instanceof File ? image : null,
			banner instanceof File ? banner : null,
		);

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
