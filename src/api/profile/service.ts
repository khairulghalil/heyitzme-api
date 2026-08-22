import { env } from 'cloudflare:workers';
import { createSupabaseClient } from '../../config/supabase';
import type { Env } from '../../types/env';
import { transformKeys, AppError } from '../../common';
import { ERROR_MESSAGES } from '../../constants';

const workerEnv = env as unknown as Env;
const supabase = createSupabaseClient(workerEnv);

export const getProfileByUsername = async (username: string) => {
	const { data: user, error } = await supabase.from('profiles').select('*').eq('username', username).single();

	if (error || !user) {
		throw new AppError(ERROR_MESSAGES.NOT_FOUND);
	}

	const response = transformKeys(user);
	return response;
};
