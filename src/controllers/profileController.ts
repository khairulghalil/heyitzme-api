import type { Request, Response } from 'express';
import { getProfileByUsername } from '../services/profileService';
import { createSupabaseClient } from '../config/supabase';
import { env } from 'cloudflare:workers';
import type { Env } from '../types/env';

export const getProfile = async (req: Request, res: Response) => {
	try {
		const username = req.params.username as string;
		const supabase = createSupabaseClient(env as unknown as Env);

		const response = await getProfileByUsername(supabase, username);

		res.json({
			success: true,
			data: response,
		});
	} catch (error) {
		console.error('Error:', error);

		res.status(500).json({
			success: false,
			message: 'An error occurred',
		});
	}
};
