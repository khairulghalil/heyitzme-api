import { env } from 'cloudflare:workers';
import { createSupabaseClient } from '../../config/supabase';
import type { Env } from '../../types/env';
import { transformKeys, AppError } from '../../common';
import { ERROR_MESSAGES } from '../../constants';

const workerEnv = env as unknown as Env;
const supabase = createSupabaseClient(workerEnv);

export const getProfileByUsername = async (username: string) => {
	const { data: user, error } = await supabase
		.from('profiles')
		.select('username, name, bio, profile_image, profile_image_ver, about, contact, social_media, theme, status')
		.eq('username', username)
		.single();

	if (error || !user) {
		throw new AppError(ERROR_MESSAGES.NOT_FOUND);
	}

	const response = transformKeys(user);
	return response;
};

export const updateProfileByUsername = async (username: string, data: Record<string, any>) => {
	// const { data: profile, error } = await supabase.from('profiles').update(data).eq('username', username).select().single();

	// if (error) {
	// 	throw error;
	// }

	// return profile;

	return { hye: 'hello' };
};
