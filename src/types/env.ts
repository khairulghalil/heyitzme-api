export interface Env {
	ENV: 'development' | 'production';
	SUPABASE_URL: string;
	SUPABASE_SECRET_KEY: string;
	JWT_SECRET: string;
	JWT_EXPIRES_IN: string;
	PROFILE_IMAGES: R2Bucket;
	TOYYIBPAY_BASE_URL: string;
	TOYYIBPAY_SECRET_KEY: string;
	TOYYIBPAY_CATEGORY_CODE: string;
	TOYYIBPAY_RETURN_URL: string;
	TOYYIBPAY_CALLBACK_URL: string;
}
