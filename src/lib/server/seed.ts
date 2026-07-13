import bcrypt from 'bcryptjs';
import { db } from './db';
import {
	announcements,
	displaySettings,
	iqamahSettings,
	masjids,
	users,
	wallpapers
} from './schema';

const now = new Date().toISOString();

async function seed() {
	const rawPassword = process.env.SEED_PASSWORD;
	if (!rawPassword) throw new Error('Set SEED_PASSWORD environment variable before seeding');
	const passwordHash = await bcrypt.hash(rawPassword, 10);

	const masjid = db
		.insert(masjids)
		.values({
			name: 'Masjid Nurul Himmah',
			address: 'Depok, Jawa Barat',
			phone: '-',
			cityApiId: '0314',
			cityName: 'Depok',
			apiProvider: 'myquran',
			apiMethod: 'kemenag',
			logoUrl: null,
			createdAt: now,
			updatedAt: now
		})
		.returning()
		.get();

	if (!masjid) {
		throw new Error('Failed to seed masjid');
	}

	await db.insert(users).values({
		username: 'admin',
		password: passwordHash,
		name: 'Super Admin',
		role: 'superadmin',
		masjidId: null,
		createdAt: now,
		updatedAt: now
	});

	await db.insert(displaySettings).values({
		masjidId: masjid.id,
		theme: 't1',
		accentColor: '#f0cd86',
		bgMode: 'wallpaper',
		bgImage: 'masjid-bg.webp',
		youtubeUrl: null,
		clockFont: 'Inter',
		marqueeSpeed: 60,
		showFrame: 1,
		showLogo: 1,
		showHijri: 1,
		adzanAuto: 1,
		iqamahAuto: 1,
		adzanDuration: 180,
		updatedAt: now
	});

	await db.insert(iqamahSettings).values({
		masjidId: masjid.id,
		shubuh: 10,
		dzuhur: 10,
		ashar: 10,
		maghrib: 10,
		isya: 10,
		syuruqRange: '06:10'
	});

	await db.insert(announcements).values([
		{
			masjidId: masjid.id,
			text: 'Selamat datang di Masjid Nurul Himmah',
			active: 1,
			sortOrder: 0,
			createdAt: now,
			updatedAt: now
		},
		{
			masjidId: masjid.id,
			text: 'Mohon matikan atau senyapkan ponsel selama sholat',
			active: 1,
			sortOrder: 1,
			createdAt: now,
			updatedAt: now
		},
		{
			masjidId: masjid.id,
			text: 'Kajian rutin setiap Jumat malam',
			active: 1,
			sortOrder: 2,
			createdAt: now,
			updatedAt: now
		},
		{
			masjidId: masjid.id,
			text: 'Infaq dan sedekah dapat disalurkan melalui kotak amal',
			active: 1,
			sortOrder: 3,
			createdAt: now,
			updatedAt: now
		},
		{
			masjidId: masjid.id,
			text: 'Mari jaga kebersihan dan ketertiban masjid',
			active: 1,
			sortOrder: 4,
			createdAt: now,
			updatedAt: now
		}
	]);

	await db.insert(wallpapers).values([
		{
			masjidId: masjid.id,
			filename: 'masjid-bg.webp',
			originalName: 'masjid-bg.webp',
			sizeBytes: 0,
			isDefault: 1,
			uploadedAt: now
		},
		{
			masjidId: masjid.id,
			filename: 'masjid-1.webp',
			originalName: 'masjid-1.webp',
			sizeBytes: 0,
			isDefault: 0,
			uploadedAt: now
		},
		{
			masjidId: masjid.id,
			filename: 'masjid-2.webp',
			originalName: 'masjid-2.webp',
			sizeBytes: 0,
			isDefault: 0,
			uploadedAt: now
		},
		{
			masjidId: masjid.id,
			filename: 'masjid-3.webp',
			originalName: 'masjid-3.webp',
			sizeBytes: 0,
			isDefault: 0,
			uploadedAt: now
		}
	]);
}

seed().catch((error) => {
	console.error(error);
	process.exit(1);
});
