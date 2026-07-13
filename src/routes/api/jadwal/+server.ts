import { json } from '@sveltejs/kit';
import { getJadwal, getMonthJadwal } from '$lib/server/prayer-api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const masjidId = Number(url.searchParams.get('masjid_id'));
	const date = url.searchParams.get('date');
	const month = url.searchParams.get('month');
	const year = url.searchParams.get('year');

	if (!masjidId || Number.isNaN(masjidId)) {
		return json({ error: 'masjid_id wajib diisi' }, { status: 400 });
	}

	try {
		// If requesting for a single date
		if (date) {
			const jadwal = await getJadwal(masjidId, date);
			return json({ data: jadwal });
		}

		// If requesting for a whole month
		if (month && year) {
			const jadwalBulanan = await getMonthJadwal(masjidId, Number(year), Number(month));
			return json({ data: jadwalBulanan });
		}

		return json({ error: 'Param date atau (month & year) wajib diisi' }, { status: 400 });
	} catch (err: any) {
		return json({ error: err.message }, { status: 500 });
	}
};
