import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { users } from '$lib/server/schema';
import { createSession, setSessionCookie, verifyPassword } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const username = String(form.get('username') || '').trim();
		const password = String(form.get('password') || '');

		if (!username || !password) {
			return fail(400, { error: 'Username dan password wajib diisi.' });
		}

		const user = db.select().from(users).where(eq(users.username, username)).get();
		if (!user) {
			return fail(400, { error: 'Username atau password salah.' });
		}

		const valid = await verifyPassword(password, user.password);
		if (!valid) {
			return fail(400, { error: 'Username atau password salah.' });
		}

		const session = await createSession(user.id);
		setSessionCookie(cookies, session.id, session.expiresAt);

		throw redirect(302, '/dashboard');
	}
};
