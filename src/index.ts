import express from 'express';
import cors from 'cors';
import { httpServerHandler } from 'cloudflare:node';
import apiRoutes from './api/routes';

const app = express();

app.use(
	cors({
		origin: ['http://localhost:5173', 'http://localhost:5500', 'https://heyitzme.com', 'https://heyitzme-ui.pages.dev'],
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
		message: 'HeyItzMe API',
	});
});

app.use('/', apiRoutes);

app.listen(3000);

export default httpServerHandler({
	port: 3000,
});
