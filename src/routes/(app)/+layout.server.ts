import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { masjids } from '$lib/server/schema';
import { validateSession } from '$lib/server/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const user = await validateSession(cookies);
	if (!user) {
		throw redirect(302, '/login');
	}

	const masjidList = db
		.select({ id: masjids.id, name: masjids.name })
		.from(masjids)
		.all();

	return { user, masjidList };
};
