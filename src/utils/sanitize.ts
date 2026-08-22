export function sanitize<T extends Record<string, any>>(data: T, excludePaths: string[]): Partial<T> {
	const result = structuredClone(data);

	for (const path of excludePaths) {
		const keys = path.split('.');
		let current: any = result;

		for (let i = 0; i < keys.length - 1; i++) {
			if (current?.[keys[i]] == null) {
				current = null;
				break;
			}

			current = current[keys[i]];
		}

		if (current) {
			delete current[keys[keys.length - 1]];
		}
	}

	return result;
}
