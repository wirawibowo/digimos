import { error, fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { announcements, displaySettings, iqamahSettings, masjids, prayerSchedules } from '$lib/server/schema';
import { validateSession } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

const today = () => new Date().toISOString().slice(0, 10);

export const load: PageServerLoad = async ({ params, parent }) => {
	const { user } = await parent();
	if (user.role !== 'superadmin') throw error(403, 'Hanya superadmin yang dapat mengakses halaman ini');

	const masjidId = Number(params.masjidId);
	if (Number.isNaN(masjidId)) {
		throw error(404, 'Masjid tidak ditemukan');
	}

	const masjid = db.select().from(masjids).where(eq(masjids.id, masjidId)).get();
	if (!masjid) {
		throw error(404, 'Masjid tidak ditemukan');
	}

	const schedule = db
		.select()
		.from(prayerSchedules)
		.where(and(eq(prayerSchedules.masjidId, masjidId), eq(prayerSchedules.date, today())))
		.get();

	const iqamah = db
		.select()
		.from(iqamahSettings)
		.where(eq(iqamahSettings.masjidId, masjidId))
		.get();

	const announcementList = db
		.select()
		.from(announcements)
		.where(eq(announcements.masjidId, masjidId))
		.orderBy(announcements.sortOrder)
		.all();

	const displaySetting = db.select().from(displaySettings).where(eq(displaySettings.masjidId, masjidId)).get();
	const marqueeSpeed = displaySetting?.marqueeSpeed ?? 60;

	return { masjid, schedule, iqamah, announcementList, marqueeSpeed };
};

export const actions: Actions = {
	updateMasjid: async ({ request, params, cookies }) => {
		const currentUser = await validateSession(cookies);
		if (!currentUser || currentUser.role !== 'superadmin') throw error(403, 'Akses ditolak');
		const masjidId = Number(params.masjidId);
		const form = await request.formData();
		const name = String(form.get('name') || '').trim();
		const address = String(form.get('address') || '').trim();
		const phone = String(form.get('phone') || '').trim();
		const cityApiId = String(form.get('cityApiId') || '').trim();
		const cityName = String(form.get('cityName') || '').trim();
		const apiProvider = String(form.get('apiProvider') || 'myquran').trim();
		const apiMethod = String(form.get('apiMethod') || 'kemenag').trim();

		if (!name || !address || !cityApiId || !cityName) {
			return fail(400, { error: 'Nama, alamat, kota, dan kode kota wajib diisi.' });
		}

		await db
			.update(masjids)
			.set({
				name,
				address,
				phone: phone || '-',
				cityApiId,
				cityName,
				apiProvider,
				apiMethod,
				updatedAt: new Date().toISOString()
			})
			.where(eq(masjids.id, masjidId));

		return { success: true };
	},
	addAnnouncement: async ({ request, params, cookies }) => {
		const currentUser = await validateSession(cookies);
		if (!currentUser || currentUser.role !== 'superadmin') throw error(403, 'Akses ditolak');
		const masjidId = Number(params.masjidId);
		const form = await request.formData();
		const text = String(form.get('text') || '').trim();

		if (!text) {
			return fail(400, { error: 'Teks pengumuman wajib diisi.' });
		}

		await db.insert(announcements).values({
			masjidId,
			text,
			active: 1,
			sortOrder: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		});

		return { success: true };
	},
	deleteAnnouncement: async ({ request, params, cookies }) => {
		const currentUser = await validateSession(cookies);
		if (!currentUser || currentUser.role !== 'superadmin') throw error(403, 'Akses ditolak');
		const masjidId = Number(params.masjidId);
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (Number.isNaN(id)) {
			return fail(400, { error: 'Pengumuman tidak valid.' });
		}

		await db
			.delete(announcements)
			.where(and(eq(announcements.id, id), eq(announcements.masjidId, masjidId)));

		return { success: true };
	},
	updateMarqueeSpeed: async ({ request, params, cookies }) => {
		const currentUser = await validateSession(cookies);
		if (!currentUser || currentUser.role !== 'superadmin') throw error(403, 'Akses ditolak');
		const masjidId = Number(params.masjidId);
		const form = await request.formData();
		const marqueeSpeed = Number(form.get('marqueeSpeed') || 60);

		await db
			.update(displaySettings)
			.set({ marqueeSpeed, updatedAt: new Date().toISOString() })
			.where(eq(displaySettings.masjidId, masjidId));

		return { success: true };
	},
	updateIqamah: async ({ request, params, cookies }) => {
		const currentUser = await validateSession(cookies);
		if (!currentUser || currentUser.role !== 'superadmin') throw error(403, 'Akses ditolak');
		const masjidId = Number(params.masjidId);
		const form = await request.formData();
		const payload = {
			shubuh: Number(form.get('shubuh') || 10),
			dzuhur: Number(form.get('dzuhur') || 10),
			ashar: Number(form.get('ashar') || 10),
			maghrib: Number(form.get('maghrib') || 10),
			isya: Number(form.get('isya') || 10),
			syuruqRange: String(form.get('syuruqRange') || '06:10').trim()
		};

		await db
			.update(iqamahSettings)
			.set(payload)
			.where(eq(iqamahSettings.masjidId, masjidId));

		return { success: true };
	}
};
