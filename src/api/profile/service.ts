import bcrypt from 'bcryptjs';
import { env } from 'cloudflare:workers';
import { createSupabaseClient } from '../../config/supabase';
import type { Env } from '../../types/env';
import { ERROR_MESSAGES } from '../../constants';
import { AppError, logger, uploadImageToR2, deleteImageFromR2 } from '../../common';
import { keysToCamel, keysToSnake } from '../../utils';

const workerEnv = env as unknown as Env;
const supabase = createSupabaseClient(workerEnv);

export const getProfileByUsername = async (username: string) => {
	const { data: user, error } = await supabase
		.from('profiles')
		.select(
			'username, name, bio, profile_image, profile_image_ver, about, additional_section, contact, social_media, theme, banner_bg, banner_bg_ver, logo_image, logo_image_ver, registered_email, status, expires_at',
		)
		.eq('username', username)
		.single();

	if (error || !user) {
		throw new AppError(ERROR_MESSAGES.NOT_FOUND);
	}

	const response = keysToCamel(user);
	return response;
};

export const updateProfileByUsername = async (
	username: string,
	body: Record<string, any>,
	image?: File | null,
	banner?: File | null,
	logo?: File | null,
) => {
	let imageKey: string | null = null;
	let bannerKey: string | null = null;
	let logoKey: string | null = null;

	if (image) {
		logger.info('Uploading image to R2...');
		imageKey = await uploadImageToR2(workerEnv.PROFILE_IMAGES, `profiles/${username}`, image);
	}

	if (image && !imageKey) {
		logger.error('Error uploading image to R2, aborting profile update...');
		throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
	}

	if (body.bannerBgCustom === true && banner) {
		logger.info('Uploading banner to R2...');
		bannerKey = await uploadImageToR2(workerEnv.PROFILE_IMAGES, `banners/${username}`, banner);

		if (!bannerKey) {
			if (imageKey) await deleteImageFromR2(workerEnv.PROFILE_IMAGES, imageKey);
			logger.error('Error uploading banner to R2, aborting profile update...');
			throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
		}
	}

	if (logo) {
		logger.info('Uploading logo to R2...');
		logoKey = await uploadImageToR2(workerEnv.PROFILE_IMAGES, `logos/${username}`, logo);

		if (!logoKey) {
			if (imageKey) await deleteImageFromR2(workerEnv.PROFILE_IMAGES, imageKey);
			if (bannerKey) await deleteImageFromR2(workerEnv.PROFILE_IMAGES, bannerKey);
			logger.error('Error uploading logo to R2, aborting profile update...');
			throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
		}
	}

	logger.info('Updating profile in DB...');

	let newPasswordHash: string | null = null;
	if (body.currentPassword && body.newPassword) {
		newPasswordHash = await handlePasswordUpdate(username, body.currentPassword, body.newPassword);
	}

	const toUpdate = {
		name: body.name,
		bio: body.bio,
		profile_image: body.profileImage,
		profile_image_ver: body.profileImageVer,
		about: body.about,
		additional_section: body.additionalSection,
		contact: body.contact,
		social_media: body.socialMedia,
		theme: body.theme,
		registered_email: body.registeredEmail,
		status: body.status,
		updated_at: new Date().toISOString(),
		...(imageKey ? { profile_image: imageKey } : {}),
		...(bannerKey
			? { banner_bg: bannerKey, banner_bg_ver: body.bannerBgVer }
			: body.bannerBgCustom === false && body.bannerBg
				? { banner_bg: body.bannerBg }
				: {}),
		...(logoKey ? { logo_image: logoKey, logo_image_ver: body.logoImageVer } : {}),
		...(newPasswordHash ? { password_hash: newPasswordHash } : {}),
	};

	const transformedData = keysToSnake(toUpdate);

	const { data: user, error } = await supabase
		.from('profiles')
		.update(transformedData)
		.eq('username', username)
		.select(
			'username, name, bio, profile_image, profile_image_ver, about, additional_section, contact, social_media, theme, banner_bg, banner_bg_ver, logo_image, logo_image_ver, registered_email,status, expires_at',
		)
		.single();

	if (error) {
		if (logoKey) {
			logger.error('Error on DB update, deleting recent logo upload from R2...');
			await deleteImageFromR2(workerEnv.PROFILE_IMAGES, logoKey);
		}

		if (bannerKey) {
			logger.error('Error on DB update, deleting recent banner upload from R2...');
			await deleteImageFromR2(workerEnv.PROFILE_IMAGES, bannerKey);
		}

		if (image && imageKey) {
			logger.error('Error on DB update, deleting recent image upload from R2...');
			await deleteImageFromR2(workerEnv.PROFILE_IMAGES, imageKey);
		}

		throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
	}

	if (image && imageKey) {
		const previousImageKey = `profiles/${username}/${username}-${user?.profile_image_ver - 1 || 0}.png`; // Assuming the previous image key format is known
		logger.info('Deleting previous image from R2...');
		await deleteImageFromR2(workerEnv.PROFILE_IMAGES, previousImageKey);
	}

	if (bannerKey) {
		const previousBannerKey = `banners/${username}/${username}-banner-${user?.banner_bg_ver - 1 || 0}.png`;
		logger.info('Deleting previous banner from R2...');
		await deleteImageFromR2(workerEnv.PROFILE_IMAGES, previousBannerKey);
	}

	if (logoKey) {
		const previousLogoKey = `logos/${username}/${username}-logo-${user?.logo_image_ver - 1 || 0}.png`;
		logger.info('Deleting previous logo from R2...');
		await deleteImageFromR2(workerEnv.PROFILE_IMAGES, previousLogoKey);
	}

	return keysToCamel(user);
};

const handlePasswordUpdate = async (username: string, currentPassword: string, newPassword: string) => {
	const { data: userPassword, error } = await supabase.from('profiles').select('password_hash').eq('username', username).single();

	if (error || !userPassword) {
		throw new AppError(ERROR_MESSAGES.FORBIDDEN);
	}

	const passwordValid = await bcrypt.compare(currentPassword, userPassword.password_hash);

	if (!passwordValid) {
		throw new AppError(ERROR_MESSAGES.FORBIDDEN);
	}

	const newPasswordHash = await bcrypt.hash(newPassword, 10);

	return newPasswordHash;
};
