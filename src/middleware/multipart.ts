import type { NextFunction, Request, Response } from 'express';
import { isMultipartRequest, MultipartParseError, parseMultipartRequest } from '@mjackson/multipart-parser/node';

export const parseMultipart = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!isMultipartRequest(req)) {
			return next();
		}

		const parts = parseMultipartRequest(req, { maxFileSize: 10 * 1024 * 1024 });
		const fields: Record<string, string> = {};

		for await (const part of parts) {
			if (part.isFile && part.filename) {
				if (part.name === 'image') {
					req.file = new File([part.arrayBuffer], part.filename, {
						type: part.mediaType ?? 'application/octet-stream',
					});
				}
			} else if (part.name) {
				fields[part.name] = part.text;
			}
		}

		req.body = fields;
		next();
	} catch (error) {
		if (error instanceof MultipartParseError) {
			return res.status(400).json({
				success: false,
				message: 'Invalid multipart form data',
			});
		}

		return next(error);
	}
};