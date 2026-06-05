import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { masjids, iqamahSettings, displaySettings } from '$lib/server/schema';
import { validateSession } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const masjidId = Number(params.masjidId);
	if (Number.isNaN(masjidId)) throw error(404, 'Masjid tidak ditemukan');

	const masjid = db.select().from(masjids).where(eq(masjids.id, masjidId)).get();
	if (!masjid) throw error(404, 'Masjid tidak ditemukan');

	const iqamah = db.select().from(iqamahSettings).where(eq(iqamahSettings.masjidId, masjidId)).get();
	const settings = db.select().from(displaySettings).where(eq(displaySettings.masjidId, masjidId)).get();

	return {
		masjid,
		iqamah: iqamah ?? { shubuh: 10, dzuhur: 10, ashar: 10, maghrib: 10, isya: 10, syuruqRange: '06:10' },
		adzanDuration: settings?.adzanDuration ?? 180,
		adzanAuto: settings?.adzanAuto ?? 1,
		iqamahAuto: settings?.iqamahAuto ?? 1
	};
};

export const actions: Actions = {
	saveIqamah: async ({ request, params, cookies }) => {
		const currentUser = await validateSession(cookies);
		if (!currentUser) throw error(401, 'Tidak terautentikasi');
		const masjidId = Number(params.masjidId);
		if (currentUser.role !== 'superadmin' && currentUser.masjidId !== masjidId) throw error(403, 'Akses ditolak');
		const form = await request.formData();

		const shubuh = Number(form.get('shubuh') || 10);
		const dzuhur = Number(form.get('dzuhur') || 10);
		const ashar = Number(form.get('ashar') || 10);
		const maghrib = Number(form.get('maghrib') || 10);
		const isya = Number(form.get('isya') || 10);
		const syuruqRange = String(form.get('syuruqRange') || '06:10').trim();

		const existing = db.select().from(iqamahSettings).where(eq(iqamahSettings.masjidId, masjidId)).get();

		if (existing) {
			await db.update(iqamahSettings)
				.set({ shubuh, dzuhur, ashar, maghrib, isya, syuruqRange })
				.where(eq(iqamahSettings.masjidId, masjidId));
		} else {
			await db.insert(iqamahSettings).values({ masjidId, shubuh, dzuhur, ashar, maghrib, isya, syuruqRange });
		}

		return { success: true };
	},

	saveAdzan: async ({ request, params, cookies }) => {
		const currentUser = await validateSession(cookies);
		if (!currentUser) throw error(401, 'Tidak terautentikasi');
		const masjidId = Number(params.masjidId);
		if (currentUser.role !== 'superadmin' && currentUser.masjidId !== masjidId) throw error(403, 'Akses ditolak');
		const form = await request.formData();

		const adzanDuration = Number(form.get('adzanDuration') || 180);
		const adzanAuto = form.get('adzanAuto') ? 1 : 0;
		const iqamahAuto = form.get('iqamahAuto') ? 1 : 0;

		if (adzanDuration < 30 || adzanDuration > 3600) {
			return fail(400, { error: 'Durasi adzan harus antara 30–3600 detik.' });
		}

		await db.update(displaySettings)
			.set({ adzanDuration, adzanAuto, iqamahAuto, updatedAt: new Date().toISOString() })
			.where(eq(displaySettings.masjidId, masjidId));

		return { success: true };
	}
};
