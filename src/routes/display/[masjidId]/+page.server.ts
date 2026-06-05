import { error } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { masjids, displaySettings, announcements, iqamahSettings, wallpapers } from '$lib/server/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const masjidId = Number(params.masjidId);
	if (Number.isNaN(masjidId)) throw error(404, 'Masjid not found');

	const masjid = db.select().from(masjids).where(eq(masjids.id, masjidId)).get();
	if (!masjid) throw error(404, 'Masjid not found');

	let settings = db.select().from(displaySettings).where(eq(displaySettings.masjidId, masjidId)).get();
	if (!settings) {
		// Provide default settings if not configured
		settings = {
			id: 0,
			masjidId: masjidId,
			theme: 't1',
			accentColor: '#f0cd86',
			bgMode: 'wallpaper',
			bgImage: 'masjid-bg.webp',
			youtubeUrl: '',
			clockFont: 'inter',
			marqueeSpeed: 60,
			adzanDuration: 4,
			showFrame: 1,
			showLogo: 1,
			showHijri: 1,
			adzanAuto: 1,
			iqamahAuto: 1,
			updatedAt: new Date().toISOString()
		};
	}

	const announcementList = db.select().from(announcements).where(eq(announcements.masjidId, masjidId)).orderBy(desc(announcements.createdAt)).all();
	const iqamah = db.select().from(iqamahSettings).where(eq(iqamahSettings.masjidId, masjidId)).get();

	// Fetch active wallpaper if needed
	let activeWallpaper = null;
	if (settings?.bgMode === 'wallpaper' && settings?.bgImage) {
		if (settings.bgImage.startsWith('/uploads/')) {
			activeWallpaper = settings.bgImage;
		} else {
			activeWallpaper = `/assets/${settings.bgImage}`;
		}
	}

	return {
		masjid,
		settings,
		announcements: announcementList,
		iqamah,
		activeWallpaper
	};
};
