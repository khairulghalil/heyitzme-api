import type { SupabaseClient } from '@supabase/supabase-js';

declare global {
	namespace Express {
		interface Request {
			supabase: SupabaseClient;
			user?: {
				id: string;
			};
		}
	}
}

export {};
