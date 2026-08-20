import bcrypt from 'bcryptjs';
import type { SupabaseClient } from '@supabase/supabase-js';

export const loginByUsername = async (supabase: SupabaseClient, params: any) => {
	const { data: user, error } = await supabase.from('profiles').select('*').eq('username', params.username).single();

	if (error || !user) {
		throw new Error('Invalid username or password');
	}

	const passwordValid = await bcrypt.compare(params.password, user.password_hash);

	if (!passwordValid) {
		throw new Error('Invalid username or password');
	}

	const response = {
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

	return response;
};
