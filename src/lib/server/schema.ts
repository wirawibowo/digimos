import { check, integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').notNull().unique(),
	password: text('password').notNull(),
	name: text('name').notNull(),
	role: text('role').notNull(),
	masjidId: integer('masjid_id'),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull()
}, (t) => ({
	roleCheck: check('role_check', sql`${t.role} in ('superadmin', 'admin')`)
}));

export const masjids = sqliteTable('masjids', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	address: text('address').notNull(),
	phone: text('phone').notNull(),
	cityApiId: text('city_api_id').notNull(),
	cityName: text('city_name').notNull(),
	apiProvider: text('api_provider').notNull().default('myquran'),
	apiMethod: text('api_method').notNull().default('kemenag'),
	logoUrl: text('logo_url'),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull()
});

export const displaySettings = sqliteTable('display_settings', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	masjidId: integer('masjid_id').notNull().references(() => masjids.id),
	theme: text('theme').notNull().default('t1'),
	accentColor: text('accent_color').notNull().default('#f0cd86'),
	bgMode: text('bg_mode').notNull().default('wallpaper'),
	bgImage: text('bg_image').notNull().default('masjid-bg.webp'),
	youtubeUrl: text('youtube_url'),
	clockFont: text('clock_font').notNull().default('Inter'),
	marqueeSpeed: integer('marquee_speed').notNull().default(60),
	showFrame: integer('show_frame').notNull().default(1),
	showLogo: integer('show_logo').notNull().default(1),
	showHijri: integer('show_hijri').notNull().default(1),
	adzanAuto: integer('adzan_auto').notNull().default(1),
	iqamahAuto: integer('iqamah_auto').notNull().default(1),
	adzanDuration: integer('adzan_duration').notNull().default(180),
	updatedAt: text('updated_at').notNull()
});

export const prayerSchedules = sqliteTable('prayer_schedules', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	masjidId: integer('masjid_id').notNull().references(() => masjids.id),
	date: text('date').notNull(),
	shubuh: text('shubuh').notNull(),
	syuruq: text('syuruq').notNull(),
	dzuhur: text('dzuhur').notNull(),
	ashar: text('ashar').notNull(),
	maghrib: text('maghrib').notNull(),
	isya: text('isya').notNull(),
	source: text('source').notNull().default('api')
}, (t) => ({
	unq: unique().on(t.masjidId, t.date)
}));

export const iqamahSettings = sqliteTable('iqamah_settings', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	masjidId: integer('masjid_id').notNull().references(() => masjids.id),
	shubuh: integer('shubuh').notNull().default(10),
	dzuhur: integer('dzuhur').notNull().default(10),
	ashar: integer('ashar').notNull().default(10),
	maghrib: integer('maghrib').notNull().default(10),
	isya: integer('isya').notNull().default(10),
	syuruqRange: text('syuruq_range').notNull().default('06:10')
});

export const announcements = sqliteTable('announcements', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	masjidId: integer('masjid_id').notNull().references(() => masjids.id),
	text: text('text').notNull(),
	active: integer('active').notNull().default(1),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull()
});

export const wallpapers = sqliteTable('wallpapers', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	masjidId: integer('masjid_id').notNull().references(() => masjids.id),
	filename: text('filename').notNull(),
	originalName: text('original_name').notNull(),
	sizeBytes: integer('size_bytes').notNull(),
	isDefault: integer('is_default').notNull().default(0),
	uploadedAt: text('uploaded_at').notNull()
});

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: integer('user_id').notNull().references(() => users.id),
	expiresAt: text('expires_at').notNull(),
	createdAt: text('created_at').notNull()
});
