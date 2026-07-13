import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { users, masjids } from '$lib/server/schema';
import { validateSession } from '$lib/server/auth';
import bcrypt from 'bcryptjs';
import type { PageServerLoad, Actions } from './$types';

const VALID_ROLES = ['superadmin', 'admin'] as const;
const MIN_PASSWORD_LENGTH = 8;

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	if (user.role !== 'superadmin') {
		throw error(403, 'Hanya superadmin yang dapat mengakses halaman ini');
	}

	const userList = db.select().from(users).all();
	const masjidList = db.select().from(masjids).all();

	const usersWithMasjid = userList.map(u => {
		const m = masjidList.find(m => m.id === u.masjidId);
		return {
			...u,
			masjidName: m ? m.name : 'Semua Masjid'
		};
	});

	return {
		users: usersWithMasjid,
		masjids: masjidList
	};
};

export const actions: Actions = {
	createUser: async ({ request, cookies }) => {
		const currentUser = await validateSession(cookies);
		if (!currentUser || currentUser.role !== 'superadmin') throw error(403, 'Akses ditolak');

		const data = await request.formData();
		const username = data.get('username') as string;
		const password = data.get('password') as string;
		const name = data.get('name') as string;
		const role = data.get('role') as string;
		const masjidIdStr = data.get('masjidId') as string;

		if (!username || !password || !name || !role) {
			return fail(400, { error: 'Semua field wajib diisi' });
		}

		if (password.length < MIN_PASSWORD_LENGTH) {
			return fail(400, { error: `Password minimal ${MIN_PASSWORD_LENGTH} karakter` });
		}

		if (!VALID_ROLES.includes(role as typeof VALID_ROLES[number])) {
			return fail(400, { error: 'Role tidak valid' });
		}

		try {
			const passwordHash = await bcrypt.hash(password, 10);
			const masjidId = masjidIdStr ? Number(masjidIdStr) : null;

			db.insert(users).values({
				username,
				password: passwordHash,
				name,
				role,
				masjidId,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			}).run();

			return { success: true };
		} catch (err: unknown) {
			if (err instanceof Error && err.message.includes('UNIQUE')) {
				return fail(400, { error: 'Username sudah dipakai' });
			}
			console.error('createUser error:', err);
			return fail(500, { error: 'Terjadi kesalahan server' });
		}
	},
	deleteUser: async ({ request, cookies }) => {
		const currentUser = await validateSession(cookies);
		if (!currentUser || currentUser.role !== 'superadmin') throw error(403, 'Akses ditolak');

		const data = await request.formData();
		const id = Number(data.get('id'));

		if (!id) return fail(400, { error: 'ID tidak valid' });

		try {
			db.delete(users).where(eq(users.id, id)).run();
			return { success: true };
		} catch (err: unknown) {
			console.error('deleteUser error:', err);
			return fail(500, { error: 'Terjadi kesalahan server' });
		}
	}
};
