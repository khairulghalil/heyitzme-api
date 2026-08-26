import { env } from 'cloudflare:workers';
import { createSupabaseClient } from '../../config/supabase';
import type { Env } from '../../types/env';
import { ERROR_MESSAGES } from '../../constants';
import { AppError } from '../../common';
import { keysToCamel, keysToSnake } from '../../utils';

const workerEnv = env as unknown as Env;
const supabase = createSupabaseClient(workerEnv);

export const getProfileByUsername = async (username: string) => {
	const { data: user, error } = await supabase
		.from('profiles')
		.select('username, name, bio, profile_image, profile_image_ver, about, contact, social_media, theme, status, expires_at')
		.eq('username', username)
		.single();

	if (error || !user) {
		throw new AppError(ERROR_MESSAGES.NOT_FOUND);
	}

	const response = keysToCamel(user);
	return response;
};

export const updateProfileByUsername = async (username: string, body: Record<string, any>, image?: File | null) => {
	let imageKey: string | null = null;

	if (image) {
		imageKey = await uploadImageToR2(username, image);
		console.log('Uploaded image to R2 with key:', imageKey);
	}

	if (image && !imageKey) {
		throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
	}

	const toUpdate = {
		name: body.name,
		bio: body.bio,
		profile_image: body.profileImage,
		profile_image_ver: body.profileImageVer,
		about: body.about,
		contact: body.contact,
		social_media: body.socialMedia,
		theme: body.theme,
		status: body.status,
		updated_at: new Date().toISOString(),
		...(imageKey ? { profile_image: imageKey } : {}),
	};

	const transformedData = keysToSnake(toUpdate);

	const { data: user, error } = await supabase
		.from('profiles')
		.update(transformedData)
		.eq('username', username)
		.select('username, name, bio, profile_image, profile_image_ver, about, contact, social_media, theme, status, expires_at')
		.single();

	if (error) {
		throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
	}

	return keysToCamel(user);
};

const uploadImageToR2 = async (username: string, image: File) => {
	const safeFilename = image.name.replace(/[^a-zA-Z0-9._-]/g, '_');
	const imageKey = `profiles/${username}/${safeFilename}`;

	await workerEnv.PROFILE_IMAGES.put(imageKey, await image.arrayBuffer(), {
		httpMetadata: {
			contentType: image.type || 'application/octet-stream',
		},
	});

	return imageKey;
};
