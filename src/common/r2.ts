export const uploadImageToR2 = async (bucket: R2Bucket, prefix: string, image: File) => {
	const safeFilename = image.name.replace(/[^a-zA-Z0-9._-]/g, '_');
	const normalizedPrefix = prefix.replace(/^\/|\/$/g, '');
	const imageKey = `${normalizedPrefix}/${safeFilename}`;

	await bucket.put(imageKey, await image.arrayBuffer(), {
		httpMetadata: {
			contentType: image.type || 'application/octet-stream',
		},
	});

	return imageKey;
};

export const deleteImageFromR2 = async (bucket: R2Bucket, imageKey: string) => {
	await bucket.delete(imageKey);
};
