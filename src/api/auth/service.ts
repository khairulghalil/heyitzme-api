import bcrypt from 'bcryptjs';
import { env } from 'cloudflare:workers';
import { createSupabaseClient } from '../../config/supabase';
import type { Env } from '../../types/env';
import { generateToken } from '../../common';

const workerEnv = env as unknown as Env;
const supabase = createSupabaseClient(workerEnv);

export const loginByUsername = async (params: any) => {
	const { data: user, error } = await supabase.from('profiles').select('*').eq('username', params.username).single();

	if (error || !user) {
		throw new Error('Invalid username or password');
	}

	const passwordValid = await bcrypt.compare(params.password, user.password_hash);

	if (!passwordValid) {
		throw new Error('Invalid username or password');
	}

	const accessToken = await generateToken(user.username);

	const updUser = {
		username: user.username,
		name: user.name,
		bio: user.bio,
		profile_image: user.profile_image,
		profile_image_ver: user.profile_image_ver,
		about: user.about,
		contact: user.contact,
		social_media: user.social_media,
		theme: user.theme,
		status: user.status,
	};

	const response = {
		accessToken,
		user: updUser,
	};

	return response;
};
