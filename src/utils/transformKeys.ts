export function snakeToCamel(str: string): string {
	return str.replace(/([-_][a-z])/gi, (group) => group.toUpperCase().replace('-', '').replace('_', ''));
}

export function keysToCamel<T>(obj: T): T {
	if (Array.isArray(obj)) {
		return obj.map(keysToCamel) as T;
	}

	if (obj !== null && typeof obj === 'object') {
		return Object.entries(obj).reduce(
			(result, [key, value]) => {
				result[snakeToCamel(key)] = keysToCamel(value);
				return result;
			},
			{} as Record<string, unknown>,
		) as T;
	}

	return obj;
}

export function camelToSnake(str: string): string {
	return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function keysToSnake<T>(obj: T): T {
	if (Array.isArray(obj)) {
		return obj.map(keysToSnake) as T;
	}

	if (obj !== null && typeof obj === 'object') {
		return Object.entries(obj).reduce(
			(result, [key, value]) => {
				result[camelToSnake(key)] = keysToSnake(value);
				return result;
			},
			{} as Record<string, unknown>,
		) as T;
	}

	return obj;
}
