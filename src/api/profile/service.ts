import { env } from 'cloudflare:workers';
import { createSupabaseClient } from '../../config/supabase';
import type { Env } from '../../types/env';
import { ERROR_MESSAGES } from '../../constants';
import { AppError } from '../../common';
import { sanitize, keysToCamel, keysToSnake } from '../../utils';

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

	const response = keysToCamel(user);
	return response;
};

export const updateProfileByUsername = async (username: string, body: Record<string, any>) => {
	const transformedData = keysToSnake(body);
	const keysToExclude = [
		'id',
		'username',
		'profile_image',
		'profile_image_ver',
		'status.expiry_date',
		'created_at',
		'updated_at',
		'password_hash',
	];

	const sanitizedBody = sanitize(transformedData, keysToExclude);

	const { error } = await supabase.from('profiles').update(sanitizedBody).eq('username', username).select().single();

	if (error) {
		throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
	}

	return;
};
