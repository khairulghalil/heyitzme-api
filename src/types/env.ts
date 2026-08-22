export interface Env {
	ENV: 'development' | 'production';
	SUPABASE_URL: string;
	SUPABASE_SECRET_KEY: string;
	JWT_SECRET: string;
	JWT_EXPIRES_IN: string;
}
