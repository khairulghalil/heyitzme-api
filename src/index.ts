import express from 'express';
import cors from 'cors';
import { httpServerHandler } from 'cloudflare:node';
import { env } from 'cloudflare:workers';

import profileRoutes from './routes/profile';

import type { Env } from './types/env';

const app = express();

const workerEnv = env as unknown as Env;

app.use(
	cors({
		origin: ['http://localhost:5173', 'http://localhost:5500', 'https://heyitzme.com'],
	}),
);

app.use(express.json());

app.get('/', (req, res) => {
	res.json({
		message: 'HeyItzMe API is running',
	});
});

app.get('/health', (req, res) => {
	res.json({
		status: 'ok',
	});
});

app.use('/profile', profileRoutes);

app.listen(3000);

export default httpServerHandler({
	port: 3000,
});
