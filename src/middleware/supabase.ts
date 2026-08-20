import type { Request, Response, NextFunction } from 'express';
import { createSupabaseClient } from '../config/supabase';
import type { Env } from '../types/env';

export const supabaseMiddleware = (env: Env) => {
	return (req: Request, res: Response, next: NextFunction) => {
		req.supabase = createSupabaseClient(env);
		next();
	};
};
