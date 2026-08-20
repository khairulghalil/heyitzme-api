import type { SupabaseClient } from '@supabase/supabase-js';

export const getProfileByUsername = async (supabase: SupabaseClient, username: string) => {
	const { data, error } = await supabase.from('profiles').select('*').eq('username', username).single();

	if (error) {
		throw error;
	}

	return data;
};
