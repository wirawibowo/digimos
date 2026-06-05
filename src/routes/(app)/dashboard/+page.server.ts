import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { masjids, prayerSchedules } from '$lib/server/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const masjidList = db.select().from(masjids).all();
	const totalMasjidRow = db
		.select({ count: sql<number>`count(*)` })
		.from(masjids)
		.get();

	let nextPrayer = 'Belum sinkron';
	let nextTime = '--:--';
	
	if (masjidList.length > 0) {
		const today = new Date();
		const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
		const schedule = db.select().from(prayerSchedules).where(sql`${prayerSchedules.masjidId} = ${masjidList[0].id} AND ${prayerSchedules.date} = ${dateStr}`).get();
		if (schedule) {
			const now = today.getHours() * 3600 + today.getMinutes() * 60;
			const p = [
				{ name: 'Shubuh', time: schedule.shubuh },
				{ name: 'Dzuhur', time: schedule.dzuhur },
				{ name: 'Ashar', time: schedule.ashar },
				{ name: 'Maghrib', time: schedule.maghrib },
				{ name: 'Isya', time: schedule.isya }
			];
			for (const s of p) {
				const [h, m] = s.time.split(':').map(Number);
				if (h * 3600 + m * 60 > now) {
					nextPrayer = s.name;
					nextTime = s.time;
					break;
				}
			}
			if (nextPrayer === 'Belum sinkron') {
				nextPrayer = 'Shubuh (Besok)';
				nextTime = p[0].time;
			}
		}
	}

	return {
		masjidList,
		totalMasjid: totalMasjidRow?.count ?? 0,
		nextPrayer,
		nextTime
	};
};
