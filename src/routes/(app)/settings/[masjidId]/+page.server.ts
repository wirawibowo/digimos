import { error, fail } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { displaySettings, masjids, wallpapers } from '$lib/server/schema';
import { validateSession } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ALLOWED_MIME: Record<string, string> = {
	'image/jpeg': '.jpg',
	'image/png': '.png',
	'image/webp': '.webp'
};

const YOUTUBE_RE = /^https:\/\/(www\.youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)/;

const defaultSettings = {
	theme: 't1',
	accentColor: '#f0cd86',
	bgMode: 'wallpaper',
	bgImage: 'masjid-bg.webp',
	youtubeUrl: null,
	clockFont: 'Inter',
	marqueeSpeed: 60,
	showFrame: 1,
	showLogo: 1,
	showHijri: 1,
	adzanAuto: 1,
	iqamahAuto: 1,
	adzanDuration: 180
};

export const load: PageServerLoad = async ({ params }) => {
	const masjidId = Number(params.masjidId);
	if (Number.isNaN(masjidId)) {
		throw error(404, 'Masjid tidak ditemukan');
	}

	const masjid = db.select().from(masjids).where(eq(masjids.id, masjidId)).get();
	if (!masjid) {
		throw error(404, 'Masjid tidak ditemukan');
	}

	let settings = db
		.select()
		.from(displaySettings)
		.where(eq(displaySettings.masjidId, masjidId))
		.get();

	if (!settings) {
		const now = new Date().toISOString();
		const inserted = db
			.insert(displaySettings)
			.values({
				masjidId,
				...defaultSettings,
				updatedAt: now
			})
			.returning()
			.get();

		settings = inserted ?? null;
	}

	const walls = db.select().from(wallpapers).where(eq(wallpapers.masjidId, masjidId)).all();

	return { masjid, settings: settings ?? null, wallpapers: walls };
};

export const actions: Actions = {
	updateSettings: async ({ request, params, cookies }) => {
		const currentUser = await validateSession(cookies);
		if (!currentUser) throw error(401, 'Tidak terautentikasi');
		const masjidId = Number(params.masjidId);
		if (currentUser.role !== 'superadmin' && currentUser.masjidId !== masjidId) throw error(403, 'Akses ditolak');

		const form = await request.formData();
		const theme = String(form.get('theme') || 't1').trim();
		const accentColor = String(form.get('accentColor') || '#f0cd86').trim();
		const bgMode = String(form.get('bgMode') || 'wallpaper').trim();
		const bgImage = String(form.get('bgImage') || 'masjid-bg.webp').trim();
		const youtubeUrlRaw = String(form.get('youtubeUrl') || '').trim();
		const clockFont = String(form.get('clockFont') || 'Inter').trim();
		const marqueeSpeed = Number(form.get('marqueeSpeed') || 60);
		const adzanDuration = Number(form.get('adzanDuration') || 180);
		const showFrame = form.get('showFrame') ? 1 : 0;
		const showLogo = form.get('showLogo') ? 1 : 0;
		const showHijri = form.get('showHijri') ? 1 : 0;
		const adzanAuto = form.get('adzanAuto') ? 1 : 0;
		const iqamahAuto = form.get('iqamahAuto') ? 1 : 0;

		if (!theme || !accentColor || !bgMode) {
			return fail(400, { error: 'Tema, warna aksen, dan mode background wajib diisi.' });
		}

		if (youtubeUrlRaw && !YOUTUBE_RE.test(youtubeUrlRaw)) {
			return fail(400, { error: 'URL YouTube tidak valid.' });
		}

		await db
			.update(displaySettings)
			.set({
				theme,
				accentColor,
				bgMode,
				bgImage,
				youtubeUrl: youtubeUrlRaw || null,
				clockFont,
				marqueeSpeed,
				showFrame,
				showLogo,
				showHijri,
				adzanAuto,
				iqamahAuto,
				adzanDuration,
				updatedAt: new Date().toISOString()
			})
			.where(eq(displaySettings.masjidId, masjidId));

		return { success: true };
	},

	uploadWallpaper: async ({ request, params, cookies }) => {
		const currentUser = await validateSession(cookies);
		if (!currentUser) throw error(401, 'Tidak terautentikasi');
		const masjidId = Number(params.masjidId);
		if (currentUser.role !== 'superadmin' && currentUser.masjidId !== masjidId) throw error(403, 'Akses ditolak');

		const form = await request.formData();
		const file = form.get('wallpaper') as File;

		if (!file || file.size === 0) {
			return fail(400, { uploadError: 'Pilih file gambar untuk diupload.' });
		}

		const ext = ALLOWED_MIME[file.type];
		if (!ext) {
			return fail(400, { uploadError: 'Hanya JPG, PNG, atau WebP yang diperbolehkan.' });
		}

		const uploadDir = path.join(process.cwd(), 'static', 'uploads', String(masjidId));
		await fs.mkdir(uploadDir, { recursive: true });

		const uniqueName = crypto.randomBytes(8).toString('hex') + ext;
		const filePath = path.join(uploadDir, uniqueName);

		if (!path.resolve(filePath).startsWith(path.resolve(uploadDir))) {
			return fail(400, { uploadError: 'Path tidak valid.' });
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		await fs.writeFile(filePath, buffer);

		await db.insert(wallpapers).values({
			masjidId,
			filename: uniqueName,
			originalName: file.name.slice(0, 255),
			sizeBytes: file.size,
			uploadedAt: new Date().toISOString()
		});

		return { uploadSuccess: true };
	},

	deleteWallpaper: async ({ request, params, cookies }) => {
		const currentUser = await validateSession(cookies);
		if (!currentUser) throw error(401, 'Tidak terautentikasi');
		const masjidId = Number(params.masjidId);
		if (currentUser.role !== 'superadmin' && currentUser.masjidId !== masjidId) throw error(403, 'Akses ditolak');

		const form = await request.formData();
		const id = Number(form.get('id'));

		if (!id) return fail(400, { deleteError: 'ID tidak valid' });

		const wp = db.select().from(wallpapers).where(and(eq(wallpapers.id, id), eq(wallpapers.masjidId, masjidId))).get();
		if (!wp) {
			return fail(404, { deleteError: 'Wallpaper tidak ditemukan' });
		}

		const filePath = path.join(process.cwd(), 'static', 'uploads', String(masjidId), wp.filename);
		try {
			await fs.unlink(filePath);
		} catch {
			// file may already be gone
		}

		await db.delete(wallpapers).where(eq(wallpapers.id, id));

		return { deleteSuccess: true };
	}
};
