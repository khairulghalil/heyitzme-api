import { env } from 'cloudflare:workers';
import { createSupabaseClient } from '../../config/supabase';
import type { Env } from '../../types/env';
import { transformKeys } from '../../common';

const workerEnv = env as unknown as Env;
const supabase = createSupabaseClient(workerEnv);

export const getProfileByUsername = async (username: string) => {
	const { data: user, error } = await supabase.from('profiles').select('*').eq('username', username).single();

	if (error || !user) {
		throw new Error('User not found');
	}

	const response = transformKeys(user);
	return response;
};
