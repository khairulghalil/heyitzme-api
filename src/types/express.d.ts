import type { SupabaseClient } from '@supabase/supabase-js';

declare global {
	namespace Express {
		interface Request {
			supabase: SupabaseClient;
			file?: File;
			bannerFile?: File;
			logoFile?: File;
			user?: {
				id: string;
			};
		}
	}
}

export {};
