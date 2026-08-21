import { SignJWT, jwtVerify } from 'jose';
import { env } from 'cloudflare:workers';
import type { Env } from '../types/env';

const workerEnv = env as unknown as Env;

export async function generateToken(userId: string) {
	const secret = new TextEncoder().encode(workerEnv.JWT_SECRET);
	const expiresIn = workerEnv.JWT_EXPIRES_IN;

	return new SignJWT({
		sub: userId,
	})
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(expiresIn)
		.sign(secret);
}

export async function verifyToken(token: string, jwtSecret: string) {
	const secret = new TextEncoder().encode(jwtSecret);

	const { payload } = await jwtVerify(token, secret);

	return payload;
}
