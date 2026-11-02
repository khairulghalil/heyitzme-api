import type { Request, Response } from 'express';
import { AppError } from '../../common';
import { getProfileByUsername, getProfileImageFromR2, updateProfileByUsername } from './service';
import { ERROR_MESSAGES } from '../../constants';

export const getProfile = async (req: Request, res: Response) => {
	try {
		const username = req.params.username as string;
		const apiOrigin = `${req.protocol}://${req.get('host')}`;
		const response = await getProfileByUsername(username, apiOrigin);

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

export const getProfileImageProxy = async (req: Request, res: Response) => {
	try {
		const imageUrl = req.query.url;
		if (typeof imageUrl !== 'string') {
			throw new AppError(ERROR_MESSAGES.BAD_REQUEST);
		}

		const imageResponse = await getProfileImageFromR2(imageUrl);
		imageResponse.headers.forEach((value, key) => res.setHeader(key, value));

		if (!imageResponse.body) {
			return res.status(imageResponse.status).end();
		}

		const imageBytes = await imageResponse.arrayBuffer();
		return res.status(imageResponse.status).end(Buffer.from(imageBytes));
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
		const logo = req.logoFile ?? null;

		const response = await updateProfileByUsername(
			username as string,
			data,
			image instanceof File ? image : null,
			banner instanceof File ? banner : null,
			logo instanceof File ? logo : null,
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
