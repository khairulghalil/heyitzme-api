import { createClient } from '@supabase/supabase-js';
import type { Env } from '../types/env';

export const createSupabaseClient = (env: Env) => {
	return createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY);
};
