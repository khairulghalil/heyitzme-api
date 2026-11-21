import bcrypt from 'bcryptjs';
import { env } from 'cloudflare:workers';
import { createSupabaseClient } from '../../config/supabase';
import type { Env } from '../../types/env';
import { generateToken, durationToMs, AppError } from '../../common';
import { ERROR_MESSAGES } from '../../constants';

const workerEnv = env as unknown as Env;
const supabase = createSupabaseClient(workerEnv);

export const loginByUsername = async (params: any) => {
	const { data: user, error } = await supabase.from('profiles').select('password_hash').eq('username', params.username).single();

	if (error || !user) {
		throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS);
	}

	const passwordValid = await bcrypt.compare(params.password, user.password_hash);

	if (!passwordValid) {
		throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS);
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

export const changeUserPassword = async (params: any) => {
	const { data: data, error } = await supabase.from('profiles').select('password_hash').eq('username', params.username).single();

	if (error || !data) {
		throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS);
	}

	const passwordValid = await bcrypt.compare(params.currentPassword, data.password_hash);

	if (!passwordValid) {
		throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS);
	}

	const newPasswordHash = await bcrypt.hash(params.newPassword, 10);

	const { error: updateError } = await supabase.from('profiles').update({ password_hash: newPasswordHash }).eq('username', params.username);

	if (updateError) {
		throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
	}

	return;
};
