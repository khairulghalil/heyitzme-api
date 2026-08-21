import type { Request, Response } from 'express';
import { loginByUsername } from './service';

export const login = async (req: Request, res: Response) => {
	try {
		const data = req.body;
		const response = await loginByUsername(data);

		res.setHeader(
			'Set-Cookie',
			`access_token=${response.accessToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 7}`,
		);

		res.json({
			success: true,
			data: response.authHint,
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
