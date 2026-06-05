import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { masjids } from '$lib/server/schema';
import { getMonthJadwal } from '$lib/server/prayer-api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const masjidId = Number(params.masjidId);
	if (Number.isNaN(masjidId)) {
		throw error(404, 'Masjid tidak ditemukan');
	}

	const masjid = db.select().from(masjids).where(eq(masjids.id, masjidId)).get();
	if (!masjid) {
		throw error(404, 'Masjid tidak ditemukan');
	}

	const now = new Date();
	const monthParam = url.searchParams.get('month');
	const yearParam = url.searchParams.get('year');

	const month = monthParam ? Number(monthParam) : now.getMonth() + 1;
	const year = yearParam ? Number(yearParam) : now.getFullYear();

	const schedules = await getMonthJadwal(masjidId, year, month);

	return {
		masjid,
		year,
		month,
		schedules: schedules || []
	};
};
