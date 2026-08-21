import bcrypt from 'bcryptjs';
import { env } from 'cloudflare:workers';
import { createSupabaseClient } from '../../config/supabase';
import type { Env } from '../../types/env';
import { generateToken, durationToMs } from '../../common';

const workerEnv = env as unknown as Env;
const supabase = createSupabaseClient(workerEnv);

export const loginByUsername = async (params: any) => {
	const { data: user, error } = await supabase.from('profiles').select('password_hash').eq('username', params.username).single();

	if (error || !user) {
		throw new Error('Invalid username or password');
	}

	const passwordValid = await bcrypt.compare(params.password, user.password_hash);

	if (!passwordValid) {
		throw new Error('Invalid username or password');
	}

	const accessToken = await generateToken(params.username);

	const authHint = {
		user: params.username,
		expiresAt: Date.now() + durationToMs(workerEnv.JWT_EXPIRES_IN),
	};

	const encodedAuthHint = btoa(JSON.stringify(authHint));

	const response = {
		accessToken,
		authHint: encodedAuthHint,
	};

	return response;
};
