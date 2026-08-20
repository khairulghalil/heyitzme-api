import type { Request, Response } from 'express';
import { loginByUsername } from './service';
import { createSupabaseClient } from '../../config/supabase';
import { env } from 'cloudflare:workers';
import type { Env } from '../../types/env';

export const login = async (req: Request, res: Response) => {
	try {
		const data = req.body;

		const supabase = createSupabaseClient(env as unknown as Env);

		const response = await loginByUsername(supabase, data);

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
