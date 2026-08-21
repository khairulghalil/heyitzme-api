import type { Request, Response } from 'express';
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
		const error = err instanceof Error ? err.message : 'An error occurred';
		console.error(error);

		res.status(500).json({
			success: false,
			message: error,
		});
	}
};
