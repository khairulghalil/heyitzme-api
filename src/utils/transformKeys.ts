export function snakeToCamel(str: string): string {
	return str.replace(/([-_][a-z])/gi, (group) => group.toUpperCase().replace('-', '').replace('_', ''));
}

export function transformKeys<T>(obj: T): T {
	if (Array.isArray(obj)) {
		return obj.map(transformKeys) as T;
	}

	if (obj !== null && typeof obj === 'object') {
		return Object.entries(obj).reduce(
			(result, [key, value]) => {
				result[snakeToCamel(key)] = transformKeys(value);
				return result;
			},
			{} as Record<string, unknown>,
		) as T;
	}

	return obj;
}
