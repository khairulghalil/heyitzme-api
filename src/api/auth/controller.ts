import type { Request, Response } from 'express';
import { loginByUsername } from './service';

export const login = async (req: Request, res: Response) => {
	try {
		const data = req.body;
		const response = await loginByUsername(data);

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
