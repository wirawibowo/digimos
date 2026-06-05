import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { masjids } from '$lib/server/schema';
import { validateSession } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	await parent();
	const masjidList = db.select().from(masjids).all();
	return { masjidList };
};

export const actions: Actions = {
	create: async ({ request, cookies }) => {
		const currentUser = await validateSession(cookies);
		if (!currentUser || currentUser.role !== 'superadmin') throw error(403, 'Akses ditolak');
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

		const now = new Date().toISOString();
		await db.insert(masjids).values({
			name,
			address,
			phone: phone || '-',
			cityApiId,
			cityName,
			apiProvider,
			apiMethod,
			logoUrl: null,
			createdAt: now,
			updatedAt: now
		});

		return { success: true };
	},
	update: async ({ request, cookies }) => {
		const currentUser = await validateSession(cookies);
		if (!currentUser || currentUser.role !== 'superadmin') throw error(403, 'Akses ditolak');
		const form = await request.formData();
		const id = Number(form.get('id'));
		const name = String(form.get('name') || '').trim();
		const address = String(form.get('address') || '').trim();
		const phone = String(form.get('phone') || '').trim();
		const cityApiId = String(form.get('cityApiId') || '').trim();
		const cityName = String(form.get('cityName') || '').trim();
		const apiProvider = String(form.get('apiProvider') || 'myquran').trim();
		const apiMethod = String(form.get('apiMethod') || 'kemenag').trim();

		if (!id || !name || !address || !cityApiId || !cityName) {
			return fail(400, { error: 'Semua field wajib diisi.' });
		}

		await db.update(masjids).set({
			name, address, phone: phone || '-', cityApiId, cityName, apiProvider, apiMethod, updatedAt: new Date().toISOString()
		}).where(eq(masjids.id, id));

		return { success: true };
	},
	delete: async ({ request, cookies }) => {
		const currentUser = await validateSession(cookies);
		if (!currentUser || currentUser.role !== 'superadmin') throw error(403, 'Akses ditolak');
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!id) return fail(400, { error: 'ID invalid' });

		// For simplicity, we just delete the masjid. 
		// Note: SQLite Foreign keys need to be handled if PRAGMA foreign_keys = ON
		// We'll delete dependents to be safe.
		const { displaySettings, iqamahSettings, announcements, prayerSchedules, wallpapers } = await import('$lib/server/schema');
		await db.delete(displaySettings).where(eq(displaySettings.masjidId, id));
		await db.delete(iqamahSettings).where(eq(iqamahSettings.masjidId, id));
		await db.delete(announcements).where(eq(announcements.masjidId, id));
		await db.delete(prayerSchedules).where(eq(prayerSchedules.masjidId, id));
		await db.delete(wallpapers).where(eq(wallpapers.masjidId, id));
		await db.delete(masjids).where(eq(masjids.id, id));
		return { success: true };
	}
};
