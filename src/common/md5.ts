// Pure JS MD5 (RFC 1321) — Workers' SubtleCrypto does not support MD5, which toyyibPay requires for callback hash verification.
const rotateLeft = (value: number, shift: number) => (value << shift) | (value >>> (32 - shift));

const SHIFTS = [
	7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11,
	16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

// K[i] = floor(abs(sin(i + 1)) * 2^32), as defined by the MD5 spec.
const K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0);

const toLittleEndianHex = (value: number) => {
	const bytes = [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];
	return bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const md5 = (input: string): string => {
	const messageBytes = new TextEncoder().encode(input);
	const bitLength = messageBytes.length * 8;

	const paddedLength = ((messageBytes.length + 8) >> 6) * 64 + 64;
	const buffer = new Uint8Array(paddedLength);
	buffer.set(messageBytes);
	buffer[messageBytes.length] = 0x80;

	const view = new DataView(buffer.buffer);
	view.setUint32(paddedLength - 8, bitLength >>> 0, true);
	view.setUint32(paddedLength - 4, Math.floor(bitLength / 2 ** 32), true);

	let a0 = 0x67452301;
	let b0 = 0xefcdab89;
	let c0 = 0x98badcfe;
	let d0 = 0x10325476;

	for (let chunkStart = 0; chunkStart < paddedLength; chunkStart += 64) {
		const M = Array.from({ length: 16 }, (_, i) => view.getUint32(chunkStart + i * 4, true));

		let [a, b, c, d] = [a0, b0, c0, d0];

		for (let i = 0; i < 64; i++) {
			let f: number;
			let g: number;

			if (i < 16) {
				f = (b & c) | (~b & d);
				g = i;
			} else if (i < 32) {
				f = (d & b) | (~d & c);
				g = (5 * i + 1) % 16;
			} else if (i < 48) {
				f = b ^ c ^ d;
				g = (3 * i + 5) % 16;
			} else {
				f = c ^ (b | ~d);
				g = (7 * i) % 16;
			}

			f = (f + a + K[i] + M[g]) >>> 0;
			a = d;
			d = c;
			c = b;
			b = (b + rotateLeft(f, SHIFTS[i])) >>> 0;
		}

		a0 = (a0 + a) >>> 0;
		b0 = (b0 + b) >>> 0;
		c0 = (c0 + c) >>> 0;
		d0 = (d0 + d) >>> 0;
	}

	return [a0, b0, c0, d0].map(toLittleEndianHex).join('');
};
