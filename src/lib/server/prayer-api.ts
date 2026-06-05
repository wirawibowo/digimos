import { db } from './db';
import { prayerSchedules, masjids } from './schema';
import { and, eq, gte, lte } from 'drizzle-orm';

interface Schedule {
	date: string;
	shubuh: string;
	syuruq: string;
	dzuhur: string;
	ashar: string;
	maghrib: string;
	isya: string;
}

interface MyQuranJadwalItem {
	date: string;
	subuh: string;
	terbit: string;
	dzuhur: string;
	ashar: string;
	maghrib: string;
	isya: string;
}

interface AlAdhanTimings {
	Fajr: string;
	Sunrise: string;
	Dhuhr: string;
	Asr: string;
	Maghrib: string;
	Isha: string;
}

interface AlAdhanItem {
	date: { gregorian: { date: string } };
	timings: AlAdhanTimings;
}

export async function getJadwal(masjidId: number, dateStr: string): Promise<Schedule | null> {
	// dateStr is YYYY-MM-DD
	const existing = db
		.select()
		.from(prayerSchedules)
		.where(and(eq(prayerSchedules.masjidId, masjidId), eq(prayerSchedules.date, dateStr)))
		.get();

	if (existing) {
		return existing;
	}

	// Not in DB, try to fetch single day or sync whole month
	const [year, month] = dateStr.split('-');
	const synced = await syncMonth(masjidId, Number(year), Number(month));
	
	if (synced && synced.length > 0) {
		const found = synced.find(s => s.date === dateStr);
		if (found) return found;
	}

	return null;
}

export async function getMonthJadwal(masjidId: number, year: number, month: number) {
	const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
	const endStr = `${year}-${String(month).padStart(2, '0')}-31`;

	const records = db
		.select()
		.from(prayerSchedules)
		.where(
			and(
				eq(prayerSchedules.masjidId, masjidId),
				gte(prayerSchedules.date, startStr),
				lte(prayerSchedules.date, endStr)
			)
		)
		.all();

	// If we have fewer than 28 days, maybe we need to sync
	if (records.length < 28) {
		return await syncMonth(masjidId, year, month);
	}

	return records;
}

export async function syncMonth(masjidId: number, year: number, month: number) {
	const masjid = db.select().from(masjids).where(eq(masjids.id, masjidId)).get();
	if (!masjid) return null;

	let newSchedules: Schedule[] = [];

	if (masjid.apiProvider === 'myquran') {
		newSchedules = await fetchFromMyQuran(masjid.cityApiId, year, month);
	} else if (masjid.apiProvider === 'aladhan') {
		newSchedules = await fetchFromAlAdhan(masjid.cityName, year, month, masjid.apiMethod);
	}

	if (!newSchedules || newSchedules.length === 0) return null;

	// Prepare data to insert
	const inserts = newSchedules.map(s => ({
		masjidId,
		date: s.date,
		shubuh: s.shubuh,
		syuruq: s.syuruq,
		dzuhur: s.dzuhur,
		ashar: s.ashar,
		maghrib: s.maghrib,
		isya: s.isya,
		source: 'api'
	}));

	// Delete old records for this month to avoid duplicates
	const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
	const endStr = `${year}-${String(month).padStart(2, '0')}-31`;
	
	db.delete(prayerSchedules)
		.where(
			and(
				eq(prayerSchedules.masjidId, masjidId),
				gte(prayerSchedules.date, startStr),
				lte(prayerSchedules.date, endStr)
			)
		)
		.run();

	// Bulk insert
	const inserted = db.insert(prayerSchedules).values(inserts).returning().all();
	return inserted;
}

async function fetchFromMyQuran(cityId: string, year: number, month: number): Promise<Schedule[]> {
	try {
		const url = `https://api.myquran.com/v2/sholat/jadwal/${cityId}/${year}/${String(month).padStart(2, '0')}`;
		const res = await fetch(url);
		const json = await res.json() as { status?: boolean; data?: { jadwal?: MyQuranJadwalItem[] } };

		if (!json.status || !json.data?.jadwal) {
			return [];
		}

		return json.data.jadwal.map((j) => ({
			date: j.date,
			shubuh: j.subuh,
			syuruq: j.terbit,
			dzuhur: j.dzuhur,
			ashar: j.ashar,
			maghrib: j.maghrib,
			isya: j.isya
		}));
	} catch (err) {
		console.error('MyQuran fetch error:', err);
		return [];
	}
}

async function fetchFromAlAdhan(cityName: string, year: number, month: number, method: string | null): Promise<Schedule[]> {
	try {
		// Default to method 20 (Kemenag Indonesia)
		const methodId = method && method.toLowerCase() !== 'kemenag' ? method : '20';
		const url = `https://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${encodeURIComponent(cityName)}&country=Indonesia&method=${methodId}`;
		const res = await fetch(url);
		const json = await res.json() as { code?: number; data?: AlAdhanItem[] };

		if (json.code !== 200 || !json.data) {
			return [];
		}

		const cleanTime = (t: string) => t.split(' ')[0];

		return json.data.map((item) => {
			// Format date from DD-MM-YYYY to YYYY-MM-DD
			const [dd, mm, yyyy] = item.date.gregorian.date.split('-');
			return {
				date: `${yyyy}-${mm}-${dd}`,
				shubuh: cleanTime(item.timings.Fajr),
				syuruq: cleanTime(item.timings.Sunrise),
				dzuhur: cleanTime(item.timings.Dhuhr),
				ashar: cleanTime(item.timings.Asr),
				maghrib: cleanTime(item.timings.Maghrib),
				isya: cleanTime(item.timings.Isha)
			};
		});
	} catch (err) {
		console.error('AlAdhan fetch error:', err);
		return [];
	}
}
