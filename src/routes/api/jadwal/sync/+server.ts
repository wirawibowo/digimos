import { json, error } from '@sveltejs/kit';
import { syncMonth } from '$lib/server/prayer-api';
import { validateSession } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const user = await validateSession(cookies);
	if (!user) throw error(401, 'Tidak terautentikasi');

	try {
		const body = await request.json();
		const masjidId = Number(body.masjid_id);
		const month = Number(body.month);
		const year = Number(body.year);

		if (!masjidId || !month || !year) {
			return json({ error: 'masjid_id, month, dan year wajib diisi' }, { status: 400 });
		}

		if (user.role !== 'superadmin' && user.masjidId !== masjidId) {
			throw error(403, 'Akses ditolak');
		}

		const synced = await syncMonth(masjidId, year, month);

		if (!synced || synced.length === 0) {
			return json({ error: 'Gagal sinkronisasi data dari API' }, { status: 500 });
		}

		return json({ success: true, data: synced });
	} catch (err: unknown) {
		if (err instanceof Response) throw err;
		console.error('sync error:', err);
		return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
	}
};
