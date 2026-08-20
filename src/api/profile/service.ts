import type { SupabaseClient } from '@supabase/supabase-js';
import { transformKeys } from '../../utils';

export const getProfileByUsername = async (supabase: SupabaseClient, username: string) => {
	const { data: user, error } = await supabase.from('profiles').select('*').eq('username', username).single();

	if (error || !user) {
		throw new Error('User not found');
	}

	const response = transformKeys(user);
	return response;
};
